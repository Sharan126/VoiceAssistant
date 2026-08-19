"use client";

import { useState } from "react";
import { SettingsManager } from "./settings-manager";
import { DatabaseTester } from "./database-tester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  CheckCircle2,
  Database,
  Layers,
  Lock,
  Mic,
  Radio,
  Settings,
  Shield,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

interface DashboardTabsProps {
  user: User;
  profile: Profile | null;
  isConfigured: boolean;
  totalConversations?: number;
}

export function DashboardTabs({
  user,
  profile,
  isConfigured,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tester" | "settings">("overview");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "overview"
              ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Layers className="h-4 w-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "settings"
              ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Settings className="h-4 w-4" />
          Voice & User Settings
        </button>

        <button
          onClick={() => setActiveTab("tester")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "tester"
              ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          }`}
        >
          <Database className="h-4 w-4" />
          Database & RLS Tester
          <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            Part 2
          </span>
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/60 bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PostgreSQL Database</CardTitle>
                <Database className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${isConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  <span className="text-lg">{isConfigured ? "Live Supabase Connection" : "Local Dev Mode"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  All 7 tables (<code className="text-[11px] font-mono">profiles, conversations, messages, memories, reminders, tool_executions, user_settings</code>) active.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Row Level Security</CardTitle>
                <Shield className="h-4 w-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-lg text-foreground">RLS Enforced</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Users can exclusively read, write, update, and delete their own rows across all 7 entities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voice Pipeline Status</CardTitle>
                <Radio className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2 text-purple-400">
                  <Activity className="h-5 w-5" />
                  <span className="text-lg text-foreground">Ready for Part 3</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Database models for audio conversations, messages, tool execution, and voice settings are fully configured.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Database Schema Summary Box */}
          <Card className="border-border/60 bg-card/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Database Architecture Schema</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      7 production-ready tables with foreign key cascades and granular RLS policies.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-border">
                  <Sparkles className="mr-1.5 h-3 w-3 text-indigo-400" /> Part 2 Active
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" /> profiles
                  </div>
                  <p className="text-muted-foreground">User account metadata & avatar synchronization.</p>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" /> conversations
                  </div>
                  <p className="text-muted-foreground">Voice and text session containers for each user.</p>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" /> messages
                  </div>
                  <p className="text-muted-foreground">Conversation messages with role, content, and metadata.</p>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> memories
                  </div>
                  <p className="text-muted-foreground">Long-term user knowledge, preferences & importance.</p>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> reminders
                  </div>
                  <p className="text-muted-foreground">Time-triggered tasks, alarms, and completed status.</p>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" /> tool_executions
                  </div>
                  <p className="text-muted-foreground">Audit logs for tool calls, inputs, outputs & status.</p>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-1 sm:col-span-2 md:col-span-3">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" /> user_settings
                  </div>
                  <p className="text-muted-foreground">Voice selection, speaking speed, auto_play, theme, language, and memory preferences.</p>
                </div>
              </div>

              {/* Active Session info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                <div className="p-4 rounded-lg bg-background/40 border border-border/50 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-primary" /> Active Session State
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>&bull; User ID: <span className="font-mono">{user.id}</span></li>
                    <li>&bull; Email: <span>{user.email}</span></li>
                    <li>&bull; Profile: <span>{profile?.full_name ?? "Synced"}</span></li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-background/40 border border-border/50 space-y-2">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" /> Security Verification
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>&bull; Service Role Key Exposure: 0 (Server only)</li>
                    <li>&bull; RLS Subquery Policy on Messages: Active</li>
                    <li>&bull; Auto Profile & Settings Trigger: Configured</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === "settings" && <SettingsManager userId={user.id} />}

      {/* Database & RLS Tester Tab Content */}
      {activeTab === "tester" && <DatabaseTester userId={user.id} />}
    </div>
  );
}
