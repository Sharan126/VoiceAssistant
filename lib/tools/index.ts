import { toolRegistry } from "./registry";
import { calculatorTool } from "./calculator";
import { weatherTool } from "./weather";
import { webSearchTool } from "./web-search";
import { remindersTool } from "./reminders";
import { notesTool } from "./notes";

// Register all 5 core tools into the singleton registry
toolRegistry.register(calculatorTool);
toolRegistry.register(weatherTool);
toolRegistry.register(webSearchTool);
toolRegistry.register(remindersTool);
toolRegistry.register(notesTool);

export { toolRegistry } from "./registry";
export * from "./types";
export * from "./calculator";
export * from "./weather";
export * from "./web-search";
export * from "./reminders";
export * from "./notes";
