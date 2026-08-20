"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { sttService } from "@/services/speech-to-text-service";
import type { STTState, STTError } from "@/types/voice.types";
import { toast } from "sonner";

interface UseVoiceInputOptions {
  language?: string;
  onTranscriptComplete?: (transcript: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [sttState, setSttState] = useState<STTState>("idle");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const errorResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onCompleteRef = useRef(options.onTranscriptComplete);
  onCompleteRef.current = options.onTranscriptComplete;

  useEffect(() => {
    setIsSupported(sttService.isSupported());

    return () => {
      if (errorResetTimeoutRef.current) {
        clearTimeout(errorResetTimeoutRef.current);
      }
      sttService.abort();
    };
  }, []);

  const scheduleErrorAutoReset = useCallback(() => {
    if (errorResetTimeoutRef.current) {
      clearTimeout(errorResetTimeoutRef.current);
    }
    errorResetTimeoutRef.current = setTimeout(() => {
      setSttState((curr) => (curr === "error" ? "idle" : curr));
    }, 3500);
  }, []);

  const startListening = useCallback(async () => {
    if (errorResetTimeoutRef.current) {
      clearTimeout(errorResetTimeoutRef.current);
    }
    setErrorMessage(null);
    setInterimTranscript("");
    setFinalTranscript("");

    if (!sttService.isSupported()) {
      setSttState("error");
      setErrorMessage("Voice input isn't supported in this browser. Try Chrome or use text input.");
      toast.error("Voice input isn't supported in this browser.");
      scheduleErrorAutoReset();
      return;
    }

    try {
      await sttService.start({
        language: options.language ?? "en-US",
        continuous: false,
        interimResults: true,
        onStateChange: (state) => {
          setSttState(state);
          if (state === "idle" || state === "error" || state === "success") {
            setAudioLevel(0);
          }
          if (state === "error") {
            scheduleErrorAutoReset();
          }
        },
        onInterimTranscript: (text) => {
          setInterimTranscript(text);
        },
        onFinalTranscript: (text) => {
          setFinalTranscript(text);
          setInterimTranscript("");
          setSttState("success");
          if (onCompleteRef.current) {
            onCompleteRef.current(text);
          }
        },
        onAudioLevel: (level) => {
          setAudioLevel(level);
        },
        onError: (err: STTError) => {
          let userMessage = "Could not record voice input. Please try again.";

          switch (err.code) {
            case "not-allowed":
              userMessage = "Microphone access is blocked. Please allow microphone access in Chrome settings.";
              break;
            case "audio-capture":
              userMessage = "Couldn't access the microphone. Tap to try again.";
              break;
            case "no-speech":
              userMessage = "I couldn't hear you. Please try again.";
              break;
            case "not-supported":
              userMessage = "Voice input isn't supported in this browser. Try Chrome or use text input.";
              break;
            case "network":
              userMessage = "Network connection error during speech recognition. Tap to try again.";
              break;
            default:
              userMessage = err.message || userMessage;
          }

          setErrorMessage(userMessage);
          setSttState("error");
          setAudioLevel(0);
          scheduleErrorAutoReset();

          if (err.code === "not-allowed") {
            toast.error(userMessage);
          } else if (err.code !== "no-speech") {
            toast.error(userMessage);
          }
        },
      });
    } catch (err: any) {
      setSttState("error");
      setErrorMessage(err.message || "Couldn't access the microphone. Tap to try again.");
      setAudioLevel(0);
      scheduleErrorAutoReset();
    }
  }, [options.language, scheduleErrorAutoReset]);

  const stopListening = useCallback(async () => {
    if (errorResetTimeoutRef.current) {
      clearTimeout(errorResetTimeoutRef.current);
    }
    setAudioLevel(0);
    await sttService.stop();
    setSttState("idle");
  }, []);

  const toggleListening = useCallback(async () => {
    if (sttState === "listening" || sttState === "requesting_permission") {
      await stopListening();
    } else {
      await startListening();
    }
  }, [sttState, startListening, stopListening]);

  const reset = useCallback(() => {
    if (errorResetTimeoutRef.current) {
      clearTimeout(errorResetTimeoutRef.current);
    }
    sttService.abort();
    setSttState("idle");
    setInterimTranscript("");
    setFinalTranscript("");
    setErrorMessage(null);
    setAudioLevel(0);
  }, []);

  return {
    sttState,
    interimTranscript,
    finalTranscript,
    audioLevel,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    reset,
  };
}
