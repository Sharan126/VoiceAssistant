"use client";

import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { Mic, Menu, Sliders, HardDrive } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database.types";
import type { VoiceState } from "@/types/voice.types";

interface AssistantHeaderProps {
  user: User;
  profile: Profile | null;
  voiceState: VoiceState;
  language?: string;
  onSelectLanguage?: (lang: string) => void;
  onOpenMobileMenu: () => void;
  onOpenSettingsModal?: () => void;
}

export function AssistantHeader({
  user,
  profile,
  voiceState,
  language = "en",
  onSelectLanguage,
  onOpenMobileMenu,
  onOpenSettingsModal,
}: AssistantHeaderProps) {
  const stateColor: Record<VoiceState, string> = {
    idle: "bg-indigo-400",
    requesting_permission: "bg-amber-400 animate-ping",
    listening: "bg-cyan-400 animate-ping",
    processing: "bg-purple-400 animate-pulse",
    thinking: "bg-purple-400 animate-pulse",
    tool_execution: "bg-amber-400 animate-ping",
    speaking: "bg-emerald-400 animate-pulse",
    success: "bg-emerald-400",
    error: "bg-red-400",
  };

  const displayState = voiceState.replace("_", " ");

  return (
    <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Mobile Drawer Trigger + Brand */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Mic className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground tracking-tight text-base sm:text-lg">
              {APP_CONFIG.name}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/80 bg-muted/40 text-[11px] text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${stateColor[voiceState]}`} />
              <span className="capitalize">{displayState}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Right: Quick Language Selector + Quick Settings + User Nav */}
      <div className="flex items-center space-x-2">
        {onSelectLanguage && (
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={onSelectLanguage}
          />
        )}

        <Link href="/files">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 h-9"
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask My Files</span>
          </Button>
        </Link>

        {onOpenSettingsModal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettingsModal}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-9"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preferences</span>
          </Button>
        )}

        <UserNav user={user} profile={profile} onOpenSettings={onOpenSettingsModal} />
      </div>
    </header>
  );
}
