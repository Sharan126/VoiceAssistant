# 🎙️ Aura Voice 2.0 — Next-Generation Personal AI Agent

<div align="center">

> **A personal multimodal AI agent that can understand, remember, see, reason, plan, and take action.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq-LPU_Inference-F55036?style=for-the-badge)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-43%2F43_Passing-brightgreen?style=for-the-badge)]()

</div>

---

## 📖 Overview

**Aura Voice 2.0** is an upgraded personal multimodal AI agent built with **Next.js 14 App Router**, **React 18**, **TypeScript**, **Web Speech APIs**, **Supabase**, and multi-step agent tool planning.

Engineered with a deterministic **audio-reactive voice pipeline**, Aura combines live client-side speech recognition, MediaRecorder fallback, real-time audio amplitude visualization, multi-turn AI reasoning, automated agent tools, persistent long-term memory, multimodal image vision, file document Q&A, and full multilingual speech support across 6 Indian regional languages.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [Voice & Continuous Mode](#-voice--continuous-mode)
  - [Agent Mode & Multi-Step Tools](#-agent-mode--multi-step-tools)
  - [Universal Clean Response System](#-universal-clean-response-system)
  - [Multimodal Vision & Ask My Files](#-multimodal-vision--ask-my-files)
  - [Long-Term Memory](#-long-term-memory)
  - [Multilingual Support](#-multilingual-support)
- [Architecture & Flow](#-architecture--flow)
- [Tech Stack](#-tech-stack)
- [Testing & Quality Assurance](#-testing--verification)
- [Author & License](#-author)

---

## ✨ Key Features

### 🎤 Voice & Continuous Mode
* **In-Browser Speech-to-Text (STT)**: Direct client-side speech transcription powered by Web Speech API (`SpeechRecognition`) with MediaRecorder + `/api/stt` server fallback for mobile Chrome stability.
* **Continuous Conversation Mode**: Toggleable hands-free automatic turn-taking mode (`User speaks` &rarr; `Aura responds` &rarr; `Aura speaks` &rarr; `Auto re-listens for next turn`).
* **Audio Reactivity**: Integrated `AudioContext` decibel analyzer pulses the glowing 3D Voice Orb in real time.
* **Instant Zero-Latency Interruption**: Clicking the orb or microphone during active assistant speech immediately executes `speechSynthesis.cancel()` for natural conversational turn-taking.

### 🤖 Agent Mode & Multi-Step Tools
* **Multi-Step Goal Planner**: Converts complex goals (e.g. *"Plan a trip to Bangalore for this weekend and set reminders"*) into discrete plan steps.
* **Plan + Action Progress UI**: Displays high-level step progress (`Understanding request` &rarr; `Checking weather` &rarr; `Searching options` &rarr; `Building plan` &rarr; `Done`) without exposing raw hidden chain-of-thought.
* **Action Confirmation System**: High-impact tools require explicit user consent (`Confirm` / `Cancel`) before execution.
* **Custom Skills Registry**: Modular skill definitions wrapping Calculator, Weather, Web Search, Reminders, Notes, Vision, and File retrieval.

### 🎨 Universal Clean Response System
* **RichTextRenderer**: Universal response parser rendering paragraphs, semantic headings (`<h1>`, `<h2>`, `<h3>`), lists, responsive tables (`<table className="overflow-x-auto">`), blockquote callout cards (Tip 💡, Important 📌, Warning ⚠️, Result ✅), and syntax-highlighted code blocks with 1-click copy.
* **Zero Visible Markdown Syntax**: Never exposes raw formatting symbols (`**`, `###`, `|`, ```` ````, `>`) to end users.
* **Streaming Resilience**: Incomplete streaming chunks render smoothly without dangling asterisks or broken tags.

### 📷 Multimodal Vision & 📄 Ask My Files
* **Vision Mode (`📷 Show Aura`)**: Image upload and camera capture route (`/api/vision`) for AI visual analysis.
* **Ask My Files (`📄 Ask My Files`)**: Dedicated document management page (`/files`) for PDF, TXT, and DOCX text extraction and document Q&A.

### 🧠 Long-Term Memory
* **Automatic Fact Extraction**: Heuristic extraction engine analyzes conversational inputs to identify work roles, learning goals, and user preferences.
* **Context Injection**: Stored facts are injected into future conversational contexts under `[USER_LONG_TERM_MEMORIES]`.
* **Memory Hub**: Complete management dashboard allowing users to view, search, and delete stored memories.

### 🇮🇳 Multilingual Support
Native voice transcription, AI generation, and speech synthesis localized across 6 Indian regional languages:

| Language | Code | BCP-47 Speech Code |
| :--- | :--- | :--- |
| **English** | `en` | `en-US` |
| **Kannada (ಕನ್ನಡ)** | `kn` | `kn-IN` |
| **Hindi (हिन्दी)** | `hi` | `hi-IN` |
| **Telugu (తెలుగు)** | `te` | `te-IN` |
| **Tamil (தமிழ்)** | `ta` | `ta-IN` |
| **Marathi (मराठी)** | `mr` | `mr-IN` |

---

## 🏗️ Architecture & Flow

```text
                AURA VOICE 2.0
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
      HEAR         SEE          READ
       │            │            │
       └────────────┼────────────┘
                    ↓
                UNDERSTAND
                    ↓
                  THINK
                    ↓
           PLAN + USE TOOLS
                    ↓
                  ACT
                    ↓
              REMEMBER
                    ↓
                 RESPOND
```

---

## 🧪 Testing & Verification

Run the automated test suite and production verification checks:

```bash
# 1. Run the comprehensive automated test suite (43 test cases across 11 domains)
npx tsx scripts/verify-all.ts

# 2. Strict TypeScript typechecking
npm run typecheck

# 3. ESLint verification
npm run lint

# 4. Production build verification
npm run build
```

---

## 📊 Production Verification Status

| Check | Result | Verification Method |
| :--- | :--- | :--- |
| **Automated Test Suite** | ✅ 43 / 43 Passed | Automated test harness (`scripts/verify-all.ts`) |
| **TypeScript Compiler** | ✅ 0 Errors | Static typecheck (`tsc --noEmit`) |
| **ESLint Quality Check** | ✅ 0 Warnings / Errors | Next.js Linter (`next lint`) |
| **Production Build** | ✅ 14 / 14 Routes Compiled | Next.js Build (`next build`) |
| **Continuous Conversation** | ✅ Verified | Hands-free turn-taking with auto-listen timeout |
| **Universal Clean Renderer** | ✅ Verified | RichTextRenderer with code blocks, tables, callouts |
| **Agent Execution Engine** | ✅ Verified | Multi-step goal planner & Plan + Action progress UI |
| **Action Confirmation** | ✅ Verified | ActionConfirmationModal authorization dialog |
| **Multimodal Vision & Files** | ✅ Verified | Vision API route (`/api/vision`) & Ask My Files (`/files`) |

---

## 👤 Author & License

**Sharan**
- GitHub: [@Sharan126](https://github.com/Sharan126)
- Repository: [VoiceAssistant](https://github.com/Sharan126/VoiceAssistant)

Licensed under the **MIT License**.
