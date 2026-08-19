"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatters";
import type { Conversation } from "@/types/database.types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSaveRename = async (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === conversation.title) {
      setIsEditing(false);
      setEditTitle(conversation.title);
      return;
    }

    setIsSaving(true);
    await onRename(conversation.id, trimmed);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditTitle(conversation.title);
  };

  const timeLabel = formatRelativeTime(conversation.updated_at || conversation.created_at);

  return (
    <div
      onClick={() => !isEditing && onSelect(conversation.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === "Enter" || e.key === " ")) {
          onSelect(conversation.id);
        }
      }}
      className={`group relative flex items-center justify-between w-full p-2.5 rounded-xl text-left text-sm transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
        isActive
          ? "bg-primary/15 text-primary border border-primary/30 font-medium shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleSaveRename} className="flex items-center gap-1.5 w-full pr-1">
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditTitle(conversation.title);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={isSaving}
            className="flex-1 text-xs bg-background/90 text-foreground border border-primary rounded px-2 py-1 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSaving}
            onClick={handleSaveRename}
            aria-label="Save title"
            className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            aria-label="Cancel rename"
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </form>
      ) : (
        <>
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
            <MessageSquare
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs sm:text-sm">{conversation.title}</span>
              <span className="text-[10px] text-muted-foreground/70">{timeLabel}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              aria-label="Rename conversation"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id, e);
              }}
              aria-label="Delete conversation"
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
