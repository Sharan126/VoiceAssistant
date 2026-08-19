export interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  default: boolean;
  localService?: boolean;
}

export interface TTSOptions {
  voice?: string;
  rate?: number; // 0.5 to 2.0
  pitch?: number; // 0.5 to 1.5
  volume?: number; // 0 to 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface TextToSpeechProvider {
  name: string;
  isSupported(): boolean;
  getVoices(): Promise<TTSVoice[]>;
  speak(text: string, options?: TTSOptions): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
}
