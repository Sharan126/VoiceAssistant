/**
 * Aura Voice 2.0 — Agent Execution & Multi-Step Planner Engine
 * Decomposes complex user goals into discrete plan steps and executes required tools sequentially.
 */

import { skillRegistry } from "@/lib/skills/registry";

export interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  toolName?: string;
  toolInput?: Record<string, any>;
  result?: string;
}

export interface AgentRunPlan {
  goal: string;
  steps: AgentStep[];
  status: "planning" | "executing" | "completed" | "failed";
}

/**
 * Creates an execution plan for multi-step goals
 */
export function buildAgentRunPlan(goalPrompt: string): AgentRunPlan {
  const text = goalPrompt.trim();
  const lower = text.toLowerCase();
  const steps: AgentStep[] = [];

  // Step 1: Goal Understanding
  steps.push({
    id: "step-understand",
    title: "Understanding Goal",
    description: `Analyzing parameters for: "${text.slice(0, 45)}${text.length > 45 ? "..." : ""}"`,
    status: "pending",
  });

  // Step 2: Weather step if trip/outdoor planning is detected
  if (lower.includes("trip") || lower.includes("weather") || lower.includes("travel") || lower.includes("bangalore") || lower.includes("weekend")) {
    const locMatch = text.match(/(?:in|to|for)\s+([a-zA-Z\s,]+)/i);
    const targetLoc = locMatch ? locMatch[1]?.replace(/[?.!]/g, "").trim() : "Bangalore";
    steps.push({
      id: "step-weather",
      title: "Checking Weather Conditions",
      description: `Retrieving live forecast for ${targetLoc}`,
      status: "pending",
      toolName: "weather",
      toolInput: { location: targetLoc || "Bangalore" },
    });
  }

  // Step 3: Web Search step if research/recommendations are detected
  if (lower.includes("plan") || lower.includes("places") || lower.includes("recommend") || lower.includes("search") || lower.includes("study")) {
    steps.push({
      id: "step-search",
      title: "Searching Relevant Recommendations",
      description: "Gathering information and itineraries",
      status: "pending",
      toolName: "web_search",
      toolInput: { query: text },
    });
  }

  // Step 4: Schedule / Reminders step if scheduling is mentioned
  if (lower.includes("remind") || lower.includes("schedule") || lower.includes("study plan") || lower.includes("weekly")) {
    steps.push({
      id: "step-reminder",
      title: "Setting Up Reminders",
      description: "Creating calendar alerts and tasks",
      status: "pending",
      toolName: "reminders",
      toolInput: { action: "create", title: `Follow up on: ${text.slice(0, 30)}` },
    });
  }

  // Final Step: Finalizing Output
  steps.push({
    id: "step-finalize",
    title: "Building Comprehensive Plan",
    description: "Synthesizing results into a clean, actionable output",
    status: "pending",
  });

  return {
    goal: text,
    steps,
    status: "planning",
  };
}

/**
 * Execute agent run plan sequentially
 */
export async function executeAgentRunPlan(
  plan: AgentRunPlan,
  onProgress?: (updatedPlan: AgentRunPlan) => void
): Promise<AgentRunPlan> {
  const updatedPlan: AgentRunPlan = { ...plan, status: "executing" };

  for (let i = 0; i < updatedPlan.steps.length; i++) {
    const step = updatedPlan.steps[i];
    if (!step) continue;

    step.status = "running";
    onProgress?.({ ...updatedPlan });

    if (step.toolName) {
      const skill = skillRegistry.getSkill(step.toolName);
      if (skill && step.toolInput) {
        try {
          const res = await skill.execute(step.toolInput);
          step.result = res.success ? JSON.stringify(res.result) : res.error;
          step.status = res.success ? "completed" : "failed";
        } catch (err: any) {
          step.status = "failed";
          step.result = err.message || "Execution error";
        }
      } else {
        step.status = "completed";
      }
    } else {
      // Non-tool step simulation delay for visual progress
      await new Promise((resolve) => setTimeout(resolve, 250));
      step.status = "completed";
    }

    onProgress?.({ ...updatedPlan });
  }

  updatedPlan.status = "completed";
  onProgress?.({ ...updatedPlan });
  return updatedPlan;
}
