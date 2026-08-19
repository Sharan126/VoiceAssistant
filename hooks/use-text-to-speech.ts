"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ttsService } from "@/services/text-to-speech-service";
import type { TTSVoice, TTSOptions } from "@/types/tts.types";

interface UseTextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

export function useTextToSpeech(initialOptions: UseTextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [autoPlay, setAutoPlay] = useState<boolean>(initialOptions.autoPlay ?? true);

  const optionsRef = useRef(initialOptions);
  optionsRef.current = initialOptions;

  // Load available system voices
  useEffect(() => {
    setIsSupported(ttsService.isSupported());

    ttsService.getVoices().then((availableVoices) => {
      setVoices(availableVoices);
    });

    return () => {
      // Guarantee cancellation on unmount
      ttsService.stop();
    };
  }, []);

  /**
   * Speak text with configured or overridden options
   */
  const speak = useCallback(
    async (text: string, customOptions?: Partial<TTSOptions>) => {
      if (!ttsService.isSupported() || !text.trim()) return;

      // Stop any existing utterance
      ttsService.stop();

      try {
        setIsSpeaking(true);
        optionsRef.current.onStart?.();

        await ttsService.speak(text, {
          voice: customOptions?.voice ?? optionsRef.current.voice,
          rate: customOptions?.rate ?? optionsRef.current.rate ?? 1.0,
          pitch: customOptions?.pitch ?? optionsRef.current.pitch ?? 1.0,
          volume: customOptions?.volume ?? 1.0,
          onStart: () => {
            setIsSpeaking(true);
            optionsRef.current.onStart?.();
          },
          onEnd: () => {
            setIsSpeaking(false);
            optionsRef.current.onEnd?.();
          },
          onError: (err) => {
            setIsSpeaking(false);
            optionsRef.current.onError?.(err);
          },
        });
      } catch (err: any) {
        setIsSpeaking(false);
        optionsRef.current.onError?.(err);
      }
    },
    []
  );

  /**
   * Stop speech playback
   */
  const stop = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
    optionsRef.current.onEnd?.();
  }, []);

  /**
   * Interruption handler: immediately cancels speech and drops active state
   */
  const interrupt = useCallback(() => {
    ttsService.stop();
    setIsSpeaking(false);
    optionsRef.current.onEnd?.();
  }, []);

  return {
    isSpeaking,
    voices,
    isSupported,
    autoPlay,
    setAutoPlay,
    speak,
    stop,
    interrupt,
  };
}
