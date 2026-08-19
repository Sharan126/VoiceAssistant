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

  const onCompleteRef = useRef(options.onTranscriptComplete);
  onCompleteRef.current = options.onTranscriptComplete;

  useEffect(() => {
    setIsSupported(sttService.isSupported());

    return () => {
      // Ensure complete cleanup on unmount
      sttService.abort();
    };
  }, []);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setInterimTranscript("");
    setFinalTranscript("");

    if (!sttService.isSupported()) {
      setSttState("error");
      setErrorMessage("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      toast.error("Speech recognition is not supported in this browser.");
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
          setErrorMessage(err.message);
          setSttState("error");
          setAudioLevel(0);
          if (err.code === "not-allowed") {
            toast.error("Microphone permission denied. Please allow mic access.");
          } else if (err.code !== "no-speech") {
            toast.error(err.message);
          }
        },
      });
    } catch (err: any) {
      setSttState("error");
      setErrorMessage(err.message || "Failed to access microphone.");
      setAudioLevel(0);
    }
  }, [options.language]);

  const stopListening = useCallback(async () => {
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
