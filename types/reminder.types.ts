import { z } from "zod";
import type { Reminder } from "./database.types";

export const createReminderSchema = z.object({
  title: z.string().min(1, "Reminder title is required").max(200),
  reminder_time: z.string().datetime("Invalid datetime format"),
  timezone: z.string().default("UTC"),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = Partial<CreateReminderInput> & {
  completed?: boolean;
};

export type { Reminder };
