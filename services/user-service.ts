import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { Profile, ProfileUpdate } from "@/types/database.types";

export const userService = {
  /**
   * Fetch profile for a specific user ID
   */
  async getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Update profile for the current user
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase
        .from("profiles") as any)
        .update(payload)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },
};
