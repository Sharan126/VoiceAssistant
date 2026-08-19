import { z } from "zod";
import type { Conversation, Message, MessageRole } from "./database.types";

export const createConversationSchema = z.object({
  title: z.string().min(1, "Conversation title is required").max(100).default("New Conversation"),
});

export const createMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  role: z.enum(["user", "assistant", "system", "tool"] as const),
  content: z.string().min(1, "Message content cannot be empty"),
  metadata: z.record(z.any()).optional().default({}),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export interface ConversationWithMessages extends Conversation {
  messages?: Message[];
}

export type { Conversation, Message, MessageRole };
