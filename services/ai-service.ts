import type { AIChatRequest } from "@/types/ai.types";

export interface StreamChatResult {
  conversationId: string | null;
  toolName: string | null;
  fullText: string;
}

export const aiService = {
  /**
   * Send chat messages to /api/chat and stream response tokens back in real-time
   */
  async streamChat(
    request: AIChatRequest,
    onChunk: (chunk: string) => void,
    onToolDetected?: (toolName: string) => void,
    signal?: AbortSignal
  ): Promise<StreamChatResult> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      let errorMessage = "Failed to communicate with AI service.";
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    const conversationId = response.headers.get("X-Conversation-Id");
    const toolName = response.headers.get("X-Tool-Name");

    if (toolName && onToolDetected) {
      onToolDetected(toolName);
    }

    if (!response.body) {
      throw new Error("No response stream body returned from server.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        if (textChunk) {
          fullText += textChunk;
          onChunk(textChunk);
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        throw err;
      }
    } finally {
      reader.releaseLock();
    }

    return {
      conversationId,
      toolName,
      fullText,
    };
  },
};
