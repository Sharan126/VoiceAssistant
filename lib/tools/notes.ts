import { z } from "zod";
import { memoryService } from "@/services/memory-service";
import type { AgentTool } from "./types";

export const notesSchema = z.object({
  action: z.enum(["save", "recall"]).default("save").describe("Action: 'save' a new note/memory or 'recall' stored memories"),
  note: z.string().optional().describe("The note, fact, or preference to remember"),
  category: z.string().optional().default("general").describe("Category, e.g. 'work', 'preference', 'project'"),
  importance: z.number().min(1).max(5).optional().default(3).describe("Importance rating from 1 to 5"),
});

export type NotesInput = z.infer<typeof notesSchema>;

export const notesTool: AgentTool<NotesInput, any> = {
  name: "notes",
  description:
    "Store and recall long-term user memories, notes, facts, and personal context stored in the database. Use when the user says 'Remember that...' or asks to recall something.",
  schema: notesSchema,
  async execute(input, context) {
    if (input.action === "recall") {
      const { data, error } = await memoryService.getMemories(context.userId);
      if (error) throw new Error(`Failed to recall memories: ${error}`);
      return {
        action: "recall",
        count: data?.length || 0,
        notes: (data || []).slice(0, 5),
        summary: `Retrieved ${data?.length || 0} memory record(s).`,
      };
    }

    const noteText = input.note?.trim() || "Untitled Note";
    const { data, error } = await memoryService.createMemory(
      context.userId,
      noteText,
      input.category || "general",
      input.importance || 3
    );

    if (error) {
      throw new Error(`Failed to save memory to database: ${error}`);
    }

    return {
      action: "save",
      success: true,
      memory_id: data?.id,
      note: noteText,
      category: input.category,
      summary: `Note saved to memory: "${noteText}".`,
    };
  },
};
