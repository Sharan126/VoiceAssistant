import type {
  SpeechToTextProvider,
  STTOptions,
  STTError,
} from "@/types/voice.types";
import { MediaRecorderSTTProvider } from "./media-recorder-stt-provider";

/**
 * Web Speech API implementation for in-browser speech recognition.
 * Works natively in Chrome, Edge, Safari, and Chromium-based browsers.
 */
export class WebSpeechSTTProvider implements SpeechToTextProvider {
  public name = "WebSpeechAPI";
  private recognition: any | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isListeningInternal = false;
  private isStartingInternal = false;
  private visibilityHandler: (() => void) | null = null;

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public async start(options: STTOptions): Promise<void> {
    if (!this.isSupported()) {
      options.onError?.({
        code: "not-supported",
        message: "Speech recognition is not supported in this browser.",
      });
      return;
    }

    // Prevent concurrent start calls
    if (this.isStartingInternal || this.isListeningInternal) {
      return;
    }

    await this.cleanup();
    this.isStartingInternal = true;

    try {
      options.onStateChange?.("requesting_permission");

      // Initialize Browser Speech Recognition
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.language ?? "en-US";
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isStartingInternal = false;
        this.isListeningInternal = true;
        options.onStateChange?.("listening");

        // Bind visibility change listener to pause/abort on tab switch
        this.bindVisibilityListener(options);

        // Optionally setup audio volume analyser AFTER recognition confirmed started
        if (options.onAudioLevel && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          // Asynchronously attempt volume meter without blocking recognition
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              if (this.isListeningInternal) {
                this.mediaStream = stream;
                this.setupAudioAnalysis(stream, options.onAudioLevel);
              } else {
                stream.getTracks().forEach((t) => t.stop());
              }
            })
            .catch(() => {
              // Ignore audio analyzer permission error if recognition already running
            });
        }
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i]?.[0]?.transcript || "";
          if (event.results[i]?.isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        if (interimTranscript && options.onInterimTranscript) {
          options.onInterimTranscript(interimTranscript);
        }

        if (finalTranscript && options.onFinalTranscript) {
          options.onStateChange?.("processing");
          options.onFinalTranscript(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isStartingInternal = false;
        this.isListeningInternal = false;

        let code: STTError["code"] = "unknown";
        let message = "An error occurred during speech recognition.";

        switch (event.error) {
          case "not-allowed":
          case "service-not-allowed":
            code = "not-allowed";
            message = "Microphone access was denied. Please allow microphone access in browser settings.";
            break;
          case "no-speech":
            code = "no-speech";
            message = "No speech was detected. Please tap to try again.";
            break;
          case "audio-capture":
            code = "audio-capture";
            message = "Microphone capture failed or hardware is busy.";
            break;
          case "network":
            code = "network";
            message = "Network error occurred during speech recognition.";
            break;
          case "aborted":
            code = "aborted";
            message = "Speech recognition was stopped.";
            break;
          default:
            message = event.message || `Speech recognition error: ${event.error}`;
        }

        if (code !== "aborted") {
          options.onError?.({ code, message });
          options.onStateChange?.("error");
        }
        this.cleanup();
      };

      this.recognition.onend = () => {
        this.isStartingInternal = false;
        this.isListeningInternal = false;
        this.cleanup();
      };

      this.recognition.start();
    } catch (err: any) {
      this.isStartingInternal = false;
      this.isListeningInternal = false;
      await this.cleanup();
      options.onError?.({
        code: "unknown",
        message: err.message || "Failed to start speech recognition.",
      });
      options.onStateChange?.("error");
    }
  }

  public async stop(): Promise<void> {
    if (this.recognition && this.isListeningInternal) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    await this.cleanup();
  }

  public abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
    }
    this.cleanup();
  }

  private bindVisibilityListener(options: STTOptions): void {
    if (typeof document === "undefined") return;
    this.unbindVisibilityListener();

    this.visibilityHandler = () => {
      if (document.hidden && this.isListeningInternal) {
        this.abort();
        options.onStateChange?.("idle");
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  private unbindVisibilityListener(): void {
    if (typeof document !== "undefined" && this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  private setupAudioAnalysis(
    stream: MediaStream,
    onAudioLevel?: (level: number) => void
  ): void {
    if (!onAudioLevel) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] ?? 0;
        }

        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        onAudioLevel(normalized);
        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn("AudioContext analyzer setup failed:", err);
    }
  }

  private async cleanup(): Promise<void> {
    this.isListeningInternal = false;
    this.isStartingInternal = false;
    this.unbindVisibilityListener();

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch {
        // Ignore close errors
      }
      this.audioContext = null;
    }
    this.analyser = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      this.mediaStream = null;
    }

    this.recognition = null;
  }
}

/**
 * Singleton speech-to-text service manager with automatic MediaRecorder fallback.
 */
class SpeechToTextManager {
  private primaryProvider: SpeechToTextProvider;
  private fallbackProvider: SpeechToTextProvider;
  private activeProvider: SpeechToTextProvider;

  constructor() {
    this.primaryProvider = new WebSpeechSTTProvider();
    this.fallbackProvider = new MediaRecorderSTTProvider();
    this.activeProvider = this.primaryProvider.isSupported()
      ? this.primaryProvider
      : this.fallbackProvider;
  }

  public setProvider(newProvider: SpeechToTextProvider) {
    this.activeProvider.abort();
    this.activeProvider = newProvider;
  }

  public getProvider(): SpeechToTextProvider {
    return this.activeProvider;
  }

  public isSupported(): boolean {
    return this.primaryProvider.isSupported() || this.fallbackProvider.isSupported();
  }

  public async start(options: STTOptions): Promise<void> {
    // Wrap onError to trigger automatic fallback if Web Speech fails on mobile Chrome
    const wrappedOptions: STTOptions = {
      ...options,
      onError: async (err: STTError) => {
        // If primary provider fails with hardware/browser error, try MediaRecorder fallback
        if (
          this.activeProvider === this.primaryProvider &&
          this.fallbackProvider.isSupported() &&
          (err.code === "audio-capture" ||
            err.code === "not-supported" ||
            (err.code as string) === "service-not-allowed" ||
            err.code === "network")
        ) {
          console.warn("Switching STT to MediaRecorder fallback due to primary STT error:", err);
          this.activeProvider = this.fallbackProvider;
          try {
            await this.fallbackProvider.start(options);
            return;
          } catch (fallbackErr) {
            console.error("STT fallback provider also failed:", fallbackErr);
          }
        }

        options.onError?.(err);
      },
    };

    try {
      await this.activeProvider.start(wrappedOptions);
    } catch (startErr: any) {
      if (
        this.activeProvider === this.primaryProvider &&
        this.fallbackProvider.isSupported()
      ) {
        console.warn("Primary STT start threw exception, executing MediaRecorder fallback...");
        this.activeProvider = this.fallbackProvider;
        await this.fallbackProvider.start(options);
      } else {
        throw startErr;
      }
    }
  }

  public async stop(): Promise<void> {
    return this.activeProvider.stop();
  }

  public abort(): void {
    this.activeProvider.abort();
  }
}

export const sttService = new SpeechToTextManager();
