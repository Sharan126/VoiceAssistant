# 🎙️ AI Voice Assistant

> Talk naturally. Get intelligent answers. Take action with your voice.

An interactive, production-grade AI Voice Assistant and Multi-Agent Platform built with Next.js 14, React 18, TypeScript, Tailwind CSS, Web Speech APIs, and Supabase. Aura delivers low-latency conversational voice interactions, live audio-amplitude reactivity, multi-turn AI reasoning, automated agent tool execution, persistent long-term memory, multilingual speech support across 6 Indian regional languages, and enterprise-grade security hardening.

---

## ✨ Features

### 🎤 Voice Conversations
- **In-Browser Speech-to-Text (STT)**: Powered by native browser speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`) with zero third-party STT latency.
- **Visual Audio Reactivity**: Integrated `AudioContext` and `AnalyserNode` analyze microphone decibels in real time to smoothly scale the glowing 3D Voice Orb during speech.
- **Zero-Latency Interruption**: Clicking the orb or microphone during active assistant speech immediately calls `speechSynthesis.cancel()`, allowing fluid and natural conversational interruptions.
- **Text-to-Speech (TTS)**: Dynamic speech synthesis matched automatically to the selected language locale with customizable playback rate and voice styles.

### 🧠 AI Conversations
- **Multi-Turn Context Preservation**: Retains conversational history using a sliding-window context buffer so conversations feel continuous and intelligent.
- **Context Injection**: Automatically injects relevant user memories, user settings, and time-aware system context into the LLM system prompt.
- **Configurable LLM Models**: Supports ultra-fast inference via Groq (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.3-70b-versatile`) as well as OpenAI models (`gpt-4o-mini`).

### ⚡ Real-Time Streaming
- **Server-Sent Events (SSE)**: Response tokens stream token-by-token from the server to the client with sub-second time-to-first-token.
- **Cancellable Streams**: Integrated `AbortController` support allows immediate cancellation of server streaming if the user navigates away or starts a new prompt.

### 🛠️ AI Agent Tools
The assistant includes 5 modular server-side agent tools with strict Zod schema validation:

1. **Calculator**: Safe Abstract Syntax Tree (AST) mathematical evaluator supporting arithmetic, powers, and square roots without using `eval()`.
   * *Example*: *"What is 245 multiplied by 87 plus the square root of 144?"*
2. **Weather**: Real-time geocoding and live weather forecasting powered by the Open-Meteo REST API.
   * *Example*: *"What is the weather like in Tokyo right now?"*
3. **Web Search**: Real-time web intelligence and news query tool for live information retrieval.
   * *Example*: *"What is the latest news about the ISRO space mission?"*
4. **Reminders**: Persistent task scheduling and reminder creation stored in Supabase.
   * *Example*: *"Remind me to submit the quarterly project report tomorrow at 5 PM."*
5. **Notes**: Persistent notes, fact storage, and category tagging.
   * *Example*: *"Save a note under work that my final project deadline is September 15th."*

### 🧠 Long-Term Memory
- **Heuristic Fact Extraction**: Automatically analyzes user messages to identify and extract persistent personal preferences, work roles, learning goals, and facts.
- **Intelligent Prompt Injection**: Dynamically formats relevant stored memories under `[USER_LONG_TERM_MEMORIES]` into future AI conversation prompts.
- **Memory Hub**: Full UI dashboard for viewing, organizing, searching, and deleting stored memories.
- **Toggle Control**: Users can enable or disable memory retention at any time in Preferences.

### 💬 Conversation Management
- **Automatic Title Generation**: Automatically generates clean, concise conversation titles from the user's initial prompt without extra latency.
- **Chronological Date Grouping**: Organizes chat history into *Today*, *Yesterday*, *Previous 7 days*, and *Older*.
- **Search & Filter**: Real-time search filter across all past conversations.
- **Inline Rename & Delete**: Clean conversation management with confirmation safeguards and database cascading deletes.

### 🇮🇳 Multilingual Support
End-to-end multilingual localization across Speech-to-Text (STT), AI system reasoning, Text-to-Speech (TTS), and UI interfaces:

| Language | Code | Locale | BCP-47 Speech Code |
| :--- | :--- | :--- | :--- |
| **English** | `en` | `en-US` | `en-US` |
| **Kannada (ಕನ್ನಡ)** | `kn` | `kn-IN` | `kn-IN` |
| **Hindi (हिन्दी)** | `hi` | `hi-IN` | `hi-IN` |
| **Telugu (తెలుగు)** | `te` | `te-IN` | `te-IN` |
| **Tamil (தமிழ்)** | `ta` | `ta-IN` | `ta-IN` |
| **Marathi (मराठी)** | `mr` | `mr-IN` | `mr-IN` |

### 🔐 Authentication & Security
- **Supabase SSR Auth**: Secure cookie-based authentication with automatic session refresh and token verification in Next.js middleware.
- **Row Level Security (RLS)**: Enforced across all 7 database tables ensuring complete tenant isolation (`auth.uid() = user_id`).
- **Sliding-Window Rate Limiter**: Server-side token bucket limiting requests to 30 requests/minute per authenticated user to prevent API abuse.
- **Input Validation & Sanitization**: Zod schema boundaries (max 4,000 characters, max 50 messages) and dangerous control character stripping.
- **Zero Secret Exposure**: All AI keys and Supabase service-role keys are strictly server-side and never bundled into client JavaScript.

---

## 🏗️ Architecture & How It Works

```
 USER SPEAKS
      │
      ▼
 Speech Recognition (Web Speech STT)
      │
      ▼
 Client State Machine (useVoicePipeline)
      │  HTTP POST /api/chat (SSE Stream)
      ▼
 AI Agent Backend
      ├── Security Guard (Rate Limiter & Input Bounds)
      ├── Memory Retriever (Injects Stored Context)
      └── Tool Intent Analyzer
              │
              ├── [Tool Required] ──► Execute Tool (AST Calc / Weather / Search / Reminders / Notes)
              │                              │
              ▼                              ▼
      AI Response Generation (Groq / OpenAI Streaming)
              │
              ▼
 Text-to-Speech (Web Speech TTS)
      │
      ▼
 VOICE RESPONSE
```

### Deterministic 7-State Voice Machine
The voice interface is governed by a unified deterministic state machine:

1. **`IDLE`**: Ready and waiting for user input.
2. **`LISTENING`**: Microphone active, analyzing live audio amplitude.
3. **`PROCESSING`**: Speech recognized, preparing conversational payload.
4. **`THINKING`**: Server-side AI model reasoning and memory retrieval.
5. **`TOOL_EXECUTION`**: Executing an agent tool (e.g. fetching weather or calculating AST).
6. **`SPEAKING`**: Synthesizing and streaming audio response through the speaker.
7. **`ERROR`**: Graceful error handling with masked user-friendly messages.

---

## 💻 Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript | Full-stack application architecture and reactive UI |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), Framer Motion, Lucide Icons | Responsive glassmorphic UI, animations, and icons |
| **Backend** | Next.js Serverless Edge / Node.js API Routes | Secure `/api/chat` streaming and `/auth/callback` handlers |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) | Persistent storage with Row Level Security (RLS) |
| **Authentication** | [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side/nextjs) | Cookie-based session sync, Email & OAuth auth |
| **AI Inference** | [Groq Cloud API](https://groq.com/) / [OpenAI API](https://openai.com/) | Low-latency LLM completions and tool reasoning |
| **Voice & Audio** | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), Web Audio API | In-browser speech transcription, amplitude analysis, and voice output |
| **External APIs** | [Open-Meteo REST API](https://open-meteo.com/) | Live public weather forecasts and geocoding |
| **Deployment** | [Vercel](https://vercel.com/) | Cloud serverless deployment with automated CI/CD |

---

## 📁 Project Structure

```text
VoiceAssistant/
├── app/                        # Next.js App Router routes and pages
│   ├── (auth)/                 # Login and signup authentication pages
│   ├── api/chat/               # Secure SSE streaming & agent tool execution endpoint
│   ├── app/                    # Protected main voice assistant workspace
│   ├── auth/                   # OAuth and signout callback route handlers
│   ├── globals.css             # Design tokens, color palettes, and scrollbars
│   └── layout.tsx              # Root layout and font configurations
├── components/                 # Reusable React components
│   ├── auth/                   # Login, signup forms, and OAuth buttons
│   ├── dashboard/              # Settings, Memory Hub, and DB Tester modals
│   ├── layout/                 # Navigation header and language selector
│   ├── sidebar/                # Desktop & mobile chronological conversation drawer
│   ├── ui/                     # Atomic UI components (Button, Modal, Dropdown, Avatar)
│   └── voice/                  # Glowing Voice Orb, audio visualizer, and status chips
├── hooks/                      # Custom React hooks
│   ├── use-voice-input.ts      # Web Speech STT and AudioContext analyzer
│   ├── use-ai-conversation.ts  # SSE streaming consumer and AbortController hook
│   ├── use-text-to-speech.ts   # Speech synthesis with instant interruption
│   └── use-voice-pipeline.ts   # Deterministic 7-state voice pipeline machine
├── lib/                        # Core business logic and server libraries
│   ├── ai/                     # Groq and OpenAI streaming provider adapters
│   ├── env.ts                  # Safe Zod-validated environment variable loader
│   ├── i18n/                   # Multilingual dictionaries and BCP-47 speech codes
│   ├── memory/                 # Long-term memory heuristic extractor and retriever
│   ├── security/               # Rate limiter, input validator, and error sanitizer
│   └── tools/                  # Calculator, Weather, Search, Reminders, Notes
├── services/                   # Frontend service abstractions (Auth, Settings, Memory)
├── supabase/                   # Supabase clients (browser, SSR server, middleware) and schema.sql
├── types/                      # TypeScript definitions (database, voice, ai, auth)
├── utils/                      # Title generator, date grouping, and error formatters
└── scripts/                    # Automated testing harness and live QA scripts
```

---

## 🗄️ Database

The database is built on Supabase PostgreSQL with **Row Level Security (RLS)** active on every table:

```
auth.users (Supabase Managed)
    │
    ├── 1:1 ──► public.profiles (User profile information)
    ├── 1:1 ──► public.user_settings (Voice, speed, theme, language preferences)
    │
    ├── 1:N ──► public.conversations (Chat sessions & titles)
    │                │
    │                └── 1:N ──► public.messages (Chat messages & tool outputs)
    │
    ├── 1:N ──► public.memories (Extracted long-term user facts)
    ├── 1:N ──► public.reminders (Scheduled tasks and alerts)
    └── 1:N ──► public.tool_executions (Audit log of agent tool calls)
```

### Table Overview:
1. **`profiles`**: User metadata, full name, and avatar URL linked to `auth.users`.
2. **`conversations`**: Conversation threads with ownership checks and automatic timestamp updates.
3. **`messages`**: Multi-turn dialogue history (`user`, `assistant`, `system`, `tool`) with JSONB metadata.
4. **`memories`**: Extracted persistent user facts with importance weights (1–5) and categories.
5. **`reminders`**: User-scheduled reminders with timestamps, timezone, and completion status.
6. **`tool_executions`**: Structured audit log tracking tool name, parameters, execution output, and status.
7. **`user_settings`**: User preferences for voice selection, playback rate, auto-play, theme, and language.

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ------------------------------------------------------------------------------
# AI Provider Configuration (Groq / OpenAI)
# ------------------------------------------------------------------------------
GROQ_API_KEY=gsk_your_groq_api_key_here
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-120b

# Optional: Supabase Service Role Key (Server-Only administrative tasks)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## ⚡ Supabase Setup

1. Create a free project on **[supabase.com](https://supabase.com)** (or [database.new](https://database.new)).
2. Navigate to **Project Settings > API** to copy your **Project URL** and **`anon` public key** into `.env.local`.
3. Open the **SQL Editor** in your Supabase Dashboard.
4. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql), paste it into the editor, and click **Run**.
5. Go to **Authentication > URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your live production domain).
   - Add Redirect URLs:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/callback`

---

## 🏃 Run Locally

Start the Next.js development server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (Google Chrome or Microsoft Edge recommended for full Web Speech API capabilities).

---

## 🧪 Testing & Verification

The repository includes a comprehensive automated test harness covering all 7 core domains:

```bash
# Run the complete test suite
npx tsx scripts/verify-all.ts

# Run strict TypeScript typechecking
npm run typecheck

# Run ESLint validation
npm run lint

# Verify optimized production build
npm run build
```

---

## 🔒 Security

- **Secret Protection**: AI API keys and database service keys are strictly isolated to server-side code (`lib/env.ts` / server routes) and never sent to client browsers.
- **Row Level Security**: All database tables enforce RLS policies restricting read, insert, update, and delete access strictly to the owner (`auth.uid() = user_id`).
- **Sliding-Window Rate Limiting**: Enforces a strict 30 requests/minute ceiling per user on `/api/chat` with `HTTP 429 Too Many Requests` responses.
- **Input Sanitization**: Strips dangerous ASCII and Unicode control characters while safely preserving valid whitespace, newlines, and tabs.
- **Sanitized Error Masking**: Internal server errors and database stack traces are sanitized before sending responses to the client.

---

## 📱 Responsive Design

Aura is built with a responsive mobile-first layout:
- **Desktop**: Full multi-column view with collapsible chronological conversation sidebar, interactive voice stage, and tool execution feedback.
- **Tablet & Mobile**: Smooth sliding drawer sidebar navigation, touch-friendly voice interaction button, and horizontal overflow protection for all screen sizes.

---

## 🚀 Deployment

The project is optimized for deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the repository into **[Vercel](https://vercel.com/new)**.
3. In the Vercel Project Settings, add the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `GROQ_API_KEY`
   - `AI_BASE_URL`
   - `AI_MODEL`
4. Click **Deploy**.
5. Update your **Supabase Dashboard > Authentication > URL Configuration** with your live Vercel domain (e.g., `https://auravoice-voicesssistant.vercel.app`).

---

## 📊 Production Verification

The project has undergone rigorous automated testing and production validation:

| Verification Domain | Status | Verification Method |
| :--- | :--- | :--- |
| **Automated Test Suite** | ✅ 25 / 25 Passed | Automated test harness (`scripts/verify-all.ts`) |
| **TypeScript Type Checking** | ✅ 0 Errors | Compiler validation (`tsc --noEmit`) |
| **ESLint Code Quality** | ✅ 0 Warnings / Errors | Next.js Linter (`next lint`) |
| **Production Build** | ✅ 10 / 10 Routes Compiled | Production bundle compiler (`next build`) |
| **Supabase SSR Auth** | ✅ Verified | Middleware cookie session refresh & token checks |
| **Voice Pipeline State Machine** | ✅ Verified | Deterministic 7-state audio-reactive lifecycle |
| **AI Token Streaming** | ✅ Verified | Server-Sent Events (SSE) with `AbortController` |
| **Agent Tool Execution** | ✅ Verified | Zod-validated Calculator, Weather, Search, Reminders, Notes |
| **Persistent Memory Hub** | ✅ Verified | Heuristic extraction and system prompt injection |
| **Multilingual i18n** | ✅ Verified | 6 languages (en, kn, hi, te, ta, mr) across STT/TTS |
| **Security & Rate Limiting** | ✅ Verified | 30 req/min sliding-window token limiter & input bounds |

---

## 🌟 Project Highlights

- **Full-Stack Voice Architecture**: Seamless bridge between in-browser Web Speech APIs, real-time Web Audio analyzer, and serverless AI streaming.
- **Multi-Agent Tool System**: Intelligent tool selection and execution with safe AST mathematical parsing and live REST integration.
- **Self-Evolving Long-Term Memory**: Automatic context distillation that learns user preferences over time.
- **Regional Indian Language Support**: Native voice synthesis and recognition for Kannada, Hindi, Telugu, Tamil, and Marathi.
- **Enterprise-Grade Hardening**: Complete database isolation with PostgreSQL RLS, input bounds, and sliding-window rate limiting.

---

## 🔮 Future Improvements

- [ ] Calendar integration (Google Calendar / Outlook) for automated meeting scheduling.
- [ ] Email integration for voice-dictated drafts and inbox summarization.
- [ ] Vector semantic search with pgvector for advanced semantic memory recall.
- [ ] Custom wake-word engine (e.g., *"Hey Aura"*) using local WebAssembly models.
- [ ] Integration with specialized voice providers (ElevenLabs, Deepgram).
- [ ] Native mobile companion app using React Native / Expo.

---

## 👤 Author

**Sharan**
- GitHub: [@Sharan126](https://github.com/Sharan126)
- Repository: [VoiceAssistant](https://github.com/Sharan126/VoiceAssistant)

---

## 📄 License

No license has been added yet.
