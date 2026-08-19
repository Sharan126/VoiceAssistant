"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send, Loader2, Sparkles } from "lucide-react";
import type { VoiceState } from "@/types/voice.types";

interface VoiceInputBarProps {
  value: string;
  interimTranscript?: string;
  onChange: (value: string) => void;
  onSend: (text?: string) => void;
  onToggleMic: () => void;
  voiceState: VoiceState;
  disabled?: boolean;
}

export function VoiceInputBar({
  value,
  interimTranscript = "",
  onChange,
  onSend,
  onToggleMic,
  voiceState,
  disabled = false,
}: VoiceInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [value, interimTranscript]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends message, Shift+Enter creates a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && voiceState !== "thinking" && voiceState !== "processing") {
        onSend();
      }
    }
  };

  const isListening = voiceState === "listening" || voiceState === "requesting_permission";
  const isBusy = voiceState === "thinking" || voiceState === "processing" || voiceState === "speaking";

  const displayValue = interimTranscript ? `${value ? value + " " : ""}${interimTranscript}` : value;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="relative flex flex-col rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
        {/* Top Active State Bar (when listening or processing) */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-300 text-xs rounded-t-2xl">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              {voiceState === "requesting_permission"
                ? "Requesting mic permission..."
                : "Microphone recording — speak now..."}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleMic}
              className="h-6 px-2 text-[11px] text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/20"
            >
              <Square className="h-3 w-3 mr-1 fill-current" /> Stop
            </Button>
          </div>
        )}

        {isBusy && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-purple-500/10 border-b border-purple-500/20 text-purple-300 text-xs rounded-t-2xl">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
              {voiceState === "processing"
                ? "Transcribing audio..."
                : voiceState === "thinking"
                ? "Processing query..."
                : "Playing voice..."}
            </span>
            <span className="text-[11px] text-purple-400/80">Active</span>
          </div>
        )}

        {/* Text Input Area */}
        <div className="flex items-end p-2 sm:p-3 gap-2">
          {/* Microphone Quick Toggle */}
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "secondary"}
            onClick={onToggleMic}
            disabled={disabled || voiceState === "thinking"}
            aria-label={isListening ? "Stop listening" : "Start speaking"}
            className={`h-10 w-10 shrink-0 rounded-xl transition-all ${
              isListening
                ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-105"
                : "bg-muted/70 hover:bg-accent text-foreground hover:text-primary"
            }`}
          >
            {isListening ? (
              <Square className="h-4 w-4 fill-current text-white animate-pulse" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          {/* Autosizing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isBusy}
            placeholder={
              isListening
                ? "Listening to speech... (words appear live)"
                : "Type message or tap mic to speak..."
            }
            className="flex-1 max-h-36 min-h-[40px] resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Send Button */}
          <Button
            type="button"
            size="icon"
            variant="gradient"
            onClick={() => onSend()}
            disabled={disabled || !value.trim() || isBusy}
            aria-label="Send message"
            className="h-10 w-10 shrink-0 rounded-xl transition-all disabled:opacity-40 disabled:scale-100 active:scale-95"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-4 pb-2 text-[11px] text-muted-foreground select-none">
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono border border-border">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono border border-border">Shift+Enter</kbd> for newline
          </span>
          <span className="sm:hidden">Tap mic to speak</span>
          <span className="flex items-center gap-1 text-[10px] text-indigo-400">
            <Sparkles className="h-3 w-3" /> Web Speech STT Active
          </span>
        </div>
      </div>
    </div>
  );
}
