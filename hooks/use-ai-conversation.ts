"use client";

import { useState, useCallback, useRef } from "react";
import { aiService } from "@/services/ai-service";
import { messageService } from "@/services/message-service";
import type { AIMessage } from "@/types/ai.types";
import type { VoiceState } from "@/types/voice.types";
import { toast } from "sonner";

interface UseAIConversationOptions {
  onConversationCreated?: (newId: string) => void;
  onStateChange?: (state: VoiceState, detail?: string) => void;
}

export function useAIConversation(options: UseAIConversationOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentStreamingText, setCurrentStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Load history for an existing conversation from Supabase
   */
  const loadConversation = useCallback(async (conversationId: string | null) => {
    setActiveConversationId(conversationId);
    setError(null);
    setCurrentStreamingText("");
    setActiveTool(null);

    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      const { data, error: dbError } = await messageService.getMessages(conversationId);
      if (dbError) {
        toast.error(`Could not load messages: ${dbError}`);
        return;
      }

      const formatted: AIMessage[] = (data || []).map((m) => ({
        id: m.id,
        role: m.role as AIMessage["role"],
        content: m.content,
        created_at: m.created_at,
        metadata: (m.metadata as Record<string, any>) || {},
      }));

      setMessages(formatted);
    } catch (err: any) {
      console.error("Error loading conversation:", err);
    }
  }, []);

  /**
   * Send a message to the AI conversation stream
   */
  const sendMessage = useCallback(
    async (text: string, customConvId?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setActiveTool(null);
      const convIdToUse = customConvId !== undefined ? customConvId : activeConversationId;

      // 1. Optimistic User Message
      const userMessage: AIMessage = {
        role: "user",
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      const updatedHistory = [...messages, userMessage];
      setMessages(updatedHistory);
      setCurrentStreamingText("");
      setIsStreaming(true);
      options.onStateChange?.("thinking");

      // 2. Setup Abort Controller
      abortControllerRef.current = new AbortController();

      try {
        let hasReceivedFirstChunk = false;

        const result = await aiService.streamChat(
          {
            conversationId: convIdToUse,
            messages: updatedHistory,
          },
          (chunk) => {
            if (!hasReceivedFirstChunk) {
              hasReceivedFirstChunk = true;
              options.onStateChange?.("speaking");
            }
            setCurrentStreamingText((prev) => prev + chunk);
          },
          (toolName) => {
            setActiveTool(toolName);
            options.onStateChange?.("tool_execution", toolName);
          },
          abortControllerRef.current.signal
        );

        // 3. Update Conversation ID if newly created
        if (result.conversationId && result.conversationId !== activeConversationId) {
          setActiveConversationId(result.conversationId);
          options.onConversationCreated?.(result.conversationId);
        }

        // 4. Append Final Assistant Message
        if (result.fullText.trim()) {
          const assistantMessage: AIMessage = {
            role: "assistant",
            content: result.fullText.trim(),
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }

        setCurrentStreamingText("");
        setActiveTool(null);
        options.onStateChange?.("idle");
      } catch (err: any) {
        if (err.name === "AbortError") {
          if (currentStreamingText.trim()) {
            const partialMessage: AIMessage = {
              role: "assistant",
              content: currentStreamingText.trim() + " *(cancelled)*",
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, partialMessage]);
          }
          setCurrentStreamingText("");
          setActiveTool(null);
          options.onStateChange?.("idle");
        } else {
          console.error("AI stream error:", err);
          setError(err.message || "Failed to complete AI response.");
          options.onStateChange?.("error", err.message);
          toast.error(err.message || "AI response failed.");
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, activeConversationId, currentStreamingText, options]
  );

  /**
   * Stop generation / Abort current stream
   */
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setActiveTool(null);
      options.onStateChange?.("idle");
      toast.info("Generation stopped.");
    }
  }, [options]);

  /**
   * Reset / Clear current thread
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentStreamingText("");
    setError(null);
    setActiveTool(null);
    setActiveConversationId(null);
  }, []);

  return {
    messages,
    currentStreamingText,
    isStreaming,
    activeConversationId,
    activeTool,
    error,
    sendMessage,
    stopGeneration,
    loadConversation,
    clearMessages,
  };
}
