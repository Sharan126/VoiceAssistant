"use client";

import { motion } from "framer-motion";
import { getTranslations } from "@/lib/i18n";
import { Bell, Calendar, Code, Globe, Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
  language?: string;
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function SuggestedPrompts({
  language = "en",
  onSelectPrompt,
  disabled,
}: SuggestedPromptsProps) {
  const t = getTranslations(language);

  const localizedPrompts = [
    { id: "1", icon: Calendar, title: t.prompts.planDay.title, prompt: t.prompts.planDay.prompt },
    { id: "2", icon: Sparkles, title: t.prompts.explain.title, prompt: t.prompts.explain.prompt },
    { id: "3", icon: Globe, title: t.prompts.webSearch.title, prompt: t.prompts.webSearch.prompt },
    { id: "4", icon: Bell, title: t.prompts.reminder.title, prompt: t.prompts.reminder.prompt },
    { id: "5", icon: Code, title: t.prompts.coding.title, prompt: t.prompts.coding.prompt },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {localizedPrompts.map((item, idx) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPrompt(item.prompt)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border/60 bg-card/50 hover:bg-accent/60 hover:border-primary/40 text-foreground text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none group"
            >
              <div className="p-1 rounded-md bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">{item.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
