import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  Brain,
  Search,
  CloudSun,
  Calculator,
  Clock,
  FileText,
  Globe,
  Sparkles,
  Zap,
  Wrench,
  Volume2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 bg-grid-pattern">
          {/* Ambient Lighting Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Generation AI Voice Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight md:leading-tight">
              Your AI Assistant, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Just a Conversation Away.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Speak naturally, get intelligent answers, and let Aura take action for you.
            </p>

            {/* Consumer CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto text-base gap-2 px-8 py-6 shadow-lg shadow-indigo-500/25">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-border/80 hover:bg-accent">
                  Try Aura Voice
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. WHAT CAN AURA DO? (CAPABILITIES SECTION) */}
        <section className="py-16 md:py-24 border-t border-border/40 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3">
                Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                What Can Aura Do?
              </h2>
              <p className="mt-3 text-muted-foreground text-base">
                Everything you need from a modern voice assistant, built into one seamless experience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Card 1 */}
              <Card className="border-border/60 bg-card/60 hover:border-indigo-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                    <Mic className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Voice Conversations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Talk naturally in real-time with fluid hands-free voice interaction and instant speech recognition.
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="border-border/60 bg-card/60 hover:border-purple-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">AI Reasoning</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Deep contextual understanding for complex queries, step-by-step logic, and detailed explanations.
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="border-border/60 bg-card/60 hover:border-blue-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 border border-blue-500/20">
                    <Search className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Web Search</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Fetches live, up-to-date web answers instantly whenever you need current information.
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="border-border/60 bg-card/60 hover:border-amber-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/20">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Weather Reports</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Get real-time temperature, forecasts, and weather conditions for any city worldwide.
                </CardContent>
              </Card>

              {/* Card 5 */}
              <Card className="border-border/60 bg-card/60 hover:border-emerald-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Calculations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Evaluates math formulas, percentages, square roots, and complex expressions with exact precision.
                </CardContent>
              </Card>

              {/* Card 6 */}
              <Card className="border-border/60 bg-card/60 hover:border-cyan-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 border border-cyan-500/20">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Smart Reminders</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Schedule time-sensitive reminders using natural voice prompts like &quot;remind me tomorrow at 9 AM&quot;.
                </CardContent>
              </Card>

              {/* Card 7 */}
              <Card className="border-border/60 bg-card/60 hover:border-rose-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 border border-rose-500/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Notes &amp; Ideas</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Capture quick thoughts, todo items, and structured notes effortlessly as you speak.
                </CardContent>
              </Card>

              {/* Card 8 */}
              <Card className="border-border/60 bg-card/60 hover:border-violet-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2 border border-violet-500/20">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Long-Term Memory</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Remembers your key preferences and facts across sessions, with full transparency and control.
                </CardContent>
              </Card>

              {/* Card 9 */}
              <Card className="border-border/60 bg-card/60 hover:border-teal-500/40 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2 border border-teal-500/20">
                    <Globe className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Multilingual Support</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Seamlessly speak and listen in English, Hindi, Kannada, Telugu, Tamil, and Marathi.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. HOW AURA VOICE WORKS */}
        <section className="py-16 md:py-24 border-t border-border/40 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
                Experience
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                How Aura Voice Works
              </h2>
              <p className="mt-3 text-muted-foreground text-base sm:text-lg">
                Speak naturally. Aura understands, thinks, acts, and responds.
              </p>
            </div>

            {/* Visual Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto relative">
              {/* Workflow Step 1 */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-card/50 border border-border/60 relative group hover:border-indigo-500/40 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/20 mb-4 group-hover:scale-105 transition-transform">
                  🎤
                </div>
                <h3 className="text-base font-bold text-foreground mb-1 uppercase tracking-wider text-xs text-indigo-400">
                  Step 1
                </h3>
                <h4 className="text-lg font-bold text-foreground mb-2">SPEAK</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Talk naturally using your voice or type your request.
                </p>
              </div>

              {/* Workflow Step 2 */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-card/50 border border-border/60 relative group hover:border-purple-500/40 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/20 mb-4 group-hover:scale-105 transition-transform">
                  🧠
                </div>
                <h3 className="text-base font-bold text-foreground mb-1 uppercase tracking-wider text-xs text-purple-400">
                  Step 2
                </h3>
                <h4 className="text-lg font-bold text-foreground mb-2">UNDERSTAND</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aura converts your speech into text and understands the context of your request.
                </p>
              </div>

              {/* Workflow Step 3 */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-card/50 border border-border/60 relative group hover:border-blue-500/40 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-cyan-500/20 mb-4 group-hover:scale-105 transition-transform">
                  ⚡
                </div>
                <h3 className="text-base font-bold text-foreground mb-1 uppercase tracking-wider text-xs text-cyan-400">
                  Step 3
                </h3>
                <h4 className="text-lg font-bold text-foreground mb-2">THINK</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The AI reasons about what you need and decides how to respond.
                </p>
              </div>

              {/* Workflow Step 4 */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-card/50 border border-border/60 relative group hover:border-amber-500/40 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-amber-500/20 mb-4 group-hover:scale-105 transition-transform">
                  🛠️
                </div>
                <h3 className="text-base font-bold text-foreground mb-1 uppercase tracking-wider text-xs text-amber-400">
                  Step 4
                </h3>
                <h4 className="text-lg font-bold text-foreground mb-2">ACT</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When necessary, Aura can use tools such as search, weather, calculator, reminders, and notes.
                </p>
              </div>

              {/* Workflow Step 5 */}
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-card/50 border border-border/60 relative group hover:border-emerald-500/40 transition-all">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20 mb-4 group-hover:scale-105 transition-transform">
                  🔊
                </div>
                <h3 className="text-base font-bold text-foreground mb-1 uppercase tracking-wider text-xs text-emerald-400">
                  Step 5
                </h3>
                <h4 className="text-lg font-bold text-foreground mb-2">RESPOND</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Get the answer as text and natural voice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHAT MAKES AURA VOICE DIFFERENT? */}
        <section className="py-16 md:py-24 border-t border-border/40 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-3">
                Key Advantages
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                What Makes Aura Voice Different?
              </h2>
              <p className="mt-3 text-muted-foreground text-base sm:text-lg">
                More than a chatbot. Aura is designed to understand, remember, and act.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <Card className="border-border/60 bg-card/70 hover:border-indigo-500/40 transition-all">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-500/20">
                    <Mic className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">1. Voice First</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Have a natural conversation instead of typing every request. Speak directly to your assistant like talking to a real human.
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-border/60 bg-card/70 hover:border-purple-500/40 transition-all">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 border border-purple-500/20">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">2. Understands Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aura remembers the current conversation so you can ask follow-up questions naturally.
                  </p>
                  <div className="p-3 rounded-lg bg-background/80 border border-border/60 font-mono text-xs text-muted-foreground space-y-1">
                    <div className="text-indigo-400"><span className="text-foreground font-semibold">You:</span> Explain thermodynamics.</div>
                    <div className="text-indigo-400"><span className="text-foreground font-semibold">You:</span> What are its three laws?</div>
                    <div className="text-xs text-emerald-400 pt-1 font-sans italic">⚡ Aura knows &quot;its&quot; refers to thermodynamics.</div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 border border-amber-500/20">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">3. Can Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aura doesn&apos;t just answer questions. It can use real tools to perform useful tasks for you.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Calculate", "Search", "Check weather", "Create reminders", "Save notes"].map((tool) => (
                      <span key={tool} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 text-xs font-medium border border-amber-500/20">
                        ✓ {tool}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border-border/60 bg-card/70 hover:border-emerald-500/40 transition-all md:col-span-1 lg:col-span-1">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">4. Remembers What Matters</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Aura can remember useful information across conversations while giving you full control over your stored memories.
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="border-border/60 bg-card/70 hover:border-teal-500/40 transition-all md:col-span-2 lg:col-span-2">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2 border border-teal-500/20">
                    <Globe className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">5. Speaks Your Language</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Designed for multilingual voice interaction, supporting English alongside major Indian languages with real-time text-to-speech narration.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["English (en)", "Hindi (हिंदी)", "Kannada (ಕನ್ನಡ)", "Telugu (తెలుగు)", "Tamil (தமிழ்)", "Marathi (मराठी)"].map((lang) => (
                      <span key={lang} className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20">
                        🌐 {lang}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. SEE AURA IN ACTION (PRODUCT DEMO WORKFLOW) */}
        <section className="py-16 md:py-24 border-t border-border/40 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
                Live Workflow
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                See Aura in Action
              </h2>
              <p className="mt-3 text-muted-foreground text-base sm:text-lg">
                Voice &rarr; Understanding &rarr; Action &rarr; Response
              </p>
            </div>

            {/* Demo Card Showcase */}
            <div className="max-w-2xl mx-auto rounded-2xl border border-border/80 bg-card/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="space-y-6">
                {/* 1. User Voice Request */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    You
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground font-medium text-sm sm:text-base">
                    &quot;Remind me tomorrow at 9 AM to study DSA.&quot;
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex items-center justify-center text-indigo-400">
                  <div className="h-8 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                </div>

                {/* 2. Aura Understanding */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-indigo-500/30">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="flex-1 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-pulse text-indigo-400" />
                    <span>Aura understands: Intent = Create Reminder | Time = Tomorrow 9:00 AM | Topic = Study DSA</span>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex items-center justify-center text-purple-400">
                  <div className="h-8 w-0.5 bg-gradient-to-b from-purple-500 to-amber-500 rounded-full" />
                </div>

                {/* 3. Reminder Tool Action */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-amber-500/30">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-center justify-between">
                    <span>Executing Reminder Tool &hellip;</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">SAVED</span>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex items-center justify-center text-emerald-400">
                  <div className="h-8 w-0.5 bg-gradient-to-b from-amber-500 to-emerald-500 rounded-full" />
                </div>

                {/* 4. Aura Voice Response */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-indigo-500/30">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-card border border-emerald-500/30 text-foreground font-medium text-sm sm:text-base shadow-sm">
                    <span className="text-emerald-400 font-bold mr-2">Aura:</span>
                    &quot;Done. I&apos;ll remind you tomorrow at 9 AM to study DSA.&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA SECTION */}
        <section className="py-20 md:py-28 border-t border-border/40 bg-gradient-to-b from-card/30 to-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Ready to talk?
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Your next conversation with AI starts with your voice.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/signup">
                <Button size="lg" variant="gradient" className="text-base gap-2 px-10 py-6 text-lg shadow-xl shadow-indigo-500/25">
                  Start Talking
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
