import { z } from "zod";
import type { Memory } from "./database.types";

export const createMemorySchema = z.object({
  memory: z.string().min(1, "Memory content is required").max(1000),
  category: z.string().min(1).default("general"),
  importance: z.number().int().min(1).max(5).default(1),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type UpdateMemoryInput = Partial<CreateMemoryInput>;

export type { Memory };
