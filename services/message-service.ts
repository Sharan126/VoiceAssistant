import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { Message, MessageInsert, MessageRole } from "@/types/database.types";

export const messageService = {
  /**
   * Insert a message into a conversation
   */
  async createMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<{ data: Message | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload: MessageInsert = {
        conversation_id: conversationId,
        role,
        content,
        metadata,
      };

      const { data, error } = await (supabase.from("messages") as any)
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: error.message };

      // Touch the parent conversation's updated_at timestamp
      await (supabase.from("conversations") as any)
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return { data: data as Message, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Get all messages for a specific conversation ordered chronologically
   */
  async getMessages(conversationId: string): Promise<{ data: Message[]; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) return { data: [], error: error.message };
      return { data: (data as Message[]) ?? [], error: null };
    } catch (err) {
      return { data: [], error: getErrorMessage(err) };
    }
  },

  /**
   * Delete a single message
   */
  async deleteMessage(messageId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  },
};
