"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Action Confirmation Modal.
 * Prompts explicit user consent before executing sensitive tool operations.
 */
export function ActionConfirmationModal({
  isOpen,
  title = "Confirm Sensitive Action",
  description,
  onConfirm,
  onCancel,
}: ActionConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md p-5 rounded-2xl border border-amber-500/40 bg-slate-900 text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400">Confirmation required before execution</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 leading-relaxed">
          {description}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-9 px-3.5 text-xs gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="h-9 px-4 text-xs gap-1.5 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Confirm Action</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
