"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { UserNav } from "@/components/layout/user-nav";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { Mic, Sparkles } from "lucide-react";

export function Navbar() {
  const { user, profile, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Mic className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-foreground text-lg leading-tight flex items-center gap-1.5">
              {APP_CONFIG.name}
              <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-400">
                <Sparkles className="mr-0.5 h-2.5 w-2.5" /> v0.1
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-3">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              <Link href="/app">
                <Button variant="ghost" size="sm">
                  Workspace
                </Button>
              </Link>
              <UserNav user={user} profile={profile} />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
