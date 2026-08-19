"use client";

import { useState, useEffect, useCallback } from "react";
import { settingsService } from "@/services/settings-service";
import { ttsService } from "@/services/text-to-speech-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Sliders,
  Volume2,
  Brain,
  Palette,
  Globe,
  ShieldAlert,
  Loader2,
  Check,
  Play,
  Trash2,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  RESPONSE_STYLES,
  type ThemeOption,
} from "@/types/settings.types";
import type { UserSettings } from "@/types/database.types";

interface SettingsManagerProps {
  userId: string;
  onSettingsUpdated?: (settings: UserSettings) => void;
}

export function SettingsManager({ userId, onSettingsUpdated }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "ai" | "appearance" | "language" | "privacy">("voice");
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [voices, setVoices] = useState<{ id: string; name: string; lang: string }[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await settingsService.getUserSettings(userId);
    if (error) {
      toast.error(`Could not load preferences: ${error}`);
    } else if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateVoices = async () => {
        const available = await ttsService.getVoices();
        setVoices(available);
      };
      updateVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    if (!settings) return;
    setIsSaving(true);

    const { data, error } = await settingsService.updateUserSettings(userId, updates);
    if (error || !data) {
      toast.error(`Failed to save: ${error}`);
    } else {
      setSettings(data);
      if (onSettingsUpdated) {
        onSettingsUpdated(data);
      }
      toast.success("Preferences updated");

      // Apply theme dynamically
      if (updates.theme) {
        applyTheme(updates.theme as ThemeOption);
      }
    }
    setIsSaving(false);
  };

  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  const handleTestVoice = async () => {
    if (!settings) return;
    setIsTestingVoice(true);

    const testPhrases: Record<string, string> = {
      en: "Hello! Aura Voice Assistant is ready for your commands.",
      kn: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಧ್ವನಿ ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ.",
      hi: "नमस्ते! आपका वॉइस असिस्टेंट तैयार है।",
      te: "నమస్కారం! మీ వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది.",
      ta: "வணக்கம்! உங்கள் குரல் உதவியாளர் தயாராக உள்ளது.",
      mr: "नमस्कार! तुमचा व्हॉईस असिस्टंट तयार आहे.",
    };

    const phrase = testPhrases[settings.language] || testPhrases["en"] || "Hello! This is a test.";

    try {
      await ttsService.speak(phrase, {
        voice: settings.voice,
        rate: settings.speaking_speed,
      });
    } catch {
      toast.error("Audio playback test failed");
    } finally {
      setIsTestingVoice(false);
    }
  };

  // Privacy Actions
  const handleClearConversations = async () => {
    if (!confirm("Are you sure you want to delete all conversations? This cannot be undone.")) return;
    const { success, error } = await settingsService.clearAllConversations(userId);
    if (success) toast.success("All conversations cleared");
    else toast.error(`Error: ${error}`);
  };

  const handleClearMemories = async () => {
    if (!confirm("Are you sure you want to clear all long-term memories?")) return;
    const { success, error } = await settingsService.clearAllMemories(userId);
    if (success) toast.success("All memories cleared");
    else toast.error(`Error: ${error}`);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("DANGER: Are you sure you want to delete your entire account and all associated data?")) return;
    const { success, error } = await settingsService.deleteAccount();
    if (success) {
      toast.success("Account deleted. Redirecting...");
      window.location.href = "/login";
    } else {
      toast.error(`Delete failed: ${error}`);
    }
  };

  if (isLoading || !settings) {
    return (
      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-8 flex items-center justify-center space-x-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading preferences...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-md">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Settings & Personalization</CardTitle>
            <CardDescription className="text-xs">
              Configure your voice, AI persona, language, appearance, and privacy controls.
            </CardDescription>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="flex items-center gap-1 pt-3 overflow-x-auto">
          {[
            { id: "voice", label: "Voice", icon: Volume2 },
            { id: "ai", label: "AI Model", icon: Brain },
            { id: "appearance", label: "Appearance", icon: Palette },
            { id: "language", label: "Language", icon: Globe },
            { id: "privacy", label: "Privacy", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs h-8 px-3 gap-1.5 shrink-0 ${
                  isActive ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* 1. VOICE TAB */}
        {activeTab === "voice" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Assistant Voice</Label>
              <select
                value={settings.voice}
                onChange={(e) => handleUpdate({ voice: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-background text-foreground"
              >
                <option value="default">Default System Voice</option>
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-foreground">Speaking Speed</Label>
                <span className="text-xs font-mono text-primary">{settings.speaking_speed}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.speaking_speed}
                onChange={(e) => handleUpdate({ speaking_speed: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/40">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-foreground">Auto-Play Audio</Label>
                <p className="text-[11px] text-muted-foreground">Automatically speak assistant replies upon completion.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_play}
                onChange={(e) => handleUpdate({ auto_play: e.target.checked })}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestVoice}
              disabled={isTestingVoice}
              className="gap-2 text-xs border-border/80 hover:border-primary/50"
            >
              <Play className="h-3.5 w-3.5 text-primary" />
              <span>{isTestingVoice ? "Playing Sample..." : "Test Voice Preview"}</span>
            </Button>
          </div>
        )}

        {/* 2. AI TAB */}
        {activeTab === "ai" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Response Style Persona</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {RESPONSE_STYLES.map((style) => {
                  const isSelected = (settings.response_style || "conversational") === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => handleUpdate({ response_style: style.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 bg-background/30 hover:border-border text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">{style.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{style.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/40">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-foreground">Long-Term Memory</Label>
                <p className="text-[11px] text-muted-foreground">Allow the assistant to remember your goals and preferences across conversations.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.memory_enabled}
                onChange={(e) => handleUpdate({ memory_enabled: e.target.checked })}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 3. APPEARANCE TAB */}
        {activeTab === "appearance" && (
          <div className="space-y-4">
            <Label className="text-xs font-semibold text-foreground">Color Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "dark", label: "Dark Mode", icon: Moon },
                { id: "light", label: "Light Mode", icon: Sun },
                { id: "system", label: "System Default", icon: Monitor },
              ].map((t) => {
                const isSelected = (settings.theme || "dark") === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleUpdate({ theme: t.id })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/60 bg-background/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. LANGUAGE TAB */}
        {activeTab === "language" && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-foreground">Primary Conversation Language</Label>
            <p className="text-[11px] text-muted-foreground mb-2">
              The assistant will adapt voice speech recognition, audio narration, and AI responses natively to the selected language.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = (settings.language || "en") === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => handleUpdate({ language: lang.code })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/60 bg-background/30 hover:border-border text-muted-foreground"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{lang.nativeName}</span>
                      <span className="text-[10px] text-muted-foreground">{lang.name} &middot; {lang.locale}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. PRIVACY & DANGER ZONE TAB */}
        {activeTab === "privacy" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-border/60 bg-background/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Clear All Conversations</h3>
                  <p className="text-[11px] text-muted-foreground">Permanently delete your entire chat history and message logs.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearConversations}
                  className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear Chats
                </Button>
              </div>

              <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Clear All AI Memories</h3>
                  <p className="text-[11px] text-muted-foreground">Wipe all extracted preferences, learning goals, and saved notes.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearMemories}
                  className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear Memories
                </Button>
              </div>
            </div>

            {/* Account Deletion */}
            <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-destructive">Delete Account</h3>
                <p className="text-[11px] text-muted-foreground">Permanently remove your account and all associated data.</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteAccount}
                className="text-xs"
              >
                Delete Account
              </Button>
            </div>
          </div>
        )}

        {/* Saving Status Footer */}
        {isSaving && (
          <div className="flex items-center gap-1.5 text-[11px] text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving changes to Supabase...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
