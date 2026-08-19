# 🎙️ Aura — AI Voice Assistant & Multi-Agent Platform

<div align="center">

> **Talk naturally. Get intelligent answers. Take action with your voice.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-LPU_Inference-F55036?style=for-the-badge)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-25%2F25_Passing-brightgreen?style=for-the-badge)]()

</div>

---

## 📖 Overview

**Aura** is a full-stack, low-latency AI Voice Assistant and Multi-Agent platform built with **Next.js 14 App Router**, **React 18**, **TypeScript**, **Web Speech APIs**, and **Supabase**. 

Engineered with a deterministic **7-state audio-reactive voice pipeline**, Aura combines live client-side speech recognition, real-time audio amplitude visualization, multi-turn AI reasoning, automated agent tools, persistent long-term memory, and full multilingual speech support across 6 Indian regional languages.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [Voice Conversations](#-voice-conversations)
  - [AI Conversations & Streaming](#-ai-conversations--streaming)
  - [Agent Tools](#️-ai-agent-tools)
  - [Long-Term Memory](#-long-term-memory)
  - [Multilingual Support](#-multilingual-support)
  - [Security Hardening](#-authentication--security)
- [How It Works & Architecture](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Supabase Configuration](#-supabase-configuration)
- [Testing & Quality Assurance](#-testing--verification)
- [Production Deployment](#-deployment)
- [Author & License](#-author)

---

## ✨ Key Features

### 🎤 Voice Conversations
* **In-Browser Speech-to-Text (STT)**: Direct client-side speech transcription powered by native browser Web Speech API (`SpeechRecognition`) with zero third-party STT network latency.
* **Live Audio Reactivity**: Integrated `AudioContext` and `AnalyserNode` analyze microphone decibel amplitudes in real time to dynamically pulse and scale the glowing 3D Voice Orb.
* **Instant Zero-Latency Interruption**: Clicking the orb or microphone during active assistant speech immediately executes `speechSynthesis.cancel()` for natural conversational turn-taking.
* **Text-to-Speech (TTS)**: Dynamic speech synthesis matched automatically to active language locales with user-adjustable speaking speed and voice selection.

### 🧠 AI Conversations & Streaming
* **Multi-Turn Context Sliding Window**: Preserves historical conversation turns and injects relevant memories directly into the LLM system prompt.
* **Token-by-Token SSE Streaming**: Real-time token streaming via Server-Sent Events (SSE) for immediate time-to-first-token.
* **Request Cancellation**: Client-driven `AbortController` support instantly terminates server generation when switching chats or interrupting.
* **High-Speed Inference**: Supports ultra-low latency inference via Groq (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) and OpenAI models (`gpt-4o-mini`).

### 🛠️ AI Agent Tools
Aura includes 5 modular server-side agent tools with strict Zod runtime schema validation:

| Tool | Capability | Example Prompt |
| :--- | :--- | :--- |
| **🧮 Calculator** | Safe AST mathematical evaluator (no `eval()`) | *"What is 245 * 87 plus sqrt(144)?"* |
| **🌤️ Weather** | Live weather forecasting & geocoding via Open-Meteo REST API | *"What's the weather in Tokyo right now?"* |
| **🔍 Web Search** | Real-time web intelligence and news query tool | *"Latest news about the ISRO space mission"* |
| **⏰ Reminders** | Persistent task scheduling and alerts in Supabase | *"Remind me to submit project review at 5 PM"* |
| **📝 Notes** | Categorized knowledge and fact storage in Supabase | *"Save a work note that project deadline is Sep 15"* |

### 🧠 Long-Term Memory
* **Automatic Fact Extraction**: Heuristic extraction engine analyzes conversational inputs to identify work roles, learning goals, and user preferences.
* **Context Injection**: Stored facts are formatted under `[USER_LONG_TERM_MEMORIES]` and injected into future conversational contexts.
* **Memory Hub**: Complete management dashboard allowing users to view, search, and delete stored memories.
* **Privacy Toggle**: Memory retention can be enabled or disabled at any time in Preferences.

### 🇮🇳 Multilingual Support
Native voice transcription, AI generation, and speech synthesis localized across 6 Indian regional languages:

| Language | Code | Locale | BCP-47 Speech Code |
| :--- | :--- | :--- | :--- |
| **English** | `en` | `en-US` | `en-US` |
| **Kannada (ಕನ್ನಡ)** | `kn` | `kn-IN` | `kn-IN` |
| **Hindi (हिन्दी)** | `hi` | `hi-IN` | `hi-IN` |
| **Telugu (తెలుగు)** | `te` | `te-IN` | `te-IN` |
| **Tamil (தமிழ்)** | `ta` | `ta-IN` | `ta-IN` |
| **Marathi (मराठी)** | `mr` | `mr-IN` | `mr-IN` |

### 🔐 Authentication & Security
* **Supabase SSR Auth**: Cookie-based server-side session synchronization with automatic token refresh in Next.js middleware.
* **PostgreSQL Row Level Security (RLS)**: Strictly isolated multi-tenant data access (`auth.uid() = user_id`) across all 7 database tables.
* **Sliding-Window Rate Limiter**: Server-side 30 req/min token bucket per authenticated user to prevent API abuse.
* **Input Bounds & Sanitization**: Zod validation limiting payloads to 4,000 characters and stripping dangerous control characters.
* **Zero Client Secret Exposure**: Server-only environment boundary ensuring AI keys and database credentials never reach the browser.

---

## 🏗️ How It Works

### End-to-End Pipeline

```
 USER SPEAKS
      │
      ▼
 Speech Recognition (Web Speech STT)
      │
      ▼
 Client State Machine (useVoicePipeline)
      │  HTTP POST /api/chat (Server-Sent Events)
      ▼
 Next.js Server API Boundary
      ├── 1. Rate Limiter (30 req/min ceiling)
      ├── 2. Auth Session & Ownership Verification
      ├── 3. Zod Payload Bounds & Sanitization
      ├── 4. Memory Context Retriever
      └── 5. Tool Intent Analyzer & Execution
              │
              ├── [Tool Call] ──► Execute Tool (Calc / Weather / Search / Reminders / Notes)
              │                          │
              ▼                          ▼
      AI LLM Token Stream (Groq / OpenAI)
              │
              ▼
 Text-to-Speech (Web Speech TTS)
      │
      ▼
 VOICE PLAYBACK
```

### Deterministic 7-State Voice Machine

```text
[IDLE] ──► [LISTENING] ──► [PROCESSING] ──► [THINKING] ──► [TOOL_EXECUTION] ──► [SPEAKING] ──► [IDLE]
  ▲                                                                                               │
  └───────────────────────────────── [ERROR HANDLER] ◄────────────────────────────────────────────┘
```

1. **`IDLE`**: Ready and awaiting voice input or text prompt.
2. **`LISTENING`**: Microphone active, sampling real-time audio amplitude.
3. **`PROCESSING`**: Speech recognized, assembling conversational payload.
4. **`THINKING`**: Server-side AI model reasoning and memory retrieval.
5. **`TOOL_EXECUTION`**: Executing an agent tool with parameter validation.
6. **`SPEAKING`**: Synthesizing and streaming audio response through the speaker.
7. **`ERROR`**: Graceful fallback with sanitized error feedback.

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & Animation** | Tailwind CSS, Framer Motion, Lucide Icons, Sonner |
| **Backend & APIs** | Next.js Serverless API Routes (`/api/chat`, `/auth/callback`) |
| **Database & Auth** | Supabase (PostgreSQL with RLS, Supabase SSR Auth) |
| **AI LLM Inference** | Groq Cloud LPU API / OpenAI API |
| **Voice & Speech** | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), Web Audio API |
| **External Integrations** | Open-Meteo REST API (Live Weather & Geocoding) |
| **Deployment** | Vercel (Edge & Serverless Runtime) |

---

## 📁 Project Structure

```text
VoiceAssistant/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                 # Login and signup authentication pages
│   ├── api/chat/               # Secure SSE streaming & agent tool execution route
│   ├── app/                    # Protected main assistant stage
│   ├── auth/                   # OAuth and signout callback routes
│   ├── globals.css             # Design tokens and custom scrollbars
│   └── layout.tsx              # Root layout with font optimization
├── components/                 # Reusable UI component library
│   ├── auth/                   # Login, signup forms, and OAuth buttons
│   ├── dashboard/              # Settings, Memory Hub, and DB Tester modals
│   ├── layout/                 # Navigation header and language selector
│   ├── sidebar/                # Desktop & mobile drawer conversation sidebar
│   ├── ui/                     # Reusable atomic UI components (Button, Dialog, Dropdown)
│   └── voice/                  # Glowing Voice Orb, audio visualizer, and prompt chips
├── hooks/                      # Custom React hooks
│   ├── use-voice-input.ts      # Web Speech STT and AudioContext decibel analyzer
│   ├── use-ai-conversation.ts  # SSE streaming consumer with AbortController
│   ├── use-text-to-speech.ts   # Speech synthesis with instant interruption
│   └── use-voice-pipeline.ts   # Deterministic 7-state voice state machine
├── lib/                        # Core application business logic
│   ├── ai/                     # Groq and OpenAI streaming provider adapters
│   ├── env.ts                  # Zod-validated environment variable loader
│   ├── i18n/                   # Multilingual dictionaries and BCP-47 speech codes
│   ├── memory/                 # Long-term memory extractor and retriever
│   ├── security/               # Rate limiter, input validator, and error sanitizer
│   └── tools/                  # Calculator, Weather, Search, Reminders, Notes
├── services/                   # Frontend service abstractions (Auth, Settings, Memory)
├── supabase/                   # Supabase clients (SSR, client) and schema.sql
├── types/                      # TypeScript definitions (database, voice, ai, settings)
├── utils/                      # Title generator, date grouping, and math evaluators
└── scripts/                    # Automated testing harness and live QA scripts
```

---

## 🗄️ Database Schema

The database is built on Supabase PostgreSQL with **Row Level Security (RLS)** active across all 7 tables:

```
auth.users (Supabase Managed)
    │
    ├── 1:1 ──► public.profiles (User profile data)
    ├── 1:1 ──► public.user_settings (Voice, speed, theme, language preferences)
    │
    ├── 1:N ──► public.conversations (Chat sessions & auto-titles)
    │                │
    │                └── 1:N ──► public.messages (Chat messages & tool outputs)
    │
    ├── 1:N ──► public.memories (Extracted persistent user facts)
    ├── 1:N ──► public.reminders (Scheduled tasks & alerts)
    └── 1:N ──► public.tool_executions (Structured tool execution audit logs)
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Sharan126/VoiceAssistant.git
cd VoiceAssistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# ------------------------------------------------------------------------------
# Supabase Configuration (Required)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------------------------------------------------------------------
# AI Provider Configuration (Groq / OpenAI)
# ------------------------------------------------------------------------------
GROQ_API_KEY=your-groq-api-key
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-120b

# Optional: Supabase Service Role Key (Server-Only)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ⚡ Supabase Configuration

1. Create a project at **[supabase.com](https://supabase.com)** (or [database.new](https://database.new)).
2. Navigate to **Project Settings > API** to copy your **Project URL** and **`anon` public key** into `.env.local`.
3. Open the **SQL Editor** in your Supabase Dashboard.
4. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql), paste it into the editor, and click **Run**.
5. Under **Authentication > URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your live production domain).
   - Add **Redirect URLs**:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/callback`

---

## 🏃 Running Locally

Start the development server:

```powershell
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser (*Google Chrome or Microsoft Edge recommended for full Web Speech API support*).

---

## 🧪 Testing & Verification

Run the automated test suite and production verification checks:

```bash
# 1. Run the comprehensive automated test suite (25 test cases across 7 domains)
npx tsx scripts/verify-all.ts

# 2. Strict TypeScript typechecking
npm run typecheck

# 3. ESLint verification
npm run lint

# 4. Production build verification
npm run build
```

---

## 📊 Production Verification

| Check | Result | Verification Method |
| :--- | :--- | :--- |
| **Automated Test Suite** | ✅ 25 / 25 Passed | Automated test harness (`scripts/verify-all.ts`) |
| **TypeScript Compiler** | ✅ 0 Errors | Static typecheck (`tsc --noEmit`) |
| **ESLint Quality Check** | ✅ 0 Warnings / Errors | Next.js Linter (`next lint`) |
| **Production Build** | ✅ 10 / 10 Routes Compiled | Next.js Build (`next build`) |
| **Supabase SSR Auth** | ✅ Verified | Middleware cookie session refresh & token checks |
| **Voice Pipeline State Machine** | ✅ Verified | Deterministic 7-state audio-reactive lifecycle |
| **AI Token Streaming** | ✅ Verified | Server-Sent Events (SSE) with `AbortController` |
| **Agent Tool Execution** | ✅ Verified | Zod-validated Calculator, Weather, Search, Reminders, Notes |
| **Persistent Memory Hub** | ✅ Verified | Heuristic extraction and system prompt injection |
| **Multilingual i18n** | ✅ Verified | 6 languages (en, kn, hi, te, ta, mr) across STT/TTS |
| **Security & Rate Limiting** | ✅ Verified | 30 req/min sliding-window token limiter & input bounds |

---

## 🔒 Security Hardening

> [!CAUTION]
> **Never commit your `.env.local` file or expose private API keys in public repositories.** Keep all private credentials in `.env.local`, which is strictly ignored by `.gitignore`.

* **Server-Side Secret Isolation**: AI keys and Supabase service keys are strictly isolated to server-side execution (`lib/env.ts`) and never bundled into client JavaScript.
* **Row Level Security (RLS)**: Enforced across all 7 database tables ensuring complete tenant isolation (`auth.uid() = user_id`).
* **Sliding-Window Rate Limiting**: 30 requests/minute ceiling per user on `/api/chat` returning `HTTP 429 Too Many Requests`.
* **Payload Bounds & Sanitization**: Zod validation limiting input length to 4,000 characters and stripping dangerous control characters.
* **Error Masking**: Database queries and server exceptions are sanitized before sending responses to the client.

---

## 🚀 Deployment

The project is optimized for deployment on **Vercel**:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: aura voice assistant"
   git push origin main
   ```
2. Import the repository into **[Vercel](https://vercel.com/new)**.
3. In Project Settings, add the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `GROQ_API_KEY`, `AI_BASE_URL`, `AI_MODEL`).
4. Click **Deploy**.
5. Update your **Supabase Dashboard > Authentication > URL Configuration** with your live Vercel domain (`https://your-app-name.vercel.app`).

---

## 🔮 Future Improvements

- [ ] Calendar integration (Google Calendar / Outlook) for automated voice meeting scheduling.
- [ ] Email integration for voice-dictated drafts and inbox summarization.
- [ ] Vector semantic search with `pgvector` for similarity-based long-term memory recall.
- [ ] Custom wake-word engine (e.g., *"Hey Aura"*) using lightweight local WebAssembly models.
- [ ] Integration with specialized voice providers (ElevenLabs, Deepgram).
- [ ] Native mobile companion app using React Native / Expo.

---

## 👤 Author

**Sharan**
- GitHub: [@Sharan126](https://github.com/Sharan126)
- Repository: [VoiceAssistant](https://github.com/Sharan126/VoiceAssistant)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
