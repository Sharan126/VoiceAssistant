"use client";

import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const displayLanguage = (language || "code").toLowerCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="my-4 rounded-xl border border-border/80 bg-slate-950 overflow-hidden shadow-md">
      {/* Header bar with language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 capitalize">
          <Code2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>{displayLanguage}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs gap-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code contents with horizontal scrolling and whitespace preservation */}
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre font-normal selection:bg-indigo-500/30 selection:text-white">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
