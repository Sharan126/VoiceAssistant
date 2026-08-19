import type {
  SpeechToTextProvider,
  STTOptions,
  STTError,
} from "@/types/voice.types";

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
  private isListening = false;

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
        message: "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
      });
      return;
    }

    // Stop any existing session before starting a new one
    await this.cleanup();

    try {
      options.onStateChange?.("requesting_permission");

      // 1. Request microphone access and setup AudioContext for live volume analysis
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          this.setupAudioAnalysis(this.mediaStream, options.onAudioLevel);
        } catch (permErr: any) {
          if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
            options.onError?.({
              code: "not-allowed",
              message: "Microphone permission was denied. Please allow microphone access in your browser settings.",
            });
            options.onStateChange?.("error");
            await this.cleanup();
            return;
          }
          console.warn("Could not setup audio analyzer, proceeding with recognition only:", permErr);
        }
      }

      // 2. Initialize Browser Speech Recognition
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognitionConstructor();
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.lang = options.language ?? "en-US";
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        options.onStateChange?.("listening");
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
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
        let code: STTError["code"] = "unknown";
        let message = "An error occurred during speech recognition.";

        switch (event.error) {
          case "not-allowed":
          case "service-not-allowed":
            code = "not-allowed";
            message = "Microphone access was denied. Please enable microphone permissions in your browser.";
            break;
          case "no-speech":
            code = "no-speech";
            message = "Couldn't understand that. No speech detected, please try again.";
            break;
          case "audio-capture":
            code = "audio-capture";
            message = "No microphone was found or audio capture failed.";
            break;
          case "network":
            code = "network";
            message = "Network communication error during speech recognition.";
            break;
          case "aborted":
            code = "aborted";
            message = "Speech recognition was aborted.";
            break;
          default:
            message = event.message || `Speech recognition error: ${event.error}`;
        }

        if (code !== "aborted") {
          options.onError?.({ code, message });
          options.onStateChange?.("error");
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cleanup();
      };

      this.recognition.start();
    } catch (err: any) {
      await this.cleanup();
      options.onError?.({
        code: "unknown",
        message: err.message || "Failed to start speech recognition.",
      });
      options.onStateChange?.("error");
    }
  }

  public async stop(): Promise<void> {
    if (this.recognition && this.isListening) {
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

  /**
   * Set up Web Audio API AnalyserNode to calculate real-time volume levels
   */
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
        // Normalize roughly between 0 and 100
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        onAudioLevel(normalized);

        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn("AudioContext analyzer setup failed:", err);
    }
  }

  /**
   * Properly release all audio streams, context, and animation loops
   */
  private async cleanup(): Promise<void> {
    this.isListening = false;

    // 1. Cancel audio analysis frame loop
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // 2. Close AudioContext
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch {
        // Ignore close errors
      }
      this.audioContext = null;
    }
    this.analyser = null;

    // 3. Stop ALL media tracks in the MediaStream
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
 * Singleton speech-to-text service manager allowing interchangeable STT providers.
 */
class SpeechToTextManager {
  private provider: SpeechToTextProvider;

  constructor() {
    // Default to browser native Web Speech API provider
    this.provider = new WebSpeechSTTProvider();
  }

  /**
   * Set or switch to an alternate STT provider (e.g. Server-side Whisper / Cloud STT)
   */
  public setProvider(newProvider: SpeechToTextProvider) {
    this.provider.abort();
    this.provider = newProvider;
  }

  public getProvider(): SpeechToTextProvider {
    return this.provider;
  }

  public isSupported(): boolean {
    return this.provider.isSupported();
  }

  public async start(options: STTOptions): Promise<void> {
    return this.provider.start(options);
  }

  public async stop(): Promise<void> {
    return this.provider.stop();
  }

  public abort(): void {
    this.provider.abort();
  }
}

export const sttService = new SpeechToTextManager();
