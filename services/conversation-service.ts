import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { Conversation, ConversationInsert } from "@/types/database.types";

export const conversationService = {
  /**
   * Create a new conversation for the current user
   */
  async createConversation(
    userId: string,
    title = "New Conversation"
  ): Promise<{ data: Conversation | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload: ConversationInsert = {
        user_id: userId,
        title,
      };

      const { data, error } = await (supabase.from("conversations") as any)
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Conversation, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<{ data: Conversation[]; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as Conversation[]) ?? [], error: null };
    } catch (err) {
      return { data: [], error: getErrorMessage(err) };
    }
  },

  /**
   * Get single conversation by ID
   */
  async getConversationById(
    conversationId: string
  ): Promise<{ data: Conversation | null; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Conversation, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<{ data: Conversation | null; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase.from("conversations") as any)
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as Conversation, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Delete a conversation (cascades to messages and tool executions)
   */
  async deleteConversation(conversationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },
};
