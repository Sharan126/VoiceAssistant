import { z } from "zod";

export interface ToolContext {
  userId: string;
  conversationId?: string | null;
}

export interface AgentTool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: z.ZodType<TInput, any, any>;
  execute(input: TInput, context: ToolContext): Promise<TOutput>;
}

export interface ToolExecutionRecord {
  toolName: string;
  input: Record<string, any>;
  output: Record<string, any>;
  status: "completed" | "failed";
  error?: string;
}
