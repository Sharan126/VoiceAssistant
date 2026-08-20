import type { TextToSpeechProvider, TTSVoice, TTSOptions } from "@/types/tts.types";

/**
 * Strips markdown, code blocks, links, and formatting symbols
 * to produce clean, natural spoken audio.
 */
export function cleanTextForSpeech(text: string): string {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, " code snippet omitted ")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove headers (# Header)
    .replace(/#{1,6}\s+/g, "")
    // Remove bold and italics (*text* or **text**)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove bullet points
    .replace(/^\s*[-*+]\s+/gm, "")
    // Remove numbered list prefixes
    .replace(/^\s*\d+\.\s+/gm, "")
    // Remove emojis & extra whitespace
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Browser Speech Synthesis API (TTS) Provider
 */
export class WebSpeechTTSProvider implements TextToSpeechProvider {
  public name = "WebSpeechSynthesis";
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingInternal = false;

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public getSpeakingState(): boolean {
    return this.isSpeakingInternal;
  }

  public getActiveUtterance(): SpeechSynthesisUtterance | null {
    return this.activeUtterance;
  }

  public async getVoices(): Promise<TTSVoice[]> {
    if (!this.isSupported()) return [];

    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(this.mapVoices(voices));
        return;
      }

      // Voices may load asynchronously in Chrome/Edge
      const handleVoicesChanged = () => {
        voices = window.speechSynthesis.getVoices();
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        resolve(this.mapVoices(voices));
      };

      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

      // Fallback timeout in case voiceschanged does not fire
      setTimeout(() => {
        resolve(this.mapVoices(window.speechSynthesis.getVoices()));
      }, 1000);
    });
  }

  private mapVoices(voices: SpeechSynthesisVoice[]): TTSVoice[] {
    return voices.map((v) => ({
      id: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
      default: v.default,
      localService: v.localService,
    }));
  }

  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.isSupported()) {
      options.onError?.(new Error("Text-to-Speech is not supported in this browser."));
      return;
    }

    // Stop any ongoing speech before starting new speech
    this.stop();

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      options.onEnd?.();
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        this.activeUtterance = utterance;

        // Configure speech parameters
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;
        utterance.volume = options.volume ?? 1.0;

        // Select specified voice or automatically match voice to target language
        const availableVoices = window.speechSynthesis.getVoices();
        let selectedVoice: SpeechSynthesisVoice | undefined;

        // 1. If explicit voice name specified, look up exact voice
        if (options.voice && options.voice !== "default") {
          selectedVoice = availableVoices.find(
            (v) => v.name === options.voice || v.voiceURI === options.voice
          );
        }

        // 2. Automatically match voice by speechCode or language code
        if (!selectedVoice && (options.speechCode || options.language)) {
          const targetCode = (options.speechCode || options.language || "").toLowerCase();
          const langPrefix = targetCode.split("-")[0]?.toLowerCase() || targetCode;

          // Exact BCP-47 match (e.g. kn-IN, hi-IN, te-IN, ta-IN, mr-IN, en-US)
          selectedVoice = availableVoices.find(
            (v) => v.lang && v.lang.toLowerCase() === targetCode
          );

          // Language prefix match (e.g. kn, hi, te, ta, mr, en)
          if (!selectedVoice) {
            selectedVoice = availableVoices.find(
              (v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix)
            );
          }
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else if (options.speechCode) {
          utterance.lang = options.speechCode;
        }

        utterance.onstart = () => {
          this.isSpeakingInternal = true;
          options.onStart?.();
        };

        utterance.onend = () => {
          this.isSpeakingInternal = false;
          this.activeUtterance = null;
          options.onEnd?.();
          resolve();
        };

        utterance.onerror = (e) => {
          this.isSpeakingInternal = false;
          this.activeUtterance = null;
          // 'canceled' or 'interrupted' is normal when user interrupts
          if (e.error === "canceled" || e.error === "interrupted") {
            options.onEnd?.();
            resolve();
          } else {
            const err = new Error(`TTS playback error: ${e.error}`);
            options.onError?.(err);
            reject(err);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        this.isSpeakingInternal = false;
        this.activeUtterance = null;
        options.onError?.(err);
        reject(err);
      }
    });
  }

  public stop(): void {
    if (!this.isSupported()) return;

    this.isSpeakingInternal = false;
    this.activeUtterance = null;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
  }

  public pause(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.pause();
  }

  public resume(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.resume();
  }
}

/**
 * Singleton Text-to-Speech manager
 */
class TextToSpeechManager {
  private provider: TextToSpeechProvider;

  constructor() {
    this.provider = new WebSpeechTTSProvider();
  }

  public setProvider(newProvider: TextToSpeechProvider) {
    this.provider.stop();
    this.provider = newProvider;
  }

  public getProvider(): TextToSpeechProvider {
    return this.provider;
  }

  public isSupported(): boolean {
    return this.provider.isSupported();
  }

  public async getVoices(): Promise<TTSVoice[]> {
    return this.provider.getVoices();
  }

  public async speak(text: string, options?: TTSOptions): Promise<void> {
    return this.provider.speak(text, options);
  }

  public stop(): void {
    this.provider.stop();
  }

  public pause(): void {
    this.provider.pause();
  }

  public resume(): void {
    this.provider.resume();
  }
}

export const ttsService = new TextToSpeechManager();
