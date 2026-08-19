export type ToolName =
  | "get_current_weather"
  | "get_current_time"
  | "create_reminder"
  | "search_web"
  | "store_memory";

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parameters: Record<string, any>;
}

export interface ToolCallPayload {
  tool_name: ToolName;
  input: Record<string, any>;
}

export interface ToolExecutionResult {
  tool_name: ToolName;
  input: Record<string, any>;
  output: Record<string, any>;
  status: "completed" | "failed";
  error?: string;
}

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: "get_current_weather",
    description: "Get real-time weather information and forecast for a given city or location.",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "City or region name, e.g. 'San Francisco' or 'Tokyo'" },
      },
      required: ["location"],
    },
  },
  {
    name: "get_current_time",
    description: "Get the current time, date, and timezone.",
    parameters: {
      type: "object",
      properties: {
        timezone: { type: "string", description: "Optional timezone identifier, e.g. 'America/New_York'" },
      },
    },
  },
  {
    name: "create_reminder",
    description: "Create and persist a new reminder for the user.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The reminder task title" },
        reminder_time: { type: "string", description: "ISO date-time or relative time string" },
      },
      required: ["title"],
    },
  },
  {
    name: "search_web",
    description: "Search the web for up-to-date information, news, or articles.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string" },
      },
      required: ["query"],
    },
  },
  {
    name: "store_memory",
    description: "Store an important fact, preference, or piece of context into long-term user memory.",
    parameters: {
      type: "object",
      properties: {
        memory: { type: "string", description: "The specific fact or preference to remember" },
        category: { type: "string", description: "Category, e.g. 'preference', 'work', 'personal'" },
        importance: { type: "number", description: "Importance rating between 1 and 5" },
      },
      required: ["memory"],
    },
  },
];
