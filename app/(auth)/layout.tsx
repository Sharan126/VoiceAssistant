import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";
import { Mic, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden bg-grid-pattern">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
            <Mic className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground">{APP_CONFIG.name}</span>
        </Link>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground relative z-10">
        Protected by Supabase Auth with Row Level Security &middot; Encrypted Sessions
      </footer>
    </div>
  );
}
