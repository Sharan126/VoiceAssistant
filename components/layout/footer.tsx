import { APP_CONFIG } from "@/lib/constants";
import { Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</span>
        </div>

        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
            <Shield className="h-3.5 w-3.5" />
            Zero Client Secret Exposure
          </span>
          <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer">
            <Sparkles className="h-3.5 w-3.5" />
            Supabase RLS Protected
          </span>
        </div>
      </div>
    </footer>
  );
}
