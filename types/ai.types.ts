export type AIMessageRole = "user" | "assistant" | "system" | "tool";

export interface AIMessage {
  id?: string;
  role: AIMessageRole;
  content: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface AIChatRequest {
  conversationId?: string | null;
  messages: AIMessage[];
  systemPromptOverride?: string;
}

export interface AIStreamOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  signal?: AbortSignal;
}

export interface AIStreamChunk {
  content: string;
  isComplete?: boolean;
}

export interface AIError {
  code: "auth_error" | "rate_limit" | "invalid_request" | "provider_error" | "aborted" | "unknown";
  message: string;
  status?: number;
}
