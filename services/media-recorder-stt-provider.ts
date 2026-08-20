import type {
  SpeechToTextProvider,
  STTOptions,
} from "@/types/voice.types";

/**
 * MediaRecorder + Server STT Fallback Provider.
 * Captures microphone audio safely using MediaRecorder API and posts audio blob to /api/stt.
 */
export class MediaRecorderSTTProvider implements SpeechToTextProvider {
  public name = "MediaRecorderSTT";
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isRecording = false;
  private currentOptions: STTOptions | null = null;

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      typeof navigator !== "undefined" &&
      navigator?.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof (window as any).MediaRecorder !== "undefined"
    );
  }

  public getRecordingState(): boolean {
    return this.isRecording;
  }

  public async start(options: STTOptions): Promise<void> {
    if (!this.isSupported()) {
      options.onError?.({
        code: "not-supported",
        message: "Microphone recording is not supported in this browser.",
      });
      return;
    }

    await this.cleanup();
    this.currentOptions = options;
    this.audioChunks = [];

    try {
      options.onStateChange?.("requesting_permission");

      // 1. Request microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Select supported MIME type
      const mimeType = this.getSupportedMimeType();

      this.mediaRecorder = new MediaRecorder(
        this.mediaStream,
        mimeType ? { mimeType } : undefined
      );

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording = true;
        options.onStateChange?.("listening");
        // Attach Web Audio API analyser loop AFTER recording confirmed started
        if (this.mediaStream) {
          this.setupAudioAnalysis(this.mediaStream, options.onAudioLevel);
        }
      };

      this.mediaRecorder.onerror = (event: any) => {
        this.isRecording = false;
        options.onError?.({
          code: "audio-capture",
          message: event.error?.message || "Audio recording error occurred.",
        });
        options.onStateChange?.("error");
        this.cleanup();
      };

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        const currentOpts = this.currentOptions;

        if (this.audioChunks.length === 0) {
          currentOpts?.onStateChange?.("idle");
          await this.cleanup();
          return;
        }

        const audioBlob = new Blob(this.audioChunks, {
          type: mimeType || "audio/webm",
        });
        this.audioChunks = [];

        if (audioBlob.size < 100) {
          currentOpts?.onStateChange?.("idle");
          await this.cleanup();
          return;
        }

        try {
          currentOpts?.onStateChange?.("processing");
          const transcript = await this.uploadAndTranscribe(
            audioBlob,
            currentOpts?.language ?? "en-US"
          );

          if (transcript) {
            currentOpts?.onFinalTranscript?.(transcript);
            currentOpts?.onStateChange?.("success");
          } else {
            currentOpts?.onError?.({
              code: "no-speech",
              message: "No speech detected in audio.",
            });
            currentOpts?.onStateChange?.("error");
          }
        } catch (err: any) {
          currentOpts?.onError?.({
            code: "network",
            message: err.message || "Failed to process audio transcript.",
          });
          currentOpts?.onStateChange?.("error");
        } finally {
          await this.cleanup();
        }
      };

      // Start MediaRecorder with 250ms timeslice chunks
      this.mediaRecorder.start(250);
    } catch (err: any) {
      await this.cleanup();

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        options.onError?.({
          code: "not-allowed",
          message: "Microphone permission was denied. Please allow microphone access in your browser settings.",
        });
      } else {
        options.onError?.({
          code: "audio-capture",
          message: err.message || "Failed to start microphone recording.",
        });
      }
      options.onStateChange?.("error");
    }
  }

  public async stop(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignore
      }
    } else {
      await this.cleanup();
      this.currentOptions?.onStateChange?.("idle");
    }
  }

  public abort(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    this.cleanup();
    this.currentOptions?.onStateChange?.("idle");
  }

  private getSupportedMimeType(): string | undefined {
    if (typeof MediaRecorder === "undefined") return undefined;
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/aac",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return undefined;
  }

  private async uploadAndTranscribe(blob: Blob, language: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("language", language);

    const response = await fetch("/api/stt", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let msg = "Speech-to-text service error.";
      try {
        const json = await response.json();
        msg = json.error || msg;
      } catch {
        // Ignore
      }
      throw new Error(msg);
    }

    const data = (await response.json()) as { transcript: string };
    return data.transcript || "";
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
      console.warn("MediaRecorder AudioContext analyzer setup error:", err);
    }
  }

  private async cleanup(): Promise<void> {
    this.isRecording = false;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch {
        // Ignore
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

    this.mediaRecorder = null;
  }
}
