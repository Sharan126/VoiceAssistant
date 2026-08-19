"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { conversationService } from "@/services/conversation-service";
import { ConversationItem } from "./conversation-item";
import { groupConversationsByDate } from "@/utils/date-grouping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, MessageSquare, Loader2, Sparkles, Search } from "lucide-react";
import type { Conversation } from "@/types/database.types";

interface ConversationSidebarProps {
  userId: string;
  activeId: string | null;
  onSelectConversation: (id: string | null) => void;
  className?: string;
}

export function ConversationSidebar({
  userId,
  activeId,
  onSelectConversation,
  className = "",
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await conversationService.getConversations(userId);
    if (!error && data) {
      setConversations(data);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewChat = async () => {
    setIsCreating(true);
    const title = "New Conversation";
    const { data, error } = await conversationService.createConversation(userId, title);
    if (error || !data) {
      toast.error(`Could not create conversation: ${error}`);
    } else {
      setConversations((prev) => [data, ...prev]);
      onSelectConversation(data.id);
      toast.success("New conversation started");
    }
    setIsCreating(false);
  };

  const handleRename = async (id: string, newTitle: string) => {
    const { data, error } = await conversationService.updateConversationTitle(id, newTitle);
    if (error || !data) {
      toast.error(`Rename failed: ${error}`);
    } else {
      setConversations((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success("Conversation renamed");
    }
  };

  const handleDelete = async (id: string) => {
    const { success, error } = await conversationService.deleteConversation(id);
    if (!success) {
      toast.error(`Delete failed: ${error}`);
    } else {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        onSelectConversation(null);
      }
      toast.success("Conversation deleted");
    }
  };

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  // Group chronologically
  const groups = useMemo(() => {
    return groupConversationsByDate(filteredConversations);
  }, [filteredConversations]);

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="space-y-1 pt-2">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {title}
        </div>
        {items.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={activeId === conv.id}
            onSelect={onSelectConversation}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <aside
      className={`flex flex-col h-full border-r border-border/60 bg-card/40 backdrop-blur-xl ${className}`}
    >
      {/* Top Header & Search & New Chat Button */}
      <div className="p-4 space-y-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-primary" /> Conversations
          </span>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
            {conversations.length}
          </span>
        </div>

        <Button
          type="button"
          onClick={handleNewChat}
          disabled={isCreating}
          variant="outline"
          className="w-full justify-start gap-2 border-border/80 hover:border-primary/50 hover:bg-primary/5 text-foreground"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Plus className="h-4 w-4 text-primary" />
          )}
          <span>New Chat</span>
        </Button>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-8 h-8 text-xs bg-background/50 border-border/60"
          />
        </div>
      </div>

      {/* Chronological Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground space-y-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-2">
            <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <p className="text-xs font-medium text-foreground">
              {searchQuery ? "No matching chats" : "No conversations yet"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {searchQuery
                ? "Try searching for a different keyword."
                : "Click \"New Chat\" or tap the voice orb to begin."}
            </p>
          </div>
        ) : (
          <>
            {renderSection("Today", groups.today)}
            {renderSection("Yesterday", groups.yesterday)}
            {renderSection("Previous 7 days", groups.previous7Days)}
            {renderSection("Older", groups.older)}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/40 text-center">
        <span className="text-[11px] text-muted-foreground">
          Aura Voice &middot; Supabase RLS Protected
        </span>
      </div>
    </aside>
  );
}
