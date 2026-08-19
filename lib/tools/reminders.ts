import { z } from "zod";
import { reminderService } from "@/services/reminder-service";
import type { AgentTool } from "./types";

export const remindersSchema = z.object({
  action: z.enum(["create", "list"]).default("create").describe("Action: 'create' a new reminder or 'list' pending reminders"),
  title: z.string().optional().describe("The reminder task description, e.g. 'Study for exam' or 'Call doctor'"),
  reminder_time: z.string().optional().describe("ISO datetime string or human time offset for when the reminder triggers"),
});

export type RemindersInput = z.infer<typeof remindersSchema>;

export const remindersTool: AgentTool<RemindersInput, any> = {
  name: "reminders",
  description:
    "Create and manage user reminders and scheduled tasks stored securely in the database. Use to schedule alerts, study reminders, and deadlines.",
  schema: remindersSchema,
  async execute(input, context) {
    if (input.action === "list") {
      const { data, error } = await reminderService.getReminders(context.userId);
      if (error) throw new Error(`Failed to list reminders: ${error}`);
      return {
        action: "list",
        count: data?.length || 0,
        reminders: (data || []).slice(0, 5),
        summary: `You have ${data?.length || 0} active reminder(s).`,
      };
    }

    const title = input.title?.trim() || "Untitled Task";
    let triggerTime = input.reminder_time;

    if (!triggerTime) {
      // Default to 1 hour in the future if not specified
      triggerTime = new Date(Date.now() + 3600000).toISOString();
    }

    const { data, error } = await reminderService.createReminder(
      context.userId,
      title,
      triggerTime
    );

    if (error) {
      throw new Error(`Failed to create reminder in database: ${error}`);
    }

    return {
      action: "create",
      success: true,
      reminder_id: data?.id,
      title,
      reminder_time: triggerTime,
      summary: `Reminder set successfully: "${title}" at ${new Date(triggerTime).toLocaleString()}.`,
    };
  },
};
