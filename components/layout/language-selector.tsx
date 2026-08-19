"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { LANGUAGE_LIST, getLanguageConfig } from "@/lib/i18n";

interface LanguageSelectorProps {
  currentLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  className?: string;
}

export function LanguageSelector({
  currentLanguage,
  onSelectLanguage,
  className = "",
}: LanguageSelectorProps) {
  const currentConfig = getLanguageConfig(currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/40 bg-card/30 ${className}`}
          aria-label="Select conversation language"
        >
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-medium text-foreground">{currentConfig.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Conversation Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {LANGUAGE_LIST.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className="flex items-center justify-between cursor-pointer text-xs py-2"
            >
              <div>
                <span className="font-medium text-foreground block">{lang.nativeName}</span>
                <span className="text-[10px] text-muted-foreground">{lang.name} ({lang.speechCode})</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
