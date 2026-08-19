"use client";

import { useState, useEffect, useCallback } from "react";
import { memoryService } from "@/services/memory-service";
import { settingsService } from "@/services/settings-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Brain,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Loader2,
  Sparkles,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { Memory } from "@/types/database.types";

interface MemoryManagerProps {
  userId: string;
}

const CATEGORIES = ["preference", "learning_goal", "work", "personal", "general"] as const;

export function MemoryManager({ userId }: MemoryManagerProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Memory Form State
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newCategory, setNewCategory] = useState<string>("preference");
  const [newImportance, setNewImportance] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMemoryText, setEditMemoryText] = useState("");
  const [editCategory, setEditCategory] = useState<string>("general");
  const [editImportance, setEditImportance] = useState(3);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [memRes, settingsRes] = await Promise.all([
      memoryService.getMemories(userId),
      settingsService.getUserSettings(userId),
    ]);

    if (memRes.data) {
      setMemories(memRes.data);
    }
    if (settingsRes.data) {
      setMemoryEnabled(settingsRes.data.memory_enabled);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle Long-term Memory in user_settings
  const handleToggleMemoryEnabled = async () => {
    const nextState = !memoryEnabled;
    setMemoryEnabled(nextState);
    const { error } = await settingsService.updateUserSettings(userId, {
      memory_enabled: nextState,
    });

    if (error) {
      toast.error(`Failed to update setting: ${error}`);
      setMemoryEnabled(!nextState);
    } else {
      toast.success(nextState ? "Long-term memory enabled" : "Long-term memory disabled");
    }
  };

  // Add Memory Manually
  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    setIsSubmitting(true);
    const { data, error } = await memoryService.createMemory(
      userId,
      newMemoryText.trim(),
      newCategory,
      newImportance
    );

    if (error || !data) {
      toast.error(`Failed to save memory: ${error}`);
    } else {
      setMemories((prev) => [data, ...prev]);
      setNewMemoryText("");
      setIsAdding(false);
      toast.success("Memory saved successfully!");
    }
    setIsSubmitting(false);
  };

  // Edit Memory
  const startEditing = (mem: Memory) => {
    setEditingId(mem.id);
    setEditMemoryText(mem.memory);
    setEditCategory(mem.category);
    setEditImportance(mem.importance);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editMemoryText.trim()) return;

    const { data, error } = await memoryService.updateMemory(id, {
      memory: editMemoryText.trim(),
      category: editCategory,
      importance: editImportance,
    });

    if (error || !data) {
      toast.error(`Update failed: ${error}`);
    } else {
      setMemories((prev) => prev.map((m) => (m.id === id ? data : m)));
      setEditingId(null);
      toast.success("Memory updated");
    }
  };

  // Delete Single Memory
  const handleDeleteMemory = async (id: string) => {
    const { success, error } = await memoryService.deleteMemory(id);
    if (!success) {
      toast.error(`Failed to delete memory: ${error}`);
    } else {
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast.success("Memory deleted");
    }
  };

  // Clear All Memories
  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all stored memories? This action cannot be undone.")) {
      return;
    }

    try {
      await Promise.all(memories.map((m) => memoryService.deleteMemory(m.id)));
      setMemories([]);
      toast.success("All memories cleared");
    } catch {
      toast.error("Failed to clear some memories");
    }
  };

  const filteredMemories = memories.filter((m) =>
    m.memory.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "learning_goal":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
      case "work":
        return "border-indigo-500/30 bg-indigo-500/10 text-indigo-300";
      case "preference":
        return "border-purple-500/30 bg-purple-500/10 text-purple-300";
      case "personal":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      default:
        return "border-border/60 bg-muted/40 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-8 flex items-center justify-center space-x-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading persistent memory index...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Long-Term AI Memory</CardTitle>
              <CardDescription className="text-xs">
                Context and preferences stored across conversations in Supabase <code className="font-mono text-purple-300">memories</code>.
              </CardDescription>
            </div>
          </div>

          {/* Master Memory Toggle */}
          <div className="flex items-center space-x-2 p-2 rounded-xl border border-border/60 bg-background/40">
            <Label className="text-xs font-medium cursor-pointer" htmlFor="toggle-memory">
              {memoryEnabled ? "Memory Active" : "Memory Paused"}
            </Label>
            <input
              id="toggle-memory"
              type="checkbox"
              checked={memoryEnabled}
              onChange={handleToggleMemoryEnabled}
              className="h-4 w-4 rounded border-border text-primary cursor-pointer accent-primary"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Memory Toolbar: Search, Add, Clear */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(!isAdding)}
              className="h-9 text-xs gap-1.5 border-border hover:border-primary/50"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>{isAdding ? "Cancel" : "Add Memory"}</span>
            </Button>

            {memories.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </Button>
            )}
          </div>
        </div>

        {/* Add Memory Form */}
        {isAdding && (
          <form onSubmit={handleCreateMemory} className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">New Persistent Memory</h3>
            <div>
              <Input
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="e.g. User is learning C++ and prefers concise code examples"
                className="text-xs h-9"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-muted-foreground">Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1 text-xs p-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground">Importance (1 to 5)</Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newImportance}
                  onChange={(e) => setNewImportance(parseInt(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="gradient" disabled={isSubmitting} className="h-8 text-xs">
                {isSubmitting ? "Saving..." : "Save Memory"}
              </Button>
            </div>
          </form>
        )}

        {/* Memories List */}
        <div className="space-y-2.5">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <Sparkles className="h-6 w-6 text-purple-400 mx-auto opacity-60" />
              <p className="text-xs font-medium text-foreground">No memories found</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                The assistant automatically saves facts from conversations (or click &quot;Add Memory&quot; to define context manually).
              </p>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const isEditing = editingId === mem.id;

              return (
                <div
                  key={mem.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-background/50 backdrop-blur-sm transition-all hover:border-border flex flex-col space-y-2"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editMemoryText}
                        onChange={(e) => setEditMemoryText(e.target.value)}
                        className="text-xs"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="text-xs p-1.5 rounded border border-border bg-background text-foreground"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">
                            <X className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" variant="gradient" onClick={() => handleSaveEdit(mem.id)} className="h-7 text-xs">
                            <Check className="h-3 w-3 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${getCategoryColor(
                              mem.category
                            )}`}
                          >
                            {mem.category.replace("_", " ")}
                          </span>
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: mem.importance || 3 }).map((_, idx) => (
                              <Star key={idx} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-foreground break-words">{mem.memory}</p>
                        <span className="text-[10px] text-muted-foreground block">
                          Recorded {new Date(mem.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(mem)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label="Edit memory"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete memory"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Security & Privacy Notice */}
        <div className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Memories are private to your authenticated account and secured with Supabase Row Level Security (RLS).</span>
        </div>
      </CardContent>
    </Card>
  );
}
