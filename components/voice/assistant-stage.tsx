"use client";

import { useState, useMemo } from "react";
import { VoiceOrb } from "@/components/voice/voice-orb";
import { VoiceStatusBadge } from "@/components/voice/voice-status-badge";
import { SuggestedPrompts } from "@/components/voice/suggested-prompts";
import { VoiceInputBar } from "@/components/voice/voice-input-bar";
import { VoiceStateControls } from "@/components/voice/voice-state-controls";
import { ConversationSidebar } from "@/components/sidebar/conversation-sidebar";
import { MobileSidebarDrawer } from "@/components/sidebar/mobile-sidebar-drawer";
import { AssistantHeader } from "@/components/layout/assistant-header";
import { ConversationView } from "@/components/voice/conversation-view";
import { SettingsManager } from "@/components/dashboard/settings-manager";
import { MemoryManager } from "@/components/dashboard/memory-manager";
import { DatabaseTester } from "@/components/dashboard/database-tester";
import { useVoicePipeline } from "@/hooks/use-voice-pipeline";
import { getTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Database, Settings, X, Plus, Volume2, VolumeX, Brain, Square } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database.types";
import type { VoiceState } from "@/types/voice.types";

interface AssistantStageProps {
  user: User;
  profile: Profile | null;
}

export function AssistantStage({ user, profile }: AssistantStageProps) {
  const [inputText, setInputText] = useState<string>("");
  const [previewOverride, setPreviewOverride] = useState<VoiceState | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"settings" | "memories" | "database" | null>(null);

  // Unified Deterministic Voice Pipeline Hook
  const {
    voiceState: realVoiceState,
    activeTool,
    errorMessage,
    messages,
    currentStreamingText,
    isStreaming,
    activeConversationId,
    interimTranscript,
    audioLevel,
    autoPlay,
    setAutoPlay,
    language,
    setLanguage,
    setUserSettings,
    toggleMicrophone,
    sendMessage,
    stopTTS,
    interruptTTS,
    stopGeneration,
    loadConversation,
    clearMessages,
    retry,
  } = useVoicePipeline({ userId: user.id });

  const currentVoiceState: VoiceState = previewOverride ?? realVoiceState;
  const t = getTranslations(language);

  // Dynamic time-based localized greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetings.morning;
    if (hour < 17) return t.greetings.afternoon;
    return t.greetings.evening;
  }, [t.greetings]);

  const displayName =
    profile?.full_name?.split(" ")[0] ??
    (user.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "";

  const handleSendMessage = (text?: string) => {
    const messageContent = text ?? inputText;
    if (!messageContent.trim()) return;

    if (previewOverride) setPreviewOverride(null);
    setInputText("");
    sendMessage(messageContent);
  };

  const handleOrbClick = () => {
    if (previewOverride) setPreviewOverride(null);
    toggleMicrophone();
  };

  const handleSelectPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleSelectConversation = (id: string | null) => {
    interruptTTS();
    loadConversation(id);
  };

  const handleNewChat = () => {
    interruptTTS();
    clearMessages();
  };

  const hasMessages = messages.length > 0 || Boolean(isStreaming && currentStreamingText);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. Desktop Sticky Conversation Sidebar */}
      <ConversationSidebar
        userId={user.id}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        className="hidden lg:flex w-72 shrink-0"
      />

      {/* 2. Mobile Sidebar Slide-in Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userId={user.id}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
      />

      {/* 3. Main Stage Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-grid-pattern relative">
        {/* Top App Header with Quick Language Switcher */}
        <AssistantHeader
          user={user}
          profile={profile}
          voiceState={currentVoiceState}
          language={language}
          onSelectLanguage={setLanguage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSettingsModal={() => setActiveModal("settings")}
        />

        {/* Ambient Stage Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Main Workspace Body */}
        {!hasMessages ? (
          /* Initial Stage: Large Centered Voice Orb + Localized Suggested Prompts */
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col justify-between items-center max-w-4xl w-full mx-auto space-y-6">
            {/* Localized Greeting Area */}
            <div className="text-center space-y-1 select-none pt-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {greeting}{displayName ? `, ${displayName}` : ""}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t.greetings.subheading}
              </p>
            </div>

            {/* Center Stage: Voice Orb & Real-time Status */}
            <div className="flex flex-col items-center justify-center space-y-4 my-auto py-2">
              <VoiceOrb
                state={currentVoiceState}
                audioLevel={audioLevel}
                onClick={handleOrbClick}
              />
              <VoiceStatusBadge
                state={currentVoiceState}
                errorMessage={errorMessage}
                interimTranscript={interimTranscript}
                activeTool={activeTool}
                onRetry={retry}
              />
            </div>

            {/* Auto-Play Toggle & Memory Hub Action */}
            <div className="w-full flex flex-col items-center space-y-2.5">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAutoPlay(!autoPlay)}
                  title={autoPlay ? "Switch Voice Output to Inactive" : "Switch Voice Output to Active"}
                  className={`h-7 px-3 text-xs gap-1.5 rounded-lg border transition-all ${
                    autoPlay
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                >
                  {autoPlay ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-amber-400" />}
                  <span className="font-medium">{autoPlay ? t.actions.voiceActive : t.actions.voiceInactive}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveModal("memories")}
                  className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                >
                  <Brain className="h-3 w-3" />
                  <span>{t.actions.memoryHub}</span>
                </Button>
              </div>

              <VoiceStateControls
                currentState={currentVoiceState}
                onStateChange={(state) => setPreviewOverride(state)}
              />
            </div>

            {/* Localized Suggested Query Prompts */}
            <div className="w-full">
              <SuggestedPrompts
                language={language}
                onSelectPrompt={handleSelectPrompt}
                disabled={isStreaming || currentVoiceState === "listening"}
              />
            </div>

            {/* Bottom Floating Voice & Text Input Bar */}
            <div className="w-full pt-2 pb-4">
              <VoiceInputBar
                value={inputText}
                interimTranscript={interimTranscript}
                onChange={setInputText}
                onSend={handleSendMessage}
                onToggleMic={handleOrbClick}
                onStopSpeaking={stopTTS}
                voiceState={currentVoiceState}
                disabled={isStreaming}
              />
            </div>
          </div>
        ) : (
          /* Active Conversation Thread View */
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Compact Top Voice Status Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border/40 bg-card/30 backdrop-blur-md shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleOrbClick}
                  className="relative group cursor-pointer focus:outline-none"
                  aria-label="Toggle voice input or interrupt"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <VoiceOrb
                      state={currentVoiceState}
                      audioLevel={audioLevel}
                      className="scale-[0.25] pointer-events-none"
                    />
                  </div>
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    Aura Voice Stream
                    {currentVoiceState === "speaking" && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono animate-pulse">
                        Speaking
                      </span>
                    )}
                    {currentVoiceState === "tool_execution" && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono animate-ping">
                        Tool Active
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {interimTranscript
                      ? `"${interimTranscript}"`
                      : currentVoiceState === "speaking"
                      ? "Assistant speaking"
                      : currentVoiceState === "tool_execution"
                      ? activeTool ? `Executing ${activeTool}...` : "Checking tools..."
                      : currentVoiceState.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentVoiceState === "speaking" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopTTS}
                    className="h-8 px-3 text-xs gap-1.5 font-bold shadow bg-red-600 hover:bg-red-700 text-white rounded-lg transition-transform active:scale-95"
                    aria-label="Stop speaking"
                  >
                    <Square className="h-3 w-3 fill-current" />
                    <span>Stop speaking</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveModal("memories")}
                  className="h-8 px-2 text-xs gap-1.5 border border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                  aria-label="Open Memories"
                >
                  <Brain className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.actions.memoryHub}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAutoPlay(!autoPlay)}
                  title={autoPlay ? "Switch Voice Output to Inactive" : "Switch Voice Output to Active"}
                  className={`h-8 px-2.5 text-xs gap-1.5 border transition-all ${
                    autoPlay
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                  }`}
                  aria-label="Toggle voice active state"
                >
                  {autoPlay ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-amber-400" />}
                  <span className="hidden sm:inline font-medium">{autoPlay ? t.actions.voiceActive : t.actions.voiceInactive}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.actions.newChat}</span>
                </Button>
              </div>
            </div>

            {/* Scrollable Chat History & Real-time Stream */}
            <ConversationView
              messages={messages}
              currentStreamingText={currentStreamingText}
              isStreaming={isStreaming}
              onStopGeneration={stopGeneration}
              onSpeakMessage={(text) => sendMessage(text)}
              onStopSpeaking={stopTTS}
              isSpeaking={currentVoiceState === "speaking"}
              user={user}
              profile={profile}
            />

            {/* Bottom Sticky Input Bar */}
            <div className="p-4 border-t border-border/40 bg-background/80 backdrop-blur-lg">
              <VoiceInputBar
                value={inputText}
                interimTranscript={interimTranscript}
                onChange={setInputText}
                onSend={handleSendMessage}
                onToggleMic={handleOrbClick}
                onStopSpeaking={stopTTS}
                voiceState={currentVoiceState}
                disabled={isStreaming}
              />
            </div>
          </div>
        )}

        {/* Modal Overlays: Settings / Memories / Database Tester */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
              {/* Modal Navigation Bar */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  {activeModal === "settings" && (
                    <>
                      <Settings className="h-5 w-5 text-indigo-400" />
                      <h2 className="text-lg font-bold text-foreground">Preferences</h2>
                    </>
                  )}
                  {activeModal === "memories" && (
                    <>
                      <Brain className="h-5 w-5 text-purple-400" />
                      <h2 className="text-lg font-bold text-foreground">Long-Term Memory Hub</h2>
                    </>
                  )}
                  {activeModal === "database" && (
                    <>
                      <Database className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-bold text-foreground">Database & RLS Tester</h2>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
                    <Button
                      variant={activeModal === "settings" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveModal("settings")}
                      className="text-xs h-7 px-2.5"
                    >
                      Preferences
                    </Button>
                    <Button
                      variant={activeModal === "memories" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveModal("memories")}
                      className="text-xs h-7 px-2.5 text-purple-400"
                    >
                      Memories
                    </Button>
                    <Button
                      variant={activeModal === "database" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActiveModal("database")}
                      className="text-xs h-7 px-2.5"
                    >
                      DB Tester
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveModal(null)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal Body */}
              {activeModal === "settings" && (
                <SettingsManager
                  userId={user.id}
                  onSettingsUpdated={(newSettings) => setUserSettings(newSettings)}
                />
              )}
              {activeModal === "memories" && (
                <MemoryManager userId={user.id} />
              )}
              {activeModal === "database" && (
                <DatabaseTester userId={user.id} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
