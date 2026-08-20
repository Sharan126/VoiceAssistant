"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useAIConversation } from "@/hooks/use-ai-conversation";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { settingsService } from "@/services/settings-service";
import { getLanguageConfig, detectLanguage } from "@/lib/i18n";
import type { VoiceState } from "@/types/voice.types";
import type { UserSettings } from "@/types/database.types";
import { toast } from "sonner";

interface PipelineState {
  voiceState: VoiceState;
  activeTool: string | null;
  errorMessage: string | null;
  lastQuery: string | null;
}

type PipelineAction =
  | { type: "SET_STATE"; state: VoiceState; detail?: string }
  | { type: "SET_TOOL"; toolName: string }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_LAST_QUERY"; query: string }
  | { type: "RESET" };

function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...state,
        voiceState: action.state,
        activeTool: action.state === "tool_execution" ? action.detail || state.activeTool : null,
        errorMessage: action.state === "error" ? action.detail || state.errorMessage : null,
      };
    case "SET_TOOL":
      return {
        ...state,
        voiceState: "tool_execution",
        activeTool: action.toolName,
      };
    case "SET_ERROR":
      return {
        ...state,
        voiceState: "error",
        errorMessage: action.error,
      };
    case "SET_LAST_QUERY":
      return {
        ...state,
        lastQuery: action.query,
      };
    case "RESET":
      return {
        voiceState: "idle",
        activeTool: null,
        errorMessage: null,
        lastQuery: null,
      };
    default:
      return state;
  }
}

interface UseVoicePipelineOptions {
  userId: string;
}

export function useVoicePipeline({ userId }: UseVoicePipelineOptions) {
  const [pipelineState, dispatch] = useReducer(pipelineReducer, {
    voiceState: "idle",
    activeTool: null,
    errorMessage: null,
    lastQuery: null,
  });

  const [userSettings, setUserSettings] = useReducer(
    (_: UserSettings | null, next: UserSettings | null) => next,
    null
  );

  // Synchronize settings & theme from database
  useEffect(() => {
    settingsService.getUserSettings(userId).then(({ data }) => {
      if (data) {
        setUserSettings(data);
        if (data.theme && typeof window !== "undefined") {
          const root = document.documentElement;
          if (data.theme === "light") {
            root.classList.remove("dark");
            root.classList.add("light");
          } else if (data.theme === "dark") {
            root.classList.remove("light");
            root.classList.add("dark");
          } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (prefersDark) {
              root.classList.remove("light");
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
              root.classList.add("light");
            }
          }
        }
      }
    });
  }, [userId]);

  const defaultLanguage = userSettings?.language || "en";
  const [matchedLanguage, setMatchedLanguage] = useReducer(
    (_: string, next: string) => next,
    defaultLanguage
  );

  useEffect(() => {
    if (userSettings?.language) {
      setMatchedLanguage(userSettings.language);
    }
  }, [userSettings?.language]);

  const activeLanguage = matchedLanguage;
  const speechCode = getLanguageConfig(activeLanguage).speechCode;

  // Request deduplication guard to prevent duplicate dispatches
  const isDispatchingRef = useRef(false);

  // Phase 2: Continuous Conversation Mode State
  const [conversationMode, setConversationMode] = useReducer((_: boolean, next: boolean) => next, false);
  const conversationModeRef = useRef(conversationMode);
  conversationModeRef.current = conversationMode;

  const autoListenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Text-to-Speech Hook
  const {
    isSpeaking: isTTSSpeaking,
    autoPlay,
    setAutoPlay,
    speak: speakText,
    stop: stopTTS,
    interrupt: interruptTTS,
  } = useTextToSpeech({
    voice: userSettings?.voice,
    rate: userSettings?.speaking_speed ?? 1.0,
    autoPlay: userSettings?.auto_play ?? true,
    onStart: () => {
      dispatch({ type: "SET_STATE", state: "speaking" });
    },
    onEnd: () => {
      dispatch({ type: "SET_STATE", state: "idle" });
      // Phase 2 Continuous Conversation: Auto re-listen for next user turn if enabled
      if (conversationModeRef.current) {
        if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
        autoListenTimeoutRef.current = setTimeout(() => {
          rawStartListening();
        }, 450);
      }
    },
    onError: (err) => {
      console.warn("TTS Error:", err);
      dispatch({ type: "SET_STATE", state: "idle" });
    },
  });

  // 2. AI Streaming Conversation Hook
  const {
    messages,
    currentStreamingText,
    isStreaming,
    activeConversationId,
    sendMessage: sendAIMessage,
    stopGeneration: cancelAIStream,
    loadConversation,
    clearMessages,
  } = useAIConversation({
    onStateChange: (state, detail) => {
      if (state === "tool_execution" && detail) {
        dispatch({ type: "SET_TOOL", toolName: detail });
      } else {
        dispatch({ type: "SET_STATE", state, detail });
      }
    },
  });

  // 3. Send Message Function (Deduplicated with Auto-Language Matching)
  const handleSendMessage = useCallback(
    async (text: string, metadata?: Record<string, any>) => {
      const trimmed = text.trim();
      if (!trimmed || isDispatchingRef.current || isStreaming) return;

      isDispatchingRef.current = true;
      dispatch({ type: "SET_LAST_QUERY", query: trimmed });

      // Automatic Language Matching: detect user input language dynamically
      const detection = detectLanguage(trimmed, activeLanguage);
      if (detection.language !== matchedLanguage) {
        setMatchedLanguage(detection.language);
      }

      // Immediate zero-latency interruption of any active speech
      interruptTTS();
      dispatch({ type: "SET_STATE", state: "thinking" });

      try {
        await sendAIMessage(trimmed, undefined, metadata);
      } finally {
        isDispatchingRef.current = false;
      }
    },
    [interruptTTS, sendAIMessage, isStreaming, activeLanguage, matchedLanguage]
  );

  // 4. Speech-to-Text Microphone Hook with Language Code
  const {
    sttState,
    interimTranscript,
    audioLevel,
    errorMessage: sttError,
    startListening: rawStartListening,
    toggleListening: rawToggleListening,
    stopListening: rawStopListening,
  } = useVoiceInput({
    language: speechCode,
    onTranscriptComplete: (spokenText) => {
      if (spokenText.trim()) {
        handleSendMessage(spokenText.trim());
      }
    },
  });

  // Sync STT states cleanly
  useEffect(() => {
    if (sttState === "listening" || sttState === "requesting_permission" || sttState === "processing") {
      dispatch({ type: "SET_STATE", state: sttState });
    } else if (sttState === "error" && sttError) {
      dispatch({ type: "SET_ERROR", error: sttError });
    } else if (sttState === "idle" && !isStreaming && !isTTSSpeaking) {
      dispatch({ type: "SET_STATE", state: "idle" });
    }
  }, [sttState, sttError, isStreaming, isTTSSpeaking]);

  // Watch for completed AI assistant messages to trigger TTS narration with matching voice
  useEffect(() => {
    if (messages.length > 0 && !isStreaming && autoPlay) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        const detection = detectLanguage(lastMsg.content, matchedLanguage);
        speakText(lastMsg.content, {
          voice: userSettings?.voice,
          rate: userSettings?.speaking_speed ?? 1.0,
          language: detection.language,
          speechCode: detection.speechCode,
        });
      }
    }
  }, [messages, isStreaming, autoPlay, speakText, userSettings, matchedLanguage]);

  /**
   * Unified Microphone Toggle Handler with Guaranteed Interruption & Audio Release
   */
  const toggleMicrophone = useCallback(async () => {
    // If currently speaking, interrupt TTS immediately, cancel speechSynthesis, and release audio channel
    if (isTTSSpeaking) {
      interruptTTS();
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    // If currently streaming AI response, cancel stream
    if (isStreaming) {
      cancelAIStream();
    }

    await rawToggleListening();
  }, [isTTSSpeaking, isStreaming, interruptTTS, cancelAIStream, rawToggleListening]);

  /**
   * Fast language switcher with immediate database persistence
   */
  const handleSetLanguage = useCallback(
    async (langCode: string) => {
      if (userSettings) {
        setUserSettings({ ...userSettings, language: langCode });
      }
      const { error } = await settingsService.updateUserSettings(userId, { language: langCode });
      if (error) {
        toast.error(`Could not switch language: ${error}`);
      } else {
        const conf = getLanguageConfig(langCode);
        toast.success(`Language set to ${conf.nativeName} (${conf.name})`);
      }
    },
    [userId, userSettings]
  );

  /**
   * Retry the last failed query or recover from error
   */
  const handleRetry = useCallback(() => {
    if (pipelineState.lastQuery) {
      handleSendMessage(pipelineState.lastQuery);
    } else {
      dispatch({ type: "SET_STATE", state: "idle" });
      toggleMicrophone();
    }
  }, [pipelineState.lastQuery, handleSendMessage, toggleMicrophone]);

  /**
   * Explicitly stop TTS and reset pipeline state back to idle
   */
  const handleStopTTS = useCallback(() => {
    if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
    stopTTS();
    dispatch({ type: "SET_STATE", state: "idle" });
  }, [stopTTS]);

  const toggleConversationMode = useCallback(() => {
    setConversationMode(!conversationMode);
    if (!conversationMode) {
      toast.success("Conversation Mode ON: Hands-free automatic turn-taking enabled.");
    } else {
      if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
      toast.info("Conversation Mode OFF: Reverted to manual push-to-talk.");
    }
  }, [conversationMode]);

  return {
    voiceState: pipelineState.voiceState,
    activeTool: pipelineState.activeTool,
    errorMessage: pipelineState.errorMessage,
    messages,
    currentStreamingText,
    isStreaming,
    activeConversationId,
    interimTranscript,
    audioLevel,
    autoPlay,
    setAutoPlay,
    conversationMode,
    setConversationMode,
    toggleConversationMode,
    language: activeLanguage,
    setLanguage: handleSetLanguage,
    setUserSettings,
    toggleMicrophone,
    sendMessage: handleSendMessage,
    stopListening: rawStopListening,
    stopTTS: handleStopTTS,
    interruptTTS,
    stopGeneration: cancelAIStream,
    loadConversation,
    clearMessages,
    retry: handleRetry,
  };
}
