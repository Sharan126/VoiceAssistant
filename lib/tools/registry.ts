import { toolExecutionService } from "@/services/tool-execution-service";
import type { AgentTool, ToolContext, ToolExecutionRecord } from "./types";

export class ToolRegistry {
  private tools = new Map<string, AgentTool>();

  public register(tool: AgentTool): void {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  public getAll(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  public has(name: string): boolean {
    return this.tools.has(name);
  }

  public getToolDeclarations(): { name: string; description: string }[] {
    return this.getAll().map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }

  /**
   * Safe tool execution with Zod input validation and Supabase audit logging
   */
  public async executeTool(
    name: string,
    rawInput: unknown,
    context: ToolContext
  ): Promise<ToolExecutionRecord> {
    const tool = this.get(name);
    if (!tool) {
      const errorMsg = `Tool '${name}' is not registered.`;
      return {
        toolName: name,
        input: (rawInput as Record<string, any>) || {},
        output: { error: errorMsg },
        status: "failed",
        error: errorMsg,
      };
    }

    // 1. Validate Input Schema with Zod
    const parseResult = tool.schema.safeParse(rawInput);
    if (!parseResult.success) {
      const validationError = `Invalid input for tool '${name}': ${parseResult.error.message}`;
      const failedRecord: ToolExecutionRecord = {
        toolName: name,
        input: (rawInput as Record<string, any>) || {},
        output: { error: validationError, issues: parseResult.error.issues },
        status: "failed",
        error: validationError,
      };

      await this.logToDatabase(failedRecord, context);
      return failedRecord;
    }

    // 2. Execute the Tool safely
    try {
      const output = await tool.execute(parseResult.data, context);
      const successRecord: ToolExecutionRecord = {
        toolName: name,
        input: parseResult.data as Record<string, any>,
        output: typeof output === "object" && output !== null ? output : { result: output },
        status: "completed",
      };

      await this.logToDatabase(successRecord, context);
      return successRecord;
    } catch (err: any) {
      const execError = err.message || `An error occurred while executing tool '${name}'.`;
      const failedRecord: ToolExecutionRecord = {
        toolName: name,
        input: parseResult.data as Record<string, any>,
        output: { error: execError },
        status: "failed",
        error: execError,
      };

      await this.logToDatabase(failedRecord, context);
      return failedRecord;
    }
  }

  /**
   * Persist execution record in Supabase tool_executions table
   */
  private async logToDatabase(record: ToolExecutionRecord, context: ToolContext): Promise<void> {
    try {
      await toolExecutionService.logExecution(
        context.userId,
        record.toolName,
        record.input,
        record.output,
        record.status,
        context.conversationId || undefined
      );
    } catch (dbErr) {
      console.warn(`Failed to log execution of '${record.toolName}' to Supabase:`, dbErr);
    }
  }
}

export const toolRegistry = new ToolRegistry();
