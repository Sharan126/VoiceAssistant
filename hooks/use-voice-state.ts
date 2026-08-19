"use client";

import { useState, useCallback } from "react";
import type { VoiceState } from "@/types/voice.types";

export function useVoiceState() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle microphone listening state (UI only)
  const toggleListening = useCallback(() => {
    setVoiceState((current) => {
      if (current === "listening") {
        return "idle";
      }
      if (current === "error") {
        setErrorMessage(null);
        return "listening";
      }
      return "listening";
    });
  }, []);

  // Set explicit state
  const setState = useCallback((state: VoiceState, error?: string) => {
    setVoiceState(state);
    if (error) {
      setErrorMessage(error);
    } else if (state !== "error") {
      setErrorMessage(null);
    }
  }, []);

  // Handle prompt selection
  const handleSelectPrompt = useCallback((promptText: string) => {
    setInputText(promptText);
  }, []);

  // Handle send text
  const handleSendMessage = useCallback(
    (text?: string) => {
      const messageContent = text ?? inputText;
      if (!messageContent.trim()) return;

      // Clear input
      setInputText("");

      // For Part 3 (UI only): transition states cleanly without faking AI content
      setVoiceState("thinking");
      setTimeout(() => {
        setVoiceState("speaking");
        setTimeout(() => {
          setVoiceState("idle");
        }, 2200);
      }, 1500);
    },
    [inputText]
  );

  return {
    voiceState,
    setVoiceState: setState,
    activeConversationId,
    setActiveConversationId,
    inputText,
    setInputText,
    errorMessage,
    toggleListening,
    handleSelectPrompt,
    handleSendMessage,
  };
}
