"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/utils/formatters";
import { Bot, Copy, Check, Square, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { RichTextRenderer } from "@/components/ai/rich-text-renderer";
import type { AIMessage } from "@/types/ai.types";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

interface ConversationViewProps {
  messages: AIMessage[];
  currentStreamingText?: string;
  isStreaming?: boolean;
  onStopGeneration?: () => void;
  onSpeakMessage?: (text: string) => void;
  onStopSpeaking?: () => void;
  isSpeaking?: boolean;
  user: User;
  profile: Profile | null;
}

export function ConversationView({
  messages,
  currentStreamingText = "",
  isStreaming = false,
  onStopGeneration,
  onSpeakMessage,
  onStopSpeaking,
  isSpeaking = false,
  user,
  profile,
}: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const userInitials = getInitials(profile?.full_name, user.email);
  const userAvatar = profile?.avatar_url;

  // Auto-scroll to bottom on new messages or streaming chunks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStreamingText]);

  // Reset playing ID when global speaking stops
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentlyPlayingId(null);
    }
  }, [isSpeaking]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const handleToggleAudio = (id: string, text: string) => {
    if (currentlyPlayingId === id && isSpeaking) {
      onStopSpeaking?.();
      setCurrentlyPlayingId(null);
    } else {
      setCurrentlyPlayingId(id);
      onSpeakMessage?.(text);
    }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 space-y-6 overflow-y-auto">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const msgKey = msg.id || `msg-${index}`;
          const isPlayingThis = currentlyPlayingId === msgKey && isSpeaking;

          return (
            <motion.div
              key={msgKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              {isUser ? (
                <Avatar className="h-8 w-8 shrink-0 border border-border/80">
                  <AvatarImage src={userAvatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`flex flex-col space-y-1 max-w-[88%] sm:max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md whitespace-pre-wrap break-words"
                      : "bg-card/90 border border-border/70 text-foreground rounded-tl-sm shadow-sm backdrop-blur-md w-full"
                  }`}
                >
                  {isUser ? msg.content : <RichTextRenderer content={msg.content} />}
                </div>

                {/* Bubble action toolbar (Copy / Play Speech / Info) */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity pl-1 pt-0.5">
                    {/* Read Aloud / Stop Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleAudio(msgKey, msg.content)}
                      className={`h-6 w-6 rounded-md ${
                        isPlayingThis
                          ? "text-emerald-400 bg-emerald-500/10 animate-pulse"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label={isPlayingThis ? "Stop audio" : "Read aloud"}
                    >
                      {isPlayingThis ? (
                        <VolumeX className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    {/* Copy Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(msgKey, msg.content)}
                      className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                      aria-label="Copy response"
                    >
                      {copiedId === msgKey ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>

                    <span className="text-[10px] text-muted-foreground">Aura Assistant</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Active Streaming Message Bubble */}
        {isStreaming && currentStreamingText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>

            <div className="flex flex-col space-y-2 max-w-[88%] sm:max-w-[82%] items-start w-full">
              <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-sm text-sm sm:text-base leading-relaxed bg-card/90 border border-indigo-500/40 text-foreground shadow-sm backdrop-blur-md w-full">
                <RichTextRenderer content={currentStreamingText} isStreaming={true} />
                <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse" />
              </div>

              {/* Stop Generation Button */}
              {onStopGeneration && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onStopGeneration}
                  className="h-7 px-2.5 text-xs gap-1.5 border-border/80 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                >
                  <Square className="h-3 w-3 fill-current text-destructive" />
                  <span>Stop generating</span>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
