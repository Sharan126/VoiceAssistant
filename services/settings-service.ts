import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import { DEFAULT_USER_SETTINGS } from "@/types/settings.types";
import type { UserSettings, UserSettingsUpdate } from "@/types/database.types";

export const settingsService = {
  /**
   * Get settings for a user (or initialize default if not existing)
   */
  async getUserSettings(userId: string): Promise<{ data: UserSettings | null; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) return { data: null, error: error.message };

      if (!data) {
        // Fallback: create default settings if record was missing
        const { data: created, error: insertError } = await (supabase.from("user_settings") as any)
          .insert({
            user_id: userId,
            ...DEFAULT_USER_SETTINGS,
          })
          .select()
          .single();

        if (insertError) return { data: null, error: insertError.message };
        return { data: created as UserSettings, error: null };
      }

      return { data: data as UserSettings, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    updates: UserSettingsUpdate
  ): Promise<{ data: UserSettings | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase.from("user_settings") as any)
        .update(payload)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as UserSettings, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Privacy: Clear all conversations for the user
   */
  async clearAllConversations(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("user_id", userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Privacy: Clear all memories for the user
   */
  async clearAllMemories(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("user_id", userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Privacy: Delete user account and all personal records
   */
  async deleteAccount(): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { success: false, error: "No authenticated user session found." };

      // Cascade clean user rows
      await Promise.all([
        supabase.from("conversations").delete().eq("user_id", user.id),
        supabase.from("memories").delete().eq("user_id", user.id),
        supabase.from("reminders").delete().eq("user_id", user.id),
        supabase.from("tool_executions").delete().eq("user_id", user.id),
        supabase.from("user_settings").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("id", user.id),
      ]);

      await supabase.auth.signOut();
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },
};
