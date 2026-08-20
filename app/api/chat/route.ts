import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getAIProvider, AI_CONFIG } from "@/lib/ai";
import { toolRegistry } from "@/lib/tools";
import { extractMemoryFromText } from "@/lib/memory/extractor";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/memory/retriever";
import { generateConversationTitle } from "@/utils/title-generator";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { chatRequestSchema } from "@/lib/security/input-validator";
import { formatSafeErrorResponse } from "@/lib/security/error-sanitizer";
import { detectLanguage } from "@/lib/i18n/detector";
import type { AIMessage } from "@/types/ai.types";

export const runtime = "nodejs";

/**
 * Intelligent Intent & Parameter Extractor for Agent Tools
 */
function analyzeAgentToolIntent(query: string): { toolName: string; input: Record<string, any> } | null {
  const text = query.trim();
  const lower = text.toLowerCase();

  // 1. Calculator: Detect arithmetic expressions
  const calcMatch =
    text.match(/(?:what is|calculate|compute|evaluate)?\s*([0-9+\-*/^%().,a-z\s×÷]+[0-9%)]|\b\d+\s*[\+\-\*\/×÷\^%]\s*\d+)/i);

  if (
    calcMatch &&
    (text.includes("×") ||
      text.includes("÷") ||
      /\d+\s*[\+\-\*\/\^%]\s*\d+/.test(text) ||
      lower.startsWith("what is ") && /\d/.test(lower) && !lower.includes("weather") && !lower.includes("time") && !lower.includes("news") ||
      lower.includes("calculate") ||
      lower.includes("sqrt("))
  ) {
    const rawExpr = calcMatch[1]?.replace(/(?:what is|calculate|compute|evaluate)/gi, "").trim() || text;
    if (rawExpr) {
      return {
        toolName: "calculator",
        input: { expression: rawExpr },
      };
    }
  }

  // 2. Weather
  if (
    lower.includes("weather") ||
    lower.includes("temperature") ||
    lower.includes("forecast") ||
    lower.includes("how hot is it") ||
    lower.includes("how cold is it")
  ) {
    const locMatch = text.match(/(?:in|at|for)\s+([a-zA-Z\s,]+)/i);
    const location = locMatch ? locMatch[1]?.replace(/[?.!]/g, "").trim() : "Current Location";
    return {
      toolName: "weather",
      input: { location: location || "London" },
    };
  }

  // 3. Web Search
  if (
    lower.includes("latest news") ||
    lower.includes("recent news") ||
    lower.includes("search the web for") ||
    lower.includes("search web for") ||
    lower.startsWith("search for ") ||
    lower.includes("what happened to") ||
    lower.includes("who won the")
  ) {
    const cleanQuery = text
      .replace(/(?:what's the latest news about|what is the latest news about|search the web for|search web for|search for|latest news regarding)/gi, "")
      .replace(/[?.!]/g, "")
      .trim();

    return {
      toolName: "web_search",
      input: { query: cleanQuery || text },
    };
  }

  // 4. Reminders
  if (
    lower.includes("remind me") ||
    lower.includes("set a reminder") ||
    lower.includes("create a reminder") ||
    lower.includes("list my reminders")
  ) {
    if (lower.includes("list") || lower.includes("show my reminders") || lower.includes("what are my reminders")) {
      return {
        toolName: "reminders",
        input: { action: "list" },
      };
    }

    const title = text
      .replace(/(?:remind me to|set a reminder to|create a reminder to|remind me)/gi, "")
      .trim();

    return {
      toolName: "reminders",
      input: {
        action: "create",
        title: title || "Untitled Task",
        reminder_time: new Date(Date.now() + 3600000).toISOString(),
      },
    };
  }

  // 5. Notes / Memories
  if (
    lower.includes("remember that") ||
    lower.includes("remember this") ||
    lower.includes("save a note") ||
    lower.includes("store note") ||
    lower.includes("recall my memories") ||
    lower.includes("what do you remember")
  ) {
    if (lower.includes("recall") || lower.includes("what do you remember") || lower.includes("list notes")) {
      return {
        toolName: "notes",
        input: { action: "recall" },
      };
    }

    const note = text
      .replace(/(?:remember that|remember this|save a note that|store note that|keep in mind that)/gi, "")
      .trim();

    return {
      toolName: "notes",
      input: {
        action: "save",
        note: note || text,
        category: lower.includes("deadline") || lower.includes("project") ? "work" : "general",
        importance: 4,
      },
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session with Supabase server client
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to access the AI assistant." },
        { status: 401 }
      );
    }

    // 2. Sliding-Window Rate Limiting (30 requests/min per authenticated user)
    const rateLimit = rateLimiter.check(user.id, 30, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down and try again.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    // 3. Parse & Validate Request Payload with strict Zod bounds
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const parseResult = chatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload format.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { messages, systemPromptOverride } = parseResult.data;
    let { conversationId } = parseResult.data;

    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || !lastUserMessage.content.trim()) {
      return NextResponse.json(
        { error: "Last message content cannot be empty." },
        { status: 400 }
      );
    }

    // 4. Authorization & User Data Isolation Check for Conversation
    if (conversationId) {
      const { data: convCheck, error: convCheckErr } = await (supabase.from("conversations") as any)
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (convCheckErr || !convCheck) {
        return NextResponse.json(
          { error: "Forbidden: Conversation not found or unauthorized access." },
          { status: 403 }
        );
      }
    } else {
      // Auto-create new conversation for this authenticated user
      const generatedTitle = generateConversationTitle(lastUserMessage.content);

      const { data: newConv, error: convError } = await (supabase.from("conversations") as any)
        .insert({
          user_id: user.id,
          title: generatedTitle,
        })
        .select()
        .single();

      if (convError || !newConv) {
        return NextResponse.json(
          { error: `Could not create conversation: ${convError?.message || "Unknown error"}` },
          { status: 500 }
        );
      }
      conversationId = newConv.id;
    }

    // 5. Save the User's message to Supabase DB
    await (supabase.from("messages") as any).insert({
      conversation_id: conversationId,
      role: "user",
      content: lastUserMessage.content,
      metadata: lastUserMessage.metadata || {},
    });

    // 6. Automatic Language Detection & User Settings
    const { data: userSettings } = await (supabase.from("user_settings") as any)
      .select("memory_enabled, response_style, language")
      .eq("user_id", user.id)
      .single();

    const isMemoryEnabled = userSettings?.memory_enabled ?? true;
    const responseStyle = userSettings?.response_style || "conversational";

    // Automatic Language Matching: detect user input language dynamically
    const detection = detectLanguage(lastUserMessage.content, userSettings?.language || "en");
    const matchedLanguage = detection.language;
    const matchedSpeechCode = detection.speechCode;

    const contextMessages: AIMessage[] = messages.slice(-AI_CONFIG.maxHistoryMessages);

    // Build personalization system instruction
    const personalizationInstructions: string[] = [];

    // Language constraint matching SAME LANGUAGE RULE
    const languageDirectives: Record<string, string> = {
      kn: "CRITICAL: The user's message is in Kannada. You MUST answer natively and entirely in Kannada (ಕನ್ನಡ). Provide clean, natural Kannada suitable for voice speech synthesis. Preserve technical terms naturally.",
      hi: "CRITICAL: The user's message is in Hindi. You MUST answer natively and entirely in Hindi (हिन्दी). Provide clean, natural Hindi suitable for voice speech synthesis. Preserve technical terms naturally.",
      te: "CRITICAL: The user's message is in Telugu. You MUST answer natively and entirely in Telugu (తెలుగు). Provide clean, natural Telugu suitable for voice speech synthesis. Preserve technical terms naturally.",
      ta: "CRITICAL: The user's message is in Tamil. You MUST answer natively and entirely in Tamil (தமிழ்). Provide clean, natural Tamil suitable for voice speech synthesis. Preserve technical terms naturally.",
      mr: "CRITICAL: The user's message is in Marathi. You MUST answer natively and entirely in Marathi (मराठी). Provide clean, natural Marathi suitable for voice speech synthesis. Preserve technical terms naturally.",
      en: "CRITICAL: The user's message is in English. You MUST answer natively and entirely in English.",
    };

    if (languageDirectives[matchedLanguage]) {
      personalizationInstructions.push(languageDirectives[matchedLanguage]);
    }

    // Response style constraint
    if (responseStyle === "concise") {
      personalizationInstructions.push("STYLE: Be extremely concise, direct, and high-density. Avoid pleasantries or wordy introductions.");
    } else if (responseStyle === "detailed") {
      personalizationInstructions.push("STYLE: Provide thorough, structured, and in-depth explanations with background context.");
    } else if (responseStyle === "technical") {
      personalizationInstructions.push("STYLE: Provide technical, precise, code-first answers with deep architectural insights.");
    }

    if (personalizationInstructions.length > 0) {
      contextMessages.unshift({
        role: "system",
        content: personalizationInstructions.join("\n"),
      });
    }

    // Retrieve and inject relevant long-term memories if enabled
    if (isMemoryEnabled) {
      const relevantMemories = await getRelevantMemories(
        supabase as any,
        user.id,
        lastUserMessage.content
      );

      if (relevantMemories.length > 0) {
        const memoryPrompt = formatMemoriesForPrompt(relevantMemories);
        contextMessages.unshift({
          role: "system",
          content: memoryPrompt,
        });
      }

      // Automatically extract and store new persistent memories asynchronously
      const extracted = extractMemoryFromText(lastUserMessage.content);
      if (extracted) {
        (async () => {
          try {
            // Check for duplicate memory
            const { data: existing } = await (supabase.from("memories") as any)
              .select("id")
              .eq("user_id", user.id)
              .ilike("memory", `%${extracted.memory}%`)
              .maybeSingle();

            if (!existing) {
              await (supabase.from("memories") as any).insert({
                user_id: user.id,
                memory: extracted.memory,
                category: extracted.category,
                importance: extracted.importance,
              });
            }
          } catch (memErr) {
            console.warn("Async memory save error:", memErr);
          }
        })();
      }
    }

    // 7. Execute Agent Tool if detected
    let executedToolName: string | null = null;
    const toolIntent = analyzeAgentToolIntent(lastUserMessage.content);

    if (toolIntent) {
      executedToolName = toolIntent.toolName;

      // Safe execution through ToolRegistry (validates with Zod & audits in tool_executions table)
      const executionResult = await toolRegistry.executeTool(
        toolIntent.toolName,
        toolIntent.input,
        {
          userId: user.id,
          conversationId: conversationId || null,
        }
      );

      // Inject structured tool output context into LLM reasoning prompt
      contextMessages.push({
        role: "system",
        content: `[TOOL_EXECUTION] Tool: ${toolIntent.toolName} (Status: ${executionResult.status})\nResult Data: ${JSON.stringify(
          executionResult.output
        )}\nProvide a natural response incorporating this exact tool data.`,
      });
    }

    // 8. Request streaming completion from AI Provider
    const aiProvider = getAIProvider();
    const rawStream = await aiProvider.streamChat({
      messages: contextMessages,
      systemPrompt: systemPromptOverride,
      signal: request.signal,
    });

    // 9. Pipe stream to client while accumulating text for DB persistence
    const decoder = new TextDecoder();
    let accumulatedText = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        accumulatedText += decoder.decode(chunk, { stream: true });
        controller.enqueue(chunk);
      },
      async flush() {
        // Save completed assistant response to Supabase
        if (conversationId && accumulatedText.trim()) {
          try {
            await (supabase.from("messages") as any).insert({
              conversation_id: conversationId,
              role: "assistant",
              content: accumulatedText.trim(),
              metadata: {
                model: process.env["AI_MODEL"] || AI_CONFIG.defaultModel,
                provider: aiProvider.name,
                tool_executed: executedToolName,
                memory_enabled: isMemoryEnabled,
                language: matchedLanguage,
                speech_code: matchedSpeechCode,
                response_style: responseStyle,
              },
            });

            await (supabase.from("conversations") as any)
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);
          } catch (dbErr) {
            console.error("Failed to persist assistant message to Supabase:", dbErr);
          }
        }
      },
    });

    const responseStream = rawStream.pipeThrough(transformStream);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Conversation-Id": conversationId || "",
        "X-Detected-Language": matchedLanguage,
        "X-Speech-Code": matchedSpeechCode,
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        ...(executedToolName ? { "X-Tool-Name": executedToolName } : {}),
      },
    });
  } catch (error: any) {
    return formatSafeErrorResponse(error, 500);
  }
}
