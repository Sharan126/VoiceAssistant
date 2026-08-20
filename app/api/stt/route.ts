import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getAIKey } from "@/lib/env";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { formatSafeErrorResponse } from "@/lib/security/error-sanitizer";
import { AI_CONFIG } from "@/lib/ai/config";

export const runtime = "nodejs";

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
        { error: "Unauthorized. Please sign in to use voice input." },
        { status: 401 }
      );
    }

    // 2. Rate Limiting (30 requests/min per authenticated user)
    const rateLimit = rateLimiter.check(user.id, 30, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many speech requests. Please slow down and try again.",
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse FormData containing audio file
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form payload." }, { status: 400 });
    }

    const audioFile = formData.get("file") as File | null;
    const requestedLanguage = (formData.get("language") as string) || "en-US";

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: "Audio recording file is empty or missing." },
        { status: 400 }
      );
    }

    // Validate size limit (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio recording exceeds 10MB upper limit." },
        { status: 400 }
      );
    }

    // 4. Perform STT transcription using server-side AI key
    const apiKey = getAIKey();
    const baseUrl = (process.env["AI_BASE_URL"] || AI_CONFIG.defaultBaseUrl).replace(/\/+$/, "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server Speech-to-Text key is missing." },
        { status: 500 }
      );
    }

    const sttFormData = new FormData();
    sttFormData.append("file", audioFile, "recording.webm");
    sttFormData.append(
      "model",
      baseUrl.includes("groq") ? "whisper-large-v3-turbo" : "whisper-1"
    );

    const langCode = requestedLanguage.split("-")[0];
    if (langCode && langCode !== "auto") {
      sttFormData.append("language", langCode);
    }

    const sttResponse = await fetch(`${baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: sttFormData,
    });

    if (!sttResponse.ok) {
      const errText = await sttResponse.text();
      console.warn("STT server error response:", sttResponse.status, errText);
      return NextResponse.json(
        { error: "Could not transcribe audio stream. Please try speaking again." },
        { status: 502 }
      );
    }

    const sttResult = (await sttResponse.json()) as { text?: string };
    const transcript = (sttResult.text || "").trim();

    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected in audio recording." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      transcript,
      language: requestedLanguage,
    });
  } catch (error: any) {
    return formatSafeErrorResponse(error, 500);
  }
}
