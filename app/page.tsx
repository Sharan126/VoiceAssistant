import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 bg-grid-pattern">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Part 1: Enterprise Project Foundation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight md:leading-tight">
              Next-Generation <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Voice Assistant
              </span>{" "}
              Platform
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Engineered with clean layered architecture, Supabase authentication & PostgreSQL, strict TypeScript, and a modern responsive interface.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto text-base gap-2 px-7">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                  Sign In to Workspace
                </Button>
              </Link>
            </div>

            {/* Technical Highlights Bar */}
            <div className="mt-14 pt-8 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Zero Exposure</h4>
                  <p className="text-xs text-muted-foreground">Client secret protection</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Supabase SSR</h4>
                  <p className="text-xs text-muted-foreground">Cookie-based Auth & RLS</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Layered Design</h4>
                  <p className="text-xs text-muted-foreground">Strict separation of logic</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Strict TS</h4>
                  <p className="text-xs text-muted-foreground">Full type safety</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Foundation Architecture Section */}
        <section className="py-16 md:py-20 border-t border-border/40 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Architectural Foundation
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                A clean, scalable foundation designed specifically for production AI streaming and voice workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Layers className="h-5 w-5" />
                  </div>
                  <CardTitle>Clean Separation</CardTitle>
                  <CardDescription>
                    UI, business logic, Supabase database queries, and external APIs are strictly isolated into dedicated modules.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1 font-mono">
                  <div>app/ — Routes & Layouts</div>
                  <div>components/ — Atomic UI & Cards</div>
                  <div>services/ — Auth & Data Operations</div>
                  <div>supabase/ — Clients & Middleware</div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                    <Database className="h-5 w-5" />
                  </div>
                  <CardTitle>Supabase Auth & RLS</CardTitle>
                  <CardDescription>
                    Modern cookie-based session synchronization with `@supabase/ssr`, automated profile triggers, and Row Level Security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1 font-mono">
                  <div>auth.users &harr; public.profiles</div>
                  <div>Server & Browser client wrappers</div>
                  <div>Edge Middleware session refresh</div>
                  <div>Custom user metadata syncing</div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle>Voice Pipeline Ready</CardTitle>
                  <CardDescription>
                    Structured to cleanly host real-time audio streams, WebSocket handlers, and speech synthesis in subsequent phases.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1 font-mono">
                  <div>Zero fake AI placeholders</div>
                  <div>Secure server-side API boundary</div>
                  <div>Environment variable validation</div>
                  <div>Reactive user state management</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
