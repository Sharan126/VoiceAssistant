import { OpenAICompatibleProvider } from "./openai-provider";
import type { AIProvider } from "./provider";

/**
 * Get active AI Provider (defaults to universal OpenAI-compatible streaming provider).
 * Can be swapped dynamically for Anthropic, Gemini, or custom local LLMs.
 */
export function getAIProvider(): AIProvider {
  return new OpenAICompatibleProvider();
}

export * from "./config";
export * from "./provider";
export * from "./openai-provider";
