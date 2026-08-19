import type { AIStreamOptions } from "@/types/ai.types";

export interface AIProvider {
  name: string;
  streamChat(options: AIStreamOptions): Promise<ReadableStream<Uint8Array>>;
}
