/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Mic,
  Square,
  Send,
  Loader2,
  Volume2,
  Sparkles,
  MessageSquare,
  Plus,
  Image as ImageIcon,
  FileText,
  FileCode,
  Paperclip,
  X,
} from "lucide-react";
import type { VoiceState } from "@/types/voice.types";
import { toast } from "sonner";

export interface AttachedFile {
  id: string;
  file: File;
  kind: "image" | "document";
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  dataUrl?: string;
  iconType: "image" | "pdf" | "doc" | "file";
}

interface VoiceInputBarProps {
  value: string;
  interimTranscript?: string;
  onChange: (value: string) => void;
  onSend: (text?: string, metadata?: Record<string, any>) => void;
  onToggleMic: () => void;
  onStopSpeaking?: () => void;
  voiceState: VoiceState;
  conversationMode?: boolean;
  onToggleConversationMode?: () => void;
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
  conversationMode = false,
  onToggleConversationMode,
  disabled = false,
}: VoiceInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);

  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Unsupported image format. Please attach JPG, JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const previewUrl = URL.createObjectURL(file);
      setAttachedFile({
        id: `img-${Date.now()}`,
        file,
        kind: "image",
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        dataUrl,
        iconType: "image",
      });
      toast.success(`Attached image ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    iconType: "pdf" | "doc" | "file"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowedExts = [".pdf", ".txt", ".docx", ".doc"];
    const fileName = file.name.toLowerCase();
    const isValidExt = allowedExts.some((ext) => fileName.endsWith(ext));
    const isValidMime =
      file.type.includes("pdf") ||
      file.type.includes("text") ||
      file.type.includes("word") ||
      file.type.includes("document");

    if (!isValidExt && !isValidMime) {
      toast.error("Unsupported document format. Please attach PDF, TXT, or DOCX.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Document file size exceeds 15MB limit.");
      return;
    }

    setAttachedFile({
      id: `doc-${Date.now()}`,
      file,
      kind: "document",
      name: file.name,
      size: file.size,
      type: file.type || "application/pdf",
      iconType,
    });
    toast.success(`Attached ${file.name}`);
  };

  const handleGeneralFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith("image/");
    if (isImg) {
      handleImageSelect(e);
    } else {
      handleDocumentSelect(e, "file");
    }
  };

  const handleRemoveFile = () => {
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
  };

  const handleSendInternal = () => {
    const textToSend =
      value.trim() ||
      (attachedFile
        ? attachedFile.kind === "image"
          ? "What is in this image?"
          : `Please analyze ${attachedFile.name}.`
        : "");

    if (!textToSend && !attachedFile) return;

    let metadata: Record<string, any> | undefined = undefined;
    if (attachedFile) {
      metadata = {
        attachment: {
          id: attachedFile.id,
          kind: attachedFile.kind,
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type,
          previewUrl: attachedFile.previewUrl,
          dataUrl: attachedFile.dataUrl,
        },
      };
    }

    onSend(textToSend, metadata);
    onChange("");
    setAttachedFile(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || !item.type.startsWith("image/")) continue;
      const file = item.getAsFile();
      if (!file) continue;

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error("Pasted image format not supported. Use JPG, PNG, or WEBP.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Pasted image exceeds 10MB size limit.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        const previewUrl = URL.createObjectURL(file);
        setAttachedFile({
          id: `img-${Date.now()}`,
          file,
          kind: "image",
          name: file.name || "pasted-image.png",
          size: file.size,
          type: file.type,
          previewUrl,
          dataUrl,
          iconType: "image",
        });
        toast.success("Pasted image attached from clipboard");
      };
      reader.readAsDataURL(file);
      break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends message, Shift+Enter creates a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachedFile) && !disabled && voiceState !== "thinking" && voiceState !== "processing") {
        handleSendInternal();
      }
    }
  };

  const isListening = voiceState === "listening" || voiceState === "requesting_permission";
  const isSpeaking = voiceState === "speaking";
  const isThinking = voiceState === "thinking" || voiceState === "processing";

  const displayValue = interimTranscript ? `${value ? value + " " : ""}${interimTranscript}` : value;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      {/* Hidden File Pickers */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleDocumentSelect(e, "pdf")}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".docx,.doc,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => handleDocumentSelect(e, "doc")}
      />
      <input
        ref={generalFileInputRef}
        type="file"
        accept=".pdf,.txt,.docx,.doc,image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleGeneralFileSelect}
      />

      <div className="relative flex flex-col rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
        
        {/* 1. ATTACHED IMAGE OR DOCUMENT COMPACT PREVIEW BANNER */}
        {attachedFile && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-indigo-500/15 border-b border-indigo-500/30 text-xs text-indigo-200 rounded-t-2xl animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {attachedFile.kind === "image" && attachedFile.previewUrl ? (
                <img
                  src={attachedFile.previewUrl}
                  alt="Attached image preview"
                  className="h-8 w-8 rounded-lg object-cover border border-indigo-400/40 shrink-0 shadow-sm"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-sm">
                  {attachedFile.iconType === "pdf" ? (
                    <FileText className="h-4 w-4 text-cyan-300" />
                  ) : (
                    <FileCode className="h-4 w-4 text-purple-300" />
                  )}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-slate-100 truncate max-w-[150px] sm:max-w-[260px]">
                  {attachedFile.name}
                </span>
                <span className="text-[10px] text-indigo-300/80">
                  {(attachedFile.size / 1024).toFixed(0)} KB • {attachedFile.kind === "image" ? "IMAGE" : attachedFile.name.split(".").pop()?.toUpperCase() || "DOC"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleRemoveFile}
              className="h-6 w-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
              aria-label="Remove attached file"
              title="Remove attached file"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        
        {/* 2. SPEAKING STATE BANNER WITH PROMINENT STOP SPEAKING BUTTON */}
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

        {/* 3. LISTENING STATE BANNER */}
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

        {/* 4. THINKING / PROCESSING BANNER */}
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
          {/* Attachment (+) Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled || isThinking}
                aria-label="Add attachment"
                title="Add attachment"
                className="h-10 w-10 shrink-0 rounded-xl bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground border border-border/50 transition-all focus:ring-2 focus:ring-primary/20"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={8}
              className="w-52 p-1.5 rounded-xl border border-border/80 bg-slate-900/95 backdrop-blur-xl text-slate-100 shadow-2xl space-y-0.5 z-50"
            >
              <DropdownMenuLabel className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 select-none">
                Add to this message
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800/80 my-1" />
              <DropdownMenuItem 
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:text-white transition-colors"
              >
                <ImageIcon className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="font-medium">🖼 Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => pdfInputRef.current?.click()}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:text-white transition-colors"
              >
                <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="font-medium">📄 PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => docInputRef.current?.click()}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:text-white transition-colors"
              >
                <FileCode className="h-4 w-4 text-purple-400 shrink-0" />
                <span className="font-medium">📑 Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => generalFileInputRef.current?.click()}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:text-white transition-colors"
              >
                <Paperclip className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium">📎 File</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
            onPaste={handlePaste}
            disabled={disabled || isThinking}
            placeholder={
              attachedFile
                ? attachedFile.kind === "image"
                  ? "Ask about this image..."
                  : `Ask a question about ${attachedFile.name}...`
                : isListening
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
            onClick={handleSendInternal}
            disabled={disabled || (!displayValue.trim() && !attachedFile) || isThinking}
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

        {/* Footer shortcuts hint & Conversation Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 pb-2 text-[11px] text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            {onToggleConversationMode && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggleConversationMode}
                className={`h-6 px-2 text-[10px] sm:text-xs gap-1 rounded-lg border transition-all ${
                  conversationMode
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
                title="Continuous Mode: Aura automatically listens for your next turn after responding"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Conversation Mode: {conversationMode ? "ON" : "OFF"}</span>
                {conversationMode && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </Button>
            )}

            <span className="hidden md:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-mono border border-border">Enter</kbd> to send
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-indigo-400">
            <Sparkles className="h-3 w-3" /> Voice & Text Input Active
          </span>
        </div>
      </div>
    </div>
  );
}
