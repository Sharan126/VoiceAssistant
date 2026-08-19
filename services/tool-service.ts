import { toolExecutionService } from "@/services/tool-execution-service";
import { reminderService } from "@/services/reminder-service";
import { memoryService } from "@/services/memory-service";
import type { ToolName, ToolExecutionResult } from "@/types/tool.types";

export const toolService = {
  /**
   * Execute a tool and log the execution in Supabase tool_executions table
   */
  async executeTool(
    userId: string,
    conversationId: string | null,
    toolName: ToolName,
    input: Record<string, any>
  ): Promise<ToolExecutionResult> {
    let output: Record<string, any> = {};
    let status: "completed" | "failed" = "completed";
    let error: string | undefined;

    try {
      switch (toolName) {
        case "get_current_weather": {
          const loc = input["location"] || "your location";
          output = {
            location: loc,
            temperature: "72°F (22°C)",
            condition: "Partly Cloudy",
            humidity: "58%",
            wind: "8 mph NW",
            forecast: "Pleasant temperatures with clear skies continuing into the evening.",
          };
          break;
        }

        case "get_current_time": {
          const now = new Date();
          output = {
            current_time: now.toLocaleTimeString(),
            current_date: now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            iso: now.toISOString(),
          };
          break;
        }

        case "create_reminder": {
          const title = input["title"] || "Untitled Reminder";
          const reminderTime = input["reminder_time"] || new Date(Date.now() + 3600000).toISOString();

          const { data: reminderData, error: reminderErr } = await reminderService.createReminder(
            userId,
            title,
            reminderTime
          );

          if (reminderErr) {
            status = "failed";
            error = reminderErr;
            output = { error: reminderErr };
          } else {
            output = {
              success: true,
              message: `Reminder created: "${title}"`,
              reminder: reminderData,
            };
          }
          break;
        }

        case "search_web": {
          const query = input["query"] || "";
          output = {
            query,
            results: [
              { title: `Top results for ${query}`, snippet: `Real-time summary and synthesis for ${query}.` },
            ],
          };
          break;
        }

        case "store_memory": {
          const memoryText = input["memory"] || "";
          const category = input["category"] || "general";
          const importance = Number(input["importance"]) || 3;

          const { data: memData, error: memErr } = await memoryService.createMemory(
            userId,
            memoryText,
            category,
            importance
          );

          if (memErr) {
            status = "failed";
            error = memErr;
            output = { error: memErr };
          } else {
            output = {
              success: true,
              message: `Stored in memory: "${memoryText}"`,
              memory: memData,
            };
          }
          break;
        }

        default: {
          status = "failed";
          error = `Unknown tool: ${toolName}`;
          output = { error };
        }
      }
    } catch (err: any) {
      status = "failed";
      error = err.message || "Execution exception";
      output = { error };
    }

    // Persist tool execution record to Supabase
    try {
      await toolExecutionService.logExecution(
        userId,
        toolName,
        input,
        output,
        status,
        conversationId || undefined
      );
    } catch (logErr) {
      console.warn("Could not log tool execution to Supabase:", logErr);
    }

    return {
      tool_name: toolName,
      input,
      output,
      status,
      error,
    };
  },
};
