import { createClient } from "@/supabase/client";
import { getErrorMessage } from "@/utils/errors";
import type { ToolExecution, ToolExecutionInsert, ToolExecutionStatus } from "@/types/database.types";

export const toolExecutionService = {
  /**
   * Log a tool execution record
   */
  async logExecution(
    userId: string,
    toolName: string,
    input: Record<string, any> = {},
    output: Record<string, any> = {},
    status: ToolExecutionStatus = "completed",
    conversationId?: string | null
  ): Promise<{ data: ToolExecution | null; error: string | null }> {
    try {
      const supabase = createClient();
      const payload: ToolExecutionInsert = {
        user_id: userId,
        tool_name: toolName,
        input,
        output,
        status,
        conversation_id: conversationId ?? null,
      };

      const { data, error } = await (supabase.from("tool_executions") as any)
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: data as ToolExecution, error: null };
    } catch (err) {
      return { data: null, error: getErrorMessage(err) };
    }
  },

  /**
   * Get all tool executions for a user
   */
  async getExecutions(userId: string): Promise<{ data: ToolExecution[]; error: string | null }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tool_executions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as ToolExecution[]) ?? [], error: null };
    } catch (err) {
      return { data: [], error: getErrorMessage(err) };
    }
  },
};
