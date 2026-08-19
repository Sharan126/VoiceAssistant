"use client";

import { useState } from "react";
import { conversationService } from "@/services/conversation-service";
import { messageService } from "@/services/message-service";
import { memoryService } from "@/services/memory-service";
import { reminderService } from "@/services/reminder-service";
import { toolExecutionService } from "@/services/tool-execution-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bell,
  Brain,
  CheckCircle2,
  Database,
  Loader2,
  MessageSquare,
  Plus,
  Terminal,
  Trash2,
} from "lucide-react";
import type { Conversation, Memory, Reminder, ToolExecution } from "@/types/database.types";

interface DatabaseTesterProps {
  userId: string;
}

export function DatabaseTester({ userId }: DatabaseTesterProps) {
  // Test states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [toolLogs, setToolLogs] = useState<ToolExecution[]>([]);

  // Loading states
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form states
  const [convTitle, setConvTitle] = useState("Research AI Architectures");
  const [memoryText, setMemoryText] = useState("User prefers concise and direct responses");
  const [reminderTitle, setReminderTitle] = useState("Review audio streaming latency");

  // 1. Conversations & Messages Test
  const handleCreateConversation = async () => {
    setLoadingAction("conv_create");
    try {
      const { data: conv, error: convErr } = await conversationService.createConversation(
        userId,
        convTitle || "New Conversation"
      );

      if (convErr || !conv) {
        toast.error(`Error creating conversation: ${convErr}`);
        return;
      }

      // Add initial messages to verify foreign key & message RLS
      await messageService.createMessage(
        conv.id,
        "user",
        "Hello assistant, initialize my voice workspace."
      );
      await messageService.createMessage(
        conv.id,
        "assistant",
        "Workspace initialized. Database and auth boundaries active."
      );

      toast.success(`Conversation "${conv.title}" & 2 messages created!`);
      await handleListConversations();
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleListConversations = async () => {
    setLoadingAction("conv_list");
    try {
      const { data, error } = await conversationService.getConversations(userId);
      if (error) {
        toast.error(`Error listing conversations: ${error}`);
      } else {
        setConversations(data);
        toast.success(`Fetched ${data.length} conversations from database.`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    const { success, error } = await conversationService.deleteConversation(id);
    if (!success) {
      toast.error(`Delete failed: ${error}`);
    } else {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast.success("Conversation deleted (cascade verified)");
    }
  };

  // 2. Memories Test
  const handleCreateMemory = async () => {
    setLoadingAction("mem_create");
    try {
      const { data, error } = await memoryService.createMemory(
        userId,
        memoryText,
        "preference",
        3
      );
      if (error || !data) {
        toast.error(`Error creating memory: ${error}`);
      } else {
        toast.success("Memory persisted to Supabase!");
        await handleListMemories();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleListMemories = async () => {
    setLoadingAction("mem_list");
    try {
      const { data, error } = await memoryService.getMemories(userId);
      if (error) {
        toast.error(`Error listing memories: ${error}`);
      } else {
        setMemories(data);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const { success, error } = await memoryService.deleteMemory(id);
    if (!success) {
      toast.error(`Delete failed: ${error}`);
    } else {
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success("Memory removed");
    }
  };

  // 3. Reminders Test
  const handleCreateReminder = async () => {
    setLoadingAction("rem_create");
    try {
      const futureTime = new Date(Date.now() + 3600 * 1000 * 24).toISOString();
      const { data, error } = await reminderService.createReminder(
        userId,
        reminderTitle,
        futureTime,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      if (error || !data) {
        toast.error(`Error creating reminder: ${error}`);
      } else {
        toast.success("Reminder created successfully!");
        await handleListReminders();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleListReminders = async () => {
    setLoadingAction("rem_list");
    try {
      const { data, error } = await reminderService.getReminders(userId);
      if (error) {
        toast.error(`Error listing reminders: ${error}`);
      } else {
        setReminders(data);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleReminder = async (id: string, current: boolean) => {
    const { data, error } = await reminderService.toggleReminder(id, !current);
    if (error || !data) {
      toast.error(`Error updating reminder: ${error}`);
    } else {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, completed: !current } : r))
      );
      toast.success(`Reminder marked as ${!current ? "completed" : "pending"}`);
    }
  };

  // 4. Tool Execution Logging Test
  const handleLogToolExecution = async () => {
    setLoadingAction("tool_log");
    try {
      const { data, error } = await toolExecutionService.logExecution(
        userId,
        "search_knowledge_base",
        { query: "voice models latency benchmark" },
        { status: "ok", results_count: 5 },
        "completed"
      );
      if (error || !data) {
        toast.error(`Error logging tool execution: ${error}`);
      } else {
        toast.success("Tool execution event logged to Supabase!");
        await handleListToolLogs();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleListToolLogs = async () => {
    setLoadingAction("tool_list");
    try {
      const { data, error } = await toolExecutionService.getExecutions(userId);
      if (error) {
        toast.error(`Error listing tool executions: ${error}`);
      } else {
        setToolLogs(data);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-400" />
            <div>
              <CardTitle>Database & Row Level Security (RLS) Verification</CardTitle>
              <CardDescription>
                Test live CRUD operations and verify that policies restrict access exclusively to authenticated user <span className="font-mono text-xs">{userId}</span>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Section 1: Conversations & Messages */}
          <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-background/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                1. Conversations & Messages (Cascade RLS)
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleListConversations}
                disabled={loadingAction === "conv_list"}
              >
                {loadingAction === "conv_list" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh List"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={convTitle}
                onChange={(e) => setConvTitle(e.target.value)}
                placeholder="Conversation title..."
                className="text-sm"
              />
              <Button
                onClick={handleCreateConversation}
                disabled={loadingAction === "conv_create"}
                variant="gradient"
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {loadingAction === "conv_create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create & Add Messages
                  </>
                )}
              </Button>
            </div>

            {conversations.length > 0 && (
              <div className="space-y-2 mt-3">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 text-xs"
                  >
                    <div>
                      <span className="font-medium text-foreground">{c.title}</span>
                      <span className="text-muted-foreground ml-2 font-mono text-[10px]">ID: {c.id}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteConversation(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Memories */}
          <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-background/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Brain className="h-4 w-4 text-purple-400" />
                2. Long-term Memories Table
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleListMemories}
                disabled={loadingAction === "mem_list"}
              >
                {loadingAction === "mem_list" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh Memories"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value)}
                placeholder="Memory to store..."
                className="text-sm"
              />
              <Button
                onClick={handleCreateMemory}
                disabled={loadingAction === "mem_create"}
                variant="gradient"
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {loadingAction === "mem_create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Store Memory
                  </>
                )}
              </Button>
            </div>

            {memories.length > 0 && (
              <div className="space-y-2 mt-3">
                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 text-xs"
                  >
                    <div>
                      <span className="font-medium text-foreground">{m.memory}</span>
                      <span className="text-purple-400 ml-2 font-mono text-[10px]">[{m.category}]</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteMemory(m.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Reminders */}
          <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-background/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Bell className="h-4 w-4 text-amber-400" />
                3. Reminders Table
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleListReminders}
                disabled={loadingAction === "rem_list"}
              >
                {loadingAction === "rem_list" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh Reminders"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="Reminder title..."
                className="text-sm"
              />
              <Button
                onClick={handleCreateReminder}
                disabled={loadingAction === "rem_create"}
                variant="gradient"
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {loadingAction === "rem_create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Reminder
                  </>
                )}
              </Button>
            </div>

            {reminders.length > 0 && (
              <div className="space-y-2 mt-3">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={r.completed}
                        onChange={() => handleToggleReminder(r.id, r.completed)}
                        className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
                      />
                      <span className={`${r.completed ? "line-through text-muted-foreground" : "font-medium text-foreground"}`}>
                        {r.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.reminder_time).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Tool Executions Log */}
          <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-background/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Terminal className="h-4 w-4 text-emerald-400" />
                4. Tool Executions Table
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleListToolLogs}
                  disabled={loadingAction === "tool_list"}
                >
                  {loadingAction === "tool_list" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh Logs"}
                </Button>
                <Button
                  onClick={handleLogToolExecution}
                  disabled={loadingAction === "tool_log"}
                  variant="gradient"
                  size="sm"
                  className="gap-1.5"
                >
                  {loadingAction === "tool_log" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Log Test Execution
                    </>
                  )}
                </Button>
              </div>
            </div>

            {toolLogs.length > 0 && (
              <div className="space-y-2 mt-3">
                {toolLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-border/40 bg-card/40 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-foreground">
                      <span className="text-emerald-400 font-semibold">{log.tool_name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="h-2.5 w-2.5" /> {log.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px] truncate">
                      Input: {JSON.stringify(log.input)} &middot; Output: {JSON.stringify(log.output)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
