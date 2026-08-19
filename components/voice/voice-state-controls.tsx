"use client";

import { Button } from "@/components/ui/button";
import type { VoiceState } from "@/types/voice.types";
import { AlertCircle, Eye, Mic, Sparkles, Volume2 } from "lucide-react";

interface VoiceStateControlsProps {
  currentState: VoiceState;
  onStateChange: (state: VoiceState) => void;
}

const STATES: { state: VoiceState; label: string; icon: any }[] = [
  { state: "idle", label: "Idle", icon: Eye },
  { state: "listening", label: "Listening", icon: Mic },
  { state: "thinking", label: "Thinking", icon: Sparkles },
  { state: "speaking", label: "Speaking", icon: Volume2 },
  { state: "error", label: "Error", icon: AlertCircle },
];

export function VoiceStateControls({ currentState, onStateChange }: VoiceStateControlsProps) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-1.5 p-1.5 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm max-w-fit mx-auto">
      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 select-none">
        State Preview:
      </span>
      {STATES.map((s) => {
        const Icon = s.icon;
        const isActive = currentState === s.state;

        return (
          <Button
            key={s.state}
            size="sm"
            variant={isActive ? "default" : "ghost"}
            onClick={() => onStateChange(s.state)}
            className={`h-7 px-2.5 text-xs gap-1.5 rounded-lg ${
              isActive ? "shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            {s.label}
          </Button>
        );
      })}
    </div>
  );
}
