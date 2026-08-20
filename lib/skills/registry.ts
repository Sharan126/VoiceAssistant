/**
 * Aura Voice 2.0 — Custom Skills Registry Architecture
 * Defines structured skills with permission rules, confirmation requirements, and execution schemas.
 */

import { calculatorTool } from "@/lib/tools/calculator";
import { weatherTool } from "@/lib/tools/weather";
import { webSearchTool } from "@/lib/tools/web-search";
import { remindersTool } from "@/lib/tools/reminders";
import { notesTool } from "@/lib/tools/notes";

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: "calculator" | "weather" | "search" | "productivity" | "vision" | "files" | "learning";
  icon: string;
  requiresConfirmation: boolean;
  execute: (input: any) => Promise<{ success: boolean; result?: any; error?: string }>;
}

export class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();

  constructor() {
    this.registerDefaultSkills();
  }

  private registerDefaultSkills() {
    // 1. Calculator Skill
    this.register({
      id: "calculator",
      name: "Calculator",
      description: "Evaluates mathematical expressions, formulas, and percentages accurately.",
      category: "calculator",
      icon: "Calculator",
      requiresConfirmation: false,
      execute: async (input) => {
        try {
          const res = await calculatorTool.execute(input, { userId: "system" });
          return { success: true, result: res.formatted || res.result };
        } catch (err: any) {
          return { success: false, error: err.message || "Calculator error" };
        }
      },
    });

    // 2. Weather Skill
    this.register({
      id: "weather",
      name: "Weather & Forecast",
      description: "Retrieves live weather forecasts, temperature, and atmospheric conditions.",
      category: "weather",
      icon: "Sun",
      requiresConfirmation: false,
      execute: async (input) => {
        try {
          const res = await weatherTool.execute(input, { userId: "system" });
          return { success: true, result: res };
        } catch (err: any) {
          return { success: false, error: err.message || "Weather service error" };
        }
      },
    });

    // 3. Web Search Skill
    this.register({
      id: "web_search",
      name: "Web Search",
      description: "Searches the web for recent news, events, and factual information.",
      category: "search",
      icon: "Search",
      requiresConfirmation: false,
      execute: async (input) => {
        try {
          const res = await webSearchTool.execute(input, { userId: "system" });
          return { success: true, result: res };
        } catch (err: any) {
          return { success: false, error: err.message || "Search service error" };
        }
      },
    });

    // 4. Reminders Skill
    this.register({
      id: "reminders",
      name: "Reminders & Alerts",
      description: "Creates, lists, and manages user reminders and scheduled alerts.",
      category: "productivity",
      icon: "Bell",
      requiresConfirmation: false,
      execute: async (input) => {
        try {
          const res = await remindersTool.execute(input, { userId: "system" });
          return { success: true, result: res };
        } catch (err: any) {
          return { success: false, error: err.message || "Reminders error" };
        }
      },
    });

    // 5. Notes Skill
    this.register({
      id: "notes",
      name: "Notes & Ideas",
      description: "Saves, lists, and organizes personal notes and brain dumps.",
      category: "productivity",
      icon: "FileText",
      requiresConfirmation: false,
      execute: async (input) => {
        try {
          const res = await notesTool.execute(input, { userId: "system" });
          return { success: true, result: res };
        } catch (err: any) {
          return { success: false, error: err.message || "Notes error" };
        }
      },
    });
  }

  public register(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill);
  }

  public getSkill(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  public listSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }
}

export const skillRegistry = new SkillRegistry();
