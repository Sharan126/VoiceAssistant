export type VoiceState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "thinking"
  | "tool_execution"
  | "speaking"
  | "success"
  | "error";

export type STTState =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "success"
  | "error";

export interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onAudioLevel?: (level: number) => void; // 0 to 100
  onError?: (error: STTError) => void;
  onStateChange?: (state: STTState) => void;
}

export interface STTError {
  code:
    | "not-allowed"
    | "no-speech"
    | "audio-capture"
    | "network"
    | "not-supported"
    | "aborted"
    | "unknown";
  message: string;
}

export interface SpeechToTextProvider {
  name: string;
  isSupported(): boolean;
  start(options: STTOptions): Promise<void>;
  stop(): Promise<void>;
  abort(): void;
}

export interface SuggestedPrompt {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  category: "productivity" | "knowledge" | "web" | "coding" | "reminder";
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "weather",
    title: "Today's weather",
    prompt: "What is today's weather forecast?",
    icon: "Globe",
    category: "web",
  },
  {
    id: "reminder",
    title: "Create a reminder",
    prompt: "Remind me to submit the weekly report at 5:00 PM.",
    icon: "Bell",
    category: "reminder",
  },
  {
    id: "plan-day",
    title: "Plan my day",
    prompt: "Help me structure my priorities and schedule for today.",
    icon: "Calendar",
    category: "productivity",
  },
  {
    id: "explain",
    title: "Explain something",
    prompt: "Explain quantum computing in simple terms with a real-world analogy.",
    icon: "Sparkles",
    category: "knowledge",
  },
  {
    id: "code",
    title: "Help me code",
    prompt: "Write a TypeScript function to debounce audio stream chunks.",
    icon: "Code",
    category: "coding",
  },
];
