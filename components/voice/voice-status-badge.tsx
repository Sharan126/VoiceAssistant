"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { VoiceState } from "@/types/voice.types";

interface VoiceStatusBadgeProps {
  state: VoiceState;
  errorMessage?: string | null;
  interimTranscript?: string;
  activeTool?: string | null;
  onRetry?: () => void;
}

export function VoiceStatusBadge({
  state,
  errorMessage,
  interimTranscript,
  activeTool,
  onRetry,
}: VoiceStatusBadgeProps) {
  const getToolDescription = (name?: string | null) => {
    switch (name) {
      case "get_current_weather":
        return "Checking real-time weather & forecast...";
      case "get_current_time":
        return "Fetching current time & date...";
      case "create_reminder":
        return "Creating and saving reminder...";
      case "search_web":
        return "Searching the web for latest info...";
      case "store_memory":
        return "Saving to long-term memory...";
      default:
        return "Executing tool...";
    }
  };

  const configs = {
    idle: {
      label: "Idle",
      sublabel: "Tap to speak or type your request below",
      dotClass: "bg-indigo-400",
      containerClass: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
    },
    requesting_permission: {
      label: "Permission",
      sublabel: "Requesting microphone permission...",
      dotClass: "bg-amber-400 animate-ping",
      containerClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
    listening: {
      label: "Listening...",
      sublabel: interimTranscript ? `"${interimTranscript}"` : "Listening... speak clearly into your mic",
      dotClass: "bg-cyan-400 animate-ping",
      containerClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    },
    processing: {
      label: "Processing...",
      sublabel: "Converting speech to text...",
      dotClass: "bg-purple-400 animate-pulse",
      containerClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
    thinking: {
      label: "Thinking...",
      sublabel: "Analyzing request & generating response",
      dotClass: "bg-purple-400 animate-pulse",
      containerClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
    tool_execution: {
      label: "Tool Active",
      sublabel: getToolDescription(activeTool),
      dotClass: "bg-amber-400 animate-ping",
      containerClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
    speaking: {
      label: "Speaking...",
      sublabel: "Synthesizing voice audio response",
      dotClass: "bg-emerald-400 animate-pulse",
      containerClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    success: {
      label: "Transcript Ready",
      sublabel: "Voice input captured successfully",
      dotClass: "bg-emerald-400",
      containerClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    error: {
      label: "Error",
      sublabel: errorMessage ?? "Couldn't understand that. Try again.",
      dotClass: "bg-red-400",
      containerClass: "border-red-500/30 bg-red-500/10 text-red-300",
    },
  }[state];

  return (
    <div className="flex flex-col items-center text-center space-y-2 select-none px-4">
      {/* State Status Pill */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${configs.containerClass}`}
      >
        <span className={`h-2 w-2 rounded-full ${configs.dotClass}`} />
        <span>{configs.label}</span>
      </motion.div>

      {/* Sublabel */}
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md italic">
        {configs.sublabel}
      </p>

      {/* Error Retry Action */}
      {state === "error" && onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="h-7 px-3 text-xs gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Tap to Retry</span>
        </Button>
      )}
    </div>
  );
}
