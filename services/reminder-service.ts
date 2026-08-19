import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { Reminder, ReminderInsert } from "@/types/database.types";

export const reminderService = {
  /**
   * Create a new reminder
   */
  async createReminder(
    userId: string,
    title: string,
    reminder_time: string,
    timezone = "UTC"
  ): Promise<{ data: Reminder | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload: ReminderInsert = {
        user_id: userId,
        title,
        reminder_time,
        timezone,
        completed: false,
      };

      const { data, error } = await (supabase.from("reminders") as any)
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Reminder, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Get all reminders for a user
   */
  async getReminders(userId: string): Promise<{ data: Reminder[]; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .order("reminder_time", { ascending: true });

      if (error) return { data: [], error: error.message };
      return { data: (data as Reminder[]) ?? [], error: null };
    } catch (err) {
      return { data: [], error: getErrorMessage(err) };
    }
  },

  /**
   * Toggle reminder completed status
   */
  async toggleReminder(
    reminderId: string,
    completed: boolean
  ): Promise<{ data: Reminder | null; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase.from("reminders") as any)
        .update({ completed })
        .eq("id", reminderId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Reminder, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Delete reminder
   */
  async deleteReminder(reminderId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", reminderId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },
};
