import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { Memory, MemoryInsert, MemoryUpdate } from "@/types/database.types";

export const memoryService = {
  /**
   * Create a new memory
   */
  async createMemory(
    userId: string,
    memory: string,
    category = "general",
    importance = 1
  ): Promise<{ data: Memory | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload: MemoryInsert = {
        user_id: userId,
        memory,
        category,
        importance,
      };

      const { data, error } = await (supabase.from("memories") as any)
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Memory, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Get all memories for a user
   */
  async getMemories(userId: string): Promise<{ data: Memory[]; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as Memory[]) ?? [], error: null };
    } catch (err) {
      return { data: [], error: getErrorMessage(err) };
    }
  },

  /**
   * Update memory
   */
  async updateMemory(
    memoryId: string,
    updates: MemoryUpdate
  ): Promise<{ data: Memory | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase.from("memories") as any)
        .update(payload)
        .eq("id", memoryId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Memory, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Delete memory
   */
  async deleteMemory(memoryId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },
};
