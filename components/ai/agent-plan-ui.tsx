"use client";

import { CheckCircle2, Loader2, Circle, AlertCircle, Bot } from "lucide-react";
import type { AgentRunPlan } from "@/lib/agent/agent-engine";

interface AgentPlanUIProps {
  plan: AgentRunPlan;
}

/**
 * Plan + Action Progress UI.
 * Displays high-level execution steps cleanly without exposing raw chain-of-thought.
 */
export function AgentPlanUI({ plan }: AgentPlanUIProps) {
  if (!plan || !plan.steps.length) return null;

  return (
    <div className="my-3.5 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
        <Bot className="h-4 w-4 text-indigo-400" />
        <span>Agent Goal Execution Plan</span>
      </div>

      <div className="space-y-2.5">
        {plan.steps.map((step) => {
          const isPending = step.status === "pending";
          const isRunning = step.status === "running";
          const isCompleted = step.status === "completed";
          const isFailed = step.status === "failed";

          return (
            <div key={step.id} className="flex items-start gap-2.5 text-xs sm:text-sm">
              <div className="mt-0.5 shrink-0">
                {isRunning && <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />}
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {isFailed && <AlertCircle className="h-4 w-4 text-rose-400" />}
                {isPending && <Circle className="h-4 w-4 text-muted-foreground/50" />}
              </div>

              <div className="flex-1">
                <div
                  className={`font-medium ${
                    isCompleted
                      ? "text-foreground"
                      : isRunning
                      ? "text-indigo-300 font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[11px] text-muted-foreground/80">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
