import { z } from "zod";

/**
 * Strips dangerous ASCII control characters while preserving valid newlines and tabs
 */
export function sanitizeInputText(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export const messageItemSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z
    .string()
    .min(1, "Message content cannot be empty.")
    .max(4000, "Message length cannot exceed 4,000 characters.")
    .transform((val) => sanitizeInputText(val).trim()),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().optional(),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(messageItemSchema)
    .min(1, "At least one message is required.")
    .max(50, "Conversation history cannot exceed 50 messages in a single turn."),
  conversationId: z
    .string()
    .uuid("Invalid conversation ID format.")
    .nullable()
    .optional(),
  systemPromptOverride: z
    .string()
    .max(2000, "System prompt override cannot exceed 2,000 characters.")
    .optional(),
});

export type ValidatedChatRequest = z.infer<typeof chatRequestSchema>;
