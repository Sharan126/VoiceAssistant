import type { AIProvider } from "./provider";
import type { AIStreamOptions } from "@/types/ai.types";
import { AI_CONFIG } from "./config";
import { getAIKey } from "@/lib/env";

export class OpenAICompatibleProvider implements AIProvider {
  public name = "OpenAICompatible";
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || getAIKey() || "";
    this.baseUrl = (baseUrl || process.env["AI_BASE_URL"] || AI_CONFIG.defaultBaseUrl).replace(/\/+$/, "");
  }

  public async streamChat(options: AIStreamOptions): Promise<ReadableStream<Uint8Array>> {
    if (!this.apiKey) {
      throw new Error(
        "AI API key is missing. Please configure AI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in your server environment variables."
      );
    }

    const model = options.model || process.env["AI_MODEL"] || AI_CONFIG.defaultModel;
    const systemMessage = {
      role: "system",
      content: options.systemPrompt || AI_CONFIG.systemPrompt,
    };

    // Format chat messages including system prompt
    const formattedMessages = [
      systemMessage,
      ...options.messages.map((m) => ({
        role: m.role === "assistant" || m.role === "system" ? m.role : "user",
        content: m.content,
      })),
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: options.temperature ?? AI_CONFIG.defaultTemperature,
        max_tokens: options.maxTokens ?? AI_CONFIG.defaultMaxTokens,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      let errorDetails = "";
      try {
        const errorJson = await response.json();
        errorDetails = errorJson.error?.message || JSON.stringify(errorJson);
      } catch {
        errorDetails = await response.text();
      }
      throw new Error(`AI API request failed (${response.status}): ${errorDetails}`);
    }

    if (!response.body) {
      throw new Error("No response stream body received from AI provider.");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":") || trimmed === "data: [DONE]") {
                continue;
              }

              if (trimmed.startsWith("data: ")) {
                try {
                  const jsonStr = trimmed.slice(6);
                  const parsed = JSON.parse(jsonStr);
                  const deltaContent = parsed.choices?.[0]?.delta?.content;

                  if (deltaContent) {
                    controller.enqueue(encoder.encode(deltaContent));
                  }
                } catch {
                  // Partial JSON chunk, will resolve on next read
                }
              }
            }
          }

          controller.close();
        } catch (err: any) {
          if (err.name === "AbortError") {
            controller.close();
          } else {
            controller.error(err);
          }
        } finally {
          reader.releaseLock();
        }
      },
      cancel() {
        reader.cancel();
      },
    });
  }
}
