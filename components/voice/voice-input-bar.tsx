"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send, Loader2, Volume2, Sparkles } from "lucide-react";
import type { VoiceState } from "@/types/voice.types";

interface VoiceInputBarProps {
  value: string;
  interimTranscript?: string;
  onChange: (value: string) => void;
  onSend: (text?: string) => void;
  onToggleMic: () => void;
  onStopSpeaking?: () => void;
  voiceState: VoiceState;
  disabled?: boolean;
}

export function VoiceInputBar({
  value,
  interimTranscript = "",
  onChange,
  onSend,
  onToggleMic,
  onStopSpeaking,
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
  const isSpeaking = voiceState === "speaking";
  const isThinking = voiceState === "thinking" || voiceState === "processing";

  const displayValue = interimTranscript ? `${value ? value + " " : ""}${interimTranscript}` : value;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="relative flex flex-col rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
        
        {/* 1. SPEAKING STATE BANNER WITH PROMINENT STOP SPEAKING BUTTON */}
        {isSpeaking && (
          <div className="flex items-center justify-between px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs rounded-t-2xl">
            <span className="flex items-center gap-2 font-medium">
              <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Aura is speaking...</span>
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={onStopSpeaking}
              className="h-7 px-3 text-xs gap-1.5 font-bold shadow-md bg-red-600 hover:bg-red-700 text-white rounded-lg transition-transform active:scale-95"
              aria-label="Stop speaking"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Stop speaking</span>
            </Button>
          </div>
        )}

        {/* 2. LISTENING STATE BANNER */}
        {isListening && (
          <div className="flex items-center justify-between px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-300 text-xs rounded-t-2xl">
            <span className="flex items-center gap-2 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              {voiceState === "requesting_permission"
                ? "Requesting mic permission..."
                : "Listening to voice..."}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleMic}
              className="h-7 px-3 text-xs text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 hover:text-white"
            >
              <Square className="h-3 w-3 mr-1 fill-current" /> Stop listening
            </Button>
          </div>
        )}

        {/* 3. THINKING / PROCESSING BANNER */}
        {isThinking && (
          <div className="flex items-center justify-between px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 text-purple-300 text-xs rounded-t-2xl">
            <span className="flex items-center gap-2 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
              {voiceState === "processing" ? "Transcribing speech..." : "Thinking..."}
            </span>
            <span className="text-[11px] text-purple-400/80">AI Active</span>
          </div>
        )}

        {/* Text Input Area */}
        <div className="flex items-end p-2 sm:p-3 gap-2">
          {/* Microphone Toggle Button */}
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "secondary"}
            onClick={onToggleMic}
            disabled={disabled || isThinking}
            aria-label={
              isListening
                ? "Stop listening"
                : isSpeaking
                ? "Interrupt & speak"
                : "Start speaking"
            }
            title={
              isListening
                ? "Stop listening"
                : isSpeaking
                ? "Interrupt assistant and start speaking"
                : "Tap mic to speak"
            }
            className={`h-10 w-10 shrink-0 rounded-xl transition-all ${
              isListening
                ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-105"
                : isSpeaking
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
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
            disabled={disabled || isThinking}
            placeholder={
              isListening
                ? "Listening... (speech appears live)"
                : isSpeaking
                ? "Aura is speaking... (type or tap stop)"
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
            disabled={disabled || !value.trim() || isThinking}
            aria-label="Send message"
            className="h-10 w-10 shrink-0 rounded-xl transition-all disabled:opacity-40 disabled:scale-100 active:scale-95"
          >
            {isThinking ? (
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
          <span className="sm:hidden">
            {isSpeaking ? "Tap Stop speaking to quiet Aura" : "Tap mic to speak"}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-indigo-400">
            <Sparkles className="h-3 w-3" /> Voice & Text Input Active
          </span>
        </div>
      </div>
    </div>
  );
}
