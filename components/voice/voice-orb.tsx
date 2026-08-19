"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mic, Loader2, Volume2, AlertCircle, Cpu, Radio } from "lucide-react";
import type { VoiceState } from "@/types/voice.types";

interface VoiceOrbProps {
  state: VoiceState;
  audioLevel?: number; // 0 to 100
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VoiceOrb({
  state,
  audioLevel = 0,
  onClick,
  className = "",
  size = "md",
}: VoiceOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  // Dimensions based on size prop
  const dimensions = useMemo(() => {
    switch (size) {
      case "sm":
        return { container: "w-24 h-24 sm:w-28 sm:h-28", orb: "w-16 h-16 sm:w-20 sm:h-20", icon: "h-6 w-6" };
      case "lg":
        return { container: "w-48 h-48 sm:w-60 sm:h-60", orb: "w-36 h-36 sm:w-44 sm:h-44", icon: "h-12 w-12" };
      case "md":
      default:
        return { container: "w-36 h-36 sm:w-44 sm:h-44", orb: "w-28 h-28 sm:w-32 sm:h-32", icon: "h-8 w-8 sm:h-10 sm:w-10" };
    }
  }, [size]);

  // Dynamic scale for live reactive audio (normalized)
  const reactiveScale = useMemo(() => {
    if (state === "listening") {
      return 1 + (audioLevel / 100) * 0.18;
    }
    if (state === "speaking") {
      return 1 + Math.sin(Date.now() / 200) * 0.06;
    }
    return 1;
  }, [state, audioLevel]);

  // Balanced commercial color palettes
  const orbConfig = useMemo(() => {
    switch (state) {
      case "listening":
      case "requesting_permission":
        return {
          gradient: "from-cyan-500 via-blue-600 to-indigo-600",
          glowColor: "rgba(6, 182, 212, 0.35)",
          ringColor: "border-cyan-500/40",
          icon: Radio,
          label: "Listening to voice",
        };
      case "processing":
      case "thinking":
        return {
          gradient: "from-indigo-500 via-purple-600 to-violet-700",
          glowColor: "rgba(147, 51, 234, 0.35)",
          ringColor: "border-purple-500/40",
          icon: Loader2,
          label: "Processing input",
        };
      case "tool_execution":
        return {
          gradient: "from-amber-500 via-orange-600 to-cyan-600",
          glowColor: "rgba(245, 158, 11, 0.35)",
          ringColor: "border-amber-500/40",
          icon: Cpu,
          label: "Executing agent tool",
        };
      case "speaking":
        return {
          gradient: "from-emerald-500 via-teal-600 to-cyan-600",
          glowColor: "rgba(16, 185, 129, 0.35)",
          ringColor: "border-emerald-500/40",
          icon: Volume2,
          label: "Assistant speaking",
        };
      case "error":
        return {
          gradient: "from-rose-600 via-red-600 to-amber-700",
          glowColor: "rgba(239, 68, 68, 0.35)",
          ringColor: "border-red-500/40",
          icon: AlertCircle,
          label: "Voice error",
        };
      case "idle":
      case "success":
      default:
        return {
          gradient: "from-blue-600 via-indigo-600 to-violet-700",
          glowColor: "rgba(99, 102, 241, 0.25)",
          ringColor: "border-indigo-500/30",
          icon: Mic,
          label: "Voice orb idle",
        };
    }
  }, [state]);

  const IconComponent = orbConfig.icon;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${dimensions.container} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={orbConfig.label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
    >
      {/* 1. Ambient Background Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: orbConfig.glowColor }}
        animate={
          shouldReduceMotion
            ? { opacity: 0.5 }
            : state === "listening"
            ? { scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }
            : state === "thinking"
            ? { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }
            : state === "speaking"
            ? { scale: [1.05, 1.2, 1.05], opacity: [0.4, 0.65, 0.4] }
            : { scale: [1, 1.06, 1], opacity: [0.25, 0.4, 0.25] }
        }
        transition={{
          duration: state === "listening" ? 1.5 : state === "thinking" ? 2 : 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Concentric Ripple Rings (Listening & Tool Execution) */}
      {(state === "listening" || state === "tool_execution") && !shouldReduceMotion && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full border ${orbConfig.ringColor} pointer-events-none`}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full border ${orbConfig.ringColor} pointer-events-none`}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1.55, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
          />
        </>
      )}

      {/* 3. Planetary Orbital Rings (Tool Execution) */}
      {state === "tool_execution" && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-amber-400/50 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* 4. Speaking Waveform Equalizer Ring */}
      {state === "speaking" && !shouldReduceMotion && (
        <motion.div
          className="absolute -inset-2 rounded-full border border-emerald-400/30 pointer-events-none"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* 5. Main Center Orb Spherical Body */}
      <motion.div
        className={`relative ${dimensions.orb} rounded-full bg-gradient-to-tr ${orbConfig.gradient} p-0.5 shadow-xl flex items-center justify-center cursor-pointer transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        style={{
          boxShadow: `0 0 35px ${orbConfig.glowColor}, inset 0 2px 6px rgba(255, 255, 255, 0.4)`,
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: reactiveScale,
              }
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {/* Subtle Specular Highlight */}
        <div className="absolute top-2 left-3 w-8 h-4 bg-white/25 rounded-full blur-[2px] -rotate-45 pointer-events-none" />

        {/* Center Icon & Animations */}
        <div className="relative z-10 text-white flex items-center justify-center">
          {state === "thinking" || state === "processing" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <IconComponent className={dimensions.icon} />
            </motion.div>
          ) : (
            <IconComponent className={dimensions.icon} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
