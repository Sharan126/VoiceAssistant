# Aura — AI Voice Assistant & Multi-Agent Platform

A modern, production-grade AI Voice Assistant and Multi-Agent Platform built with Next.js 14, React, TypeScript, Tailwind CSS, Web Speech APIs, and Supabase.

---

## 1. Project Overview

**Aura** delivers an interactive, low-latency, and fluid conversational voice experience with live audio reactivity, multi-turn AI reasoning, automated agent tool execution, persistent long-term memory, multilingual speech support (across 6 languages), and enterprise security hardening.

---

## 2. Key Features

- 🎙️ **Real-Time Voice Pipeline**: In-browser speech-to-text (STT) with live audio amplitude reactivity and instant zero-latency interruption (`speechSynthesis.cancel()`).
- 🧠 **AI Conversation Engine**: Multi-turn sliding-window context streaming via Server-Sent Events (SSE) with request cancellation (`AbortController`).
- 🤖 **Modular Agent Tools**: 5 production tools with Zod schema validation:
  - **Calculator**: Safe AST arithmetic evaluator (no `eval()`).
  - **Weather**: Real-time geocoding and forecast via Open-Meteo REST API.
  - **Web Search**: Real-time web intelligence and news query tool.
  - **Reminders**: Persistent task and reminder scheduling in Supabase.
  - **Notes / Memories**: Long-term fact and knowledge store.
- 💾 **Persistent Long-Term Memory**: Heuristic memory extraction and relevant context injection into LLM system prompts.
- 🌐 **Multilingual Voice Architecture**: End-to-end support for **English**, **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, **Telugu (తెలుగు)**, **Tamil (தமிழ்)**, and **Marathi (मराठी)** across STT, AI generation, TTS, and UI localization.
- 🗂️ **Conversation Management**: Chronological date grouping (*Today*, *Yesterday*, *Previous 7 days*, *Older*), zero-overhead automatic title generator from the first prompt, search filter, and inline rename.
- ⚙️ **Personalization & Settings**: Voice selection, speaking rate, auto-play toggles, response styles (*conversational*, *concise*, *detailed*, *technical*), and privacy data clearing.
- 🔒 **Enterprise Security & Production Hardening**: Sliding-window rate limiter (30 req/min per user), conversation ownership verification, payload bounds (4k chars / 50 msgs), sanitized error masking, and Row Level Security (RLS) across all 7 database tables.

---

## 3. Architecture

```
User Voice Input
       │
       ▼
Web Speech STT Provider (recognition.lang)
       │
       ▼
Client State Machine (useVoicePipeline)
       │ (HTTP POST /api/chat)
       ▼
Server API Route & Security Guard
  ├── 1. Sliding-Window Rate Limiter (30 req/min)
  ├── 2. Supabase Server-Side Auth Verification
  ├── 3. Zod Payload Bounds & Sanitization
  ├── 4. Conversation Ownership & Tenant Isolation
  ├── 5. Memory Retriever (Injects Relevant Memories)
  ├── 6. Tool Intent Analyzer & Execution (ToolRegistry)
  └── 7. AI Provider Token Streaming (OpenAI / Groq / Mock)
       │
       ▼
Client Stream Consumer (useAIConversation)
       │
       ▼
Web Speech TTS (useTextToSpeech - Auto-matches Locale)
       │
       ▼
Audio Speaker Playback
```

---

## 4. Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **UI & Styling**: React 18, [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS, Supabase Auth SSR)
- **Validation**: [Zod](https://zod.dev/)
- **AI & Speech**: Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), OpenAI API / Groq compatible streaming endpoints
- **Icons & Visuals**: Lucide Icons, Custom Animated Voice Orb

---

## 5. Folder Structure

```
├── app/
│   ├── api/chat/route.ts       # Secure AI streaming & agent tools endpoint
│   ├── auth/                   # Supabase auth callback & signout routes
│   ├── login/ & signup/        # Authentication pages
│   ├── app/page.tsx            # Protected main assistant stage
│   ├── globals.css             # Design tokens & custom scrollbars
│   └── layout.tsx              # Root layout with font configuration
├── components/
│   ├── dashboard/              # Settings, Memory Hub, DB Tester modals
│   ├── layout/                 # Header, user navigation, language selector
│   ├── sidebar/                # Desktop & mobile drawer conversation sidebar
│   ├── ui/                     # Reusable UI components (buttons, dropdowns, avatars)
│   └── voice/                  # Voice Orb, status badge, prompt chips, input bar
├── hooks/
│   ├── use-voice-input.ts      # Web Speech STT & amplitude analysis hook
│   ├── use-ai-conversation.ts  # SSE streaming & cancellation hook
│   ├── use-text-to-speech.ts   # Speech synthesis & zero-latency interruption
│   └── use-voice-pipeline.ts   # 7-state unified deterministic state machine
├── lib/
│   ├── ai/                     # AI provider interfaces (OpenAI, Groq, Mock)
│   ├── i18n/                   # Centralized multilingual dictionaries & speech codes
│   ├── memory/                 # Long-term memory extractor & retriever
│   ├── security/               # Rate limiter, input validator, error sanitizer
│   └── tools/                  # Calculator, Weather, Search, Reminders, Notes
├── services/                   # Frontend service abstractions (Auth, Settings, Memory, STT)
├── supabase/                   # Supabase clients (SSR, client) and schema.sql
├── types/                      # TypeScript definitions (database, voice, ai, settings)
└── utils/                      # Title generator, date grouping, math evaluators
```

---

## 6. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration (Required for Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here # Server-only!

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider Configuration (Optional — defaults to Mock AI when omitted)
AI_API_KEY=your-openai-or-groq-api-key
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1
```

---

## 7. Supabase Setup

1. Create a new Supabase project at [database.new](https://database.new).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](file:///c:/Users/Lenovo/VoiceAssistant/supabase/schema.sql) from this repository.
4. Run the SQL script to create all 7 tables with RLS policies, performance indexes, and automatic profile creation triggers:
   - `profiles`
   - `conversations`
   - `messages`
   - `memories`
   - `reminders`
   - `tool_executions`
   - `user_settings`
5. Enable Email Auth under **Authentication > Providers**.

---

## 8. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run automated test harness
npx tsx scripts/verify-all.ts

# 3. Start local development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 9. AI Setup

Aura supports interchangeable AI providers:
- **OpenAI**: Set `AI_API_KEY=sk-...` and `AI_MODEL=gpt-4o-mini`.
- **Groq**: Set `GROQ_API_KEY=gsk-...`, `AI_MODEL=llama-3.1-70b-versatile`, and `AI_BASE_URL=https://api.groq.com/openai/v1`.
- **Mock AI**: When no API key is provided, the application automatically falls back to an intelligent built-in mock provider that exercises all agent tools, multilingual translations, and streaming responses offline.

---

## 10. Voice Setup

- **STT (Speech-to-Text)**: Powered by the browser's native `SpeechRecognition` / `webkitSpeechRecognition` API. Works out of the box in Google Chrome, Microsoft Edge, Safari, and Chromium-based browsers.
- **Audio Amplitude Reactivity**: An `AudioContext` and `AnalyserNode` analyze real-time decibels to smoothly scale the Voice Orb while listening.
- **TTS (Text-to-Speech)**: Powered by `window.speechSynthesis`. Voices are dynamically matched to the active language locale (`en-US`, `kn-IN`, `hi-IN`, `te-IN`, `ta-IN`, `mr-IN`). Clicking the microphone during speech immediately executes `speechSynthesis.cancel()` for instantaneous interruption.

---

## 11. Tool Setup

All tools are automatically registered in [`lib/tools/index.ts`](file:///c:/Users/Lenovo/VoiceAssistant/lib/tools/index.ts):
- **Calculator**: Operates entirely client-side/server-side using AST mathematical evaluation.
- **Weather**: Connects to the free public Open-Meteo REST API (no API key required).
- **Web Search**: Integrates structured search results for news and queries.
- **Reminders & Notes**: Directly persists to Supabase tables scoped to the authenticated user ID.

---

## 12. Deployment

### Deploying to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. In Project Settings, add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AI_API_KEY`).
4. Click **Deploy**.

---

## 13. Security Notes

- **Secret Isolation**: `SUPABASE_SERVICE_ROLE_KEY` and `AI_API_KEY` are strictly server-side and never bundled into client JavaScript.
- **Rate Limiting**: Server endpoints enforce a 30 req/min sliding-window token limit per user ID.
- **Anti-Tampering**: Server verifies conversation ownership (`user_id === user.id`) before allowing any message inserts.
- **Error Masking**: Production errors are sanitized to prevent stack trace or database credential leaks.

---

## 14. Known Limitations

1. **Browser Speech Recognition Support**: In-browser STT requires Web Speech API support (Google Chrome, Edge, Safari). Browsers like Firefox do not natively expose `SpeechRecognition` (text input remains fully functional).
2. **Offline Audio Playback**: High-quality natural voices in `speechSynthesis` depend on OS and browser-installed language packs for Indian regional languages (Kannada, Telugu, Tamil, Marathi). Fallback system voices are used if regional voice packs are not installed locally on the client device.
