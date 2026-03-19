# Nala Sales & Marketing Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create six marketing documents in `docs/sales/` that convert tech enthusiasts into Nala users via a hosted demo landing page.

**Architecture:** Six standalone markdown files, each serving a specific point in the marketing funnel. All copy follows the brand voice defined in the spec (playful, quirky, technically credible). No code changes — documentation only.

**Tech Stack:** Markdown

**Spec:** `docs/superpowers/specs/2026-03-19-nala-sales-docs-design.md`

**Brand reference:** All docs must use these messaging pillars:
- **Local-first AI** — "Your GPU, your rules"
- **Zero dependencies** — "No accounts. No subscriptions. No kidding."
- **Cutting-edge tech** — "The future shipped early"

**Tone:** Playful, quirky, slightly cheeky. Like a clever cat who happens to be an AI. Technically credible but never dry. Honest about limitations.

---

### Task 1: Create `docs/sales/` directory and `landing-page-copy.md`

**Files:**
- Create: `docs/sales/landing-page-copy.md`

- [ ] **Step 1: Create the document**

Write website-ready marketing copy with these sections:

```markdown
# Landing Page Copy

**Purpose:** Drop-in copy for Nala's marketing website. Each section maps to a page block.

---

## Hero

**Headline:** Talk to Your Browser. It Talks Back.

**Subheadline:** Nala is a voice assistant that runs entirely in your browser — powered by your GPU, not someone else's cloud. No accounts. No API keys. No kidding.

**CTA Button:** Try Nala Free →

---

## How It Works

### 1. Open a Tab
No downloads. No installs. No "create an account" speed bumps. Just open Nala in Chrome and you're in.

### 2. Start Talking
Click the mic and say whatever's on your mind. Nala listens using your browser's built-in speech recognition — no audio ever leaves your machine.

### 3. Nala Responds
A real LLM running on your GPU thinks it over and talks back. Your conversations are saved so you can pick up where you left off. It's like the future, but it shipped early.

---

## Feature Highlights

### 🧠 Your GPU, Your Rules
Nala runs a full language model directly in your browser via WebGPU. No cloud. No API calls. No per-message fees. Your hardware, your horsepower.

### 🔇 Actually Private
Most "private" assistants still phone home. Nala doesn't. Voice recognition, AI inference, and text-to-speech all happen locally. The only thing that hits a server is saving your conversation history — to YOUR database.

### ⚡ Zero Friction Setup
No API keys to hunt down. No accounts to create. No subscriptions to forget to cancel. Open a tab and start talking. That's the whole onboarding flow.

### 🎙️ Voice-First, Not Voice-Bolted-On
Nala was built for voice from day one — not a chat window with a mic button taped on. Live waveform visualization, automatic speech recognition, and natural text-to-speech built into every interaction.

### 🔧 Bleeding-Edge Stack
WebGPU + WebLLM + Web Speech API. Three browser technologies that most people haven't heard of, stacked together into something that actually works. This is what the browser was built for.

---

## Social Proof

> _[Placeholder: Add user testimonials, GitHub stars count, or usage stats here once available]_

---

## Final CTA

### Ready to Talk?

Nala is free, private, and runs in your browser right now. No sign-up required — just a modern GPU and a sense of curiosity.

**[Try Nala Now →]**

_Requires Chrome 113+ with WebGPU support._
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales/landing-page-copy.md
git commit -m "docs: add landing page marketing copy"
```

---

### Task 2: Create `one-pager.md`

**Files:**
- Create: `docs/sales/one-pager.md`

- [ ] **Step 1: Create the document**

Write a concise, shareable product overview for dev communities:

```markdown
# Nala — One-Pager

**Purpose:** Shareable product overview for Hacker News, Reddit, Discord, and dev communities. Copy-paste ready.

---

## What Is Nala?

Nala is a voice assistant that runs entirely in your browser. A real LLM runs on your GPU via WebGPU — no cloud, no API keys, no cost per message. You talk, Nala thinks, Nala talks back.

## How Does It Work?

Open Nala in Chrome. Click the mic. Talk.

Under the hood: **WebLLM** loads an open-source language model directly into your browser using **WebGPU** acceleration. **Web Speech API** handles voice input (SpeechRecognition) and voice output (SpeechSynthesis). A lightweight Express.js backend stores your conversation history in PostgreSQL so you can pick up where you left off.

All AI inference happens in your browser tab. The server is a dumb persistence layer — it has no idea what you're talking about.

## Why Does It Matter?

- **Private by architecture, not by policy.** Your voice and prompts never leave your machine. There's no "trust us" — there's literally no cloud endpoint to send data to.
- **Zero ongoing costs.** No API metering. No subscription tiers. Your GPU does the work for free.
- **No setup friction.** No accounts. No OAuth flows. No API key scavenger hunts. Open a tab.
- **Bleeding-edge browser tech.** WebGPU is what happens when browsers grow up. Nala is one of the first real consumer apps built on it.

## Try It

**[→ Try Nala in your browser]**

Requires Chrome 113+ with WebGPU. Works best with a dedicated GPU (but integrated graphics work too — just slower).

---

_Nala is open source. [GitHub →]_
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales/one-pager.md
git commit -m "docs: add one-pager product overview"
```

---

### Task 3: Create `user-segments.md`

**Files:**
- Create: `docs/sales/user-segments.md`

- [ ] **Step 1: Create the document**

Write the persona deep-dive for the primary segment:

```markdown
# User Segments

**Purpose:** Persona profiles with tailored messaging hooks. Start with the primary segment; add more as Nala grows.

---

## Segment 1: Tech Enthusiasts & Early Adopters

### Who They Are

Developers, tinkerers, and power users who actively seek out new technology. They read Hacker News over breakfast, have opinions about WebAssembly, and have at least one Raspberry Pi doing something unnecessary. They're the people who tried Linux on a laptop in 2006 and told everyone about it.

**Age range:** 22–40
**Platforms:** Hacker News, Reddit (r/webdev, r/LocalLLaMA, r/SideProject), Twitter/X tech circles, Discord dev servers, Product Hunt
**Devices:** High-spec laptops or desktops, often with dedicated GPUs. Chrome users (by choice, not default).

### What They Care About

- **Novelty** — they want to use things before everyone else
- **Technical elegance** — they appreciate clever engineering and clean architecture
- **Self-sovereignty** — they prefer tools they control over tools that control them
- **Open source** — they value transparency and the ability to inspect/modify
- **No vendor lock-in** — they've been burned by platforms that enshittified

### Pain Points with Current Voice Assistants

| Pain Point | Detail |
|------------|--------|
| **Cloud dependency** | Siri, Alexa, and Google Assistant send everything to the cloud. These users know what that means for privacy and latency. |
| **Walled gardens** | Can't customize, can't self-host, can't inspect what the model is doing. |
| **Subscription fatigue** | ChatGPT Plus, Copilot Pro — another $20/month for another AI tool. |
| **Vendor lock-in** | Your conversation history lives in someone else's database. Good luck exporting it. |
| **Boring** | Current assistants have the personality of a corporate FAQ page. |

### Messaging Hooks

These are the angles that make this audience lean in:

1. **"Runs on YOUR GPU"** — They understand what this means technically and philosophically. Local inference = real privacy, not privacy theater.
2. **"WebGPU is here and it's wild"** — They want to see what WebGPU can actually do. Nala is a compelling demo of the future.
3. **"No API keys, no accounts"** — The anti-friction message. They've set up too many API keys this month.
4. **"View source or it didn't happen"** — Open source credibility. They can read the code and verify every privacy claim.
5. **"Built with [cool tech stack]"** — WebGPU + WebLLM + Web Speech API is a novel combination. They want to see how it's wired together.

### Likely Objections

| Objection | Response |
|-----------|----------|
| "The model quality can't be as good as GPT-4" | It's not — and we don't pretend it is. But it runs in your browser tab for free, forever. For many conversations, a capable local model is more than enough. |
| "My GPU probably can't handle it" | If you have a GPU from the last ~3 years, you're likely fine. Integrated graphics work too — just slower. The model downloads once and caches in IndexedDB. |
| "Web Speech API recognition isn't great" | It's surprisingly decent for English in quiet environments. It's also free and instant. No Whisper server to set up. |
| "Why not just use Ollama?" | Ollama is great — for terminal users who want to run models locally. Nala gives you a voice interface on top of browser-local inference. Different tool, complementary use case. |
| "Is this just a tech demo?" | It persists conversations, has a real UI, and works out of the box. It's an MVP, not a proof of concept. |
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales/user-segments.md
git commit -m "docs: add user segments and persona profiles"
```

---

### Task 4: Create `feature-matrix.md`

**Files:**
- Create: `docs/sales/feature-matrix.md`

- [ ] **Step 1: Create the document**

Write the competitive comparison table:

```markdown
# Feature Matrix — Nala vs. The Field

**Purpose:** Competitive comparison that makes Nala's strengths visible while staying honest about trade-offs. Credibility > spin.

---

## At a Glance

| Feature | Nala | Siri | Alexa | Google Assistant | ChatGPT Voice |
|---------|------|------|-------|------------------|---------------|
| **Runs in browser** | Yes | No | No | No | Yes (web app) |
| **On-device inference** | Yes (WebGPU) | Partial (some on-device) | No | Partial | No |
| **Voice input** | Yes | Yes | Yes | Yes | Yes |
| **Voice output** | Yes | Yes | Yes | Yes | Yes |
| **No account required** | Yes | Apple ID | Amazon account | Google account | OpenAI account |
| **No API keys** | Yes | N/A | N/A | N/A | N/A |
| **Free (no subscription)** | Yes | Yes (with Apple device) | Free tier + paid | Free tier + paid | Free tier, $20/mo for Plus |
| **No data sent to cloud** | Yes* | No | No | No | No |
| **Open source** | Yes | No | No | No | No |
| **Conversation history** | Yes | Limited | Limited | Yes | Yes |
| **Custom model support** | Future | No | No | No | No |
| **Smart home control** | No | Yes | Yes | Yes | No |
| **Mobile app** | No (browser only) | Yes | Yes | Yes | Yes |
| **Model quality (2026)** | Good (local open-source) | Good | Basic | Good | Best (GPT-4+) |
| **Ecosystem integrations** | None | Apple ecosystem | Amazon ecosystem | Google ecosystem | Plugins/GPTs |
| **Offline capable** | Partial** | Partial | No | No | No |
| **Setup time** | ~30 seconds | Pre-installed | App install | Pre-installed | Account creation |

_*Conversation history is persisted to a PostgreSQL server. Voice data and AI inference stay entirely in the browser._

_**AI inference and voice work without internet after model is cached. Conversation persistence requires server connectivity._

---

## Where Nala Wins

- **Privacy**: Not a policy you hope they follow — an architecture that makes surveillance impossible.
- **Cost**: Free forever. Your GPU, your electricity, your problem (in a good way).
- **Friction**: No account, no API key, no app install. Open a tab.
- **Transparency**: Open source. Read the code. Verify every claim.

## Where Nala Doesn't (Yet)

- **Model quality**: Local open-source models are good and getting better fast, but GPT-4 is still the benchmark. Nala trades peak quality for privacy and independence.
- **Ecosystem**: No smart home, no calendar integration, no "Hey Nala, order paper towels." It's a conversational assistant, not a home automation hub.
- **Mobile**: Browser-only for now. WebGPU support on mobile is coming but not yet reliable.
- **Always-on**: You need to have the tab open. No wake-word detection in the background.
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales/feature-matrix.md
git commit -m "docs: add competitive feature matrix"
```

---

### Task 5: Create `faq.md`

**Files:**
- Create: `docs/sales/faq.md`

- [ ] **Step 1: Create the document**

Write the objection-handling FAQ:

```markdown
# Frequently Asked Questions

**Purpose:** Objection-handling disguised as friendly Q&A. Honest, playful, no corporate deflection.

---

### Do I need a beefy GPU to run this?

Not especially. If your computer can play a modern video game at medium settings, it can run Nala. A dedicated GPU from the last ~3 years is ideal, but integrated graphics (like Intel Iris or Apple Silicon) will work — just expect slower responses. The model downloads once (~1-4 GB depending on which one) and caches in your browser, so subsequent visits are faster.

### What browsers does Nala support?

Chrome 113 or later. That's it for now. WebGPU is the enabling technology, and Chrome has the most mature implementation. Edge (Chromium-based) may work too. Firefox and Safari have WebGPU in development but aren't reliable yet. We'd love to support them when they catch up.

### How private is it, really?

Architecturally private. Not "we promise we won't look" private — "there is literally nowhere for your data to go" private. Here's what stays in your browser:
- Your voice (captured and processed by Web Speech API locally)
- Your prompts (fed to the LLM running on your GPU)
- The AI's responses (generated on your GPU)

The only thing that touches a server is conversation persistence — saving your chat history to a PostgreSQL database so you can come back to it. That server is part of Nala's stack, not a third-party service.

### Is it as good as ChatGPT?

No. Let's be honest: GPT-4 is the best general-purpose language model available, and it runs on massive cloud infrastructure. Nala runs a capable open-source model on your browser tab. For casual conversation, brainstorming, quick questions, and general chat, Nala holds its own. For complex reasoning, coding tasks, or domain expertise, GPT-4 has the edge. The trade-off is: Nala is free, private, and doesn't require an account.

### What model does Nala actually run?

Nala uses WebLLM to load open-source language models (like Llama, Phi, or Gemma variants) directly into your browser via WebGPU. The specific model can change as better ones become available. Think of it as "the best open-source model that fits in your GPU's memory."

### Can I use it on my phone?

Not yet, practically speaking. WebGPU on mobile browsers is still experimental and the GPU memory available on phones is limited. Nala is a desktop/laptop experience for now. When mobile WebGPU matures, we'll be ready.

### Does it work offline?

Partially. After the model downloads and caches (first visit), the AI inference and voice I/O work without an internet connection. However, conversation history is stored in a PostgreSQL database via the server, so saving and loading past conversations requires connectivity. If you go offline mid-conversation, you can keep talking — you just can't persist the history until you reconnect.

### How long does the first-time setup take?

About 30 seconds of your attention, plus a few minutes of waiting. You open the page, the model downloads in the background (1-4 GB, cached after the first time), and then you're in. No accounts. No forms. No "verify your email."

### Why not just use Ollama?

Great question! Ollama is excellent for running models locally via the command line. Nala is different in a few ways: it runs in the browser (no install), it has a voice interface (not just text), and it includes conversation persistence. If you love Ollama, you'd probably like Nala too — they're complementary, not competitive.

### Is this actually useful or just a tech demo?

It's an MVP — a real, usable voice assistant with conversation persistence, a polished UI, and a voice-first interaction model. It's not trying to replace Alexa's smart home control or Siri's deep OS integration. It's a conversational AI that you can talk to in your browser, for free, without giving up your data. Whether that's useful depends on what you're looking for.

### Can I self-host the whole thing?

Yes. Nala is open source. The backend is a simple Express.js server with PostgreSQL. Clone the repo, run the server, open the client. You own everything.

### What happens to my conversations?

They're stored in a PostgreSQL database that you control. Nothing is sent to any third party. If you delete a conversation, it's gone — CASCADE delete, no soft-delete graveyard. Your data lifecycle is simple: you create it, you keep it, you delete it.
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales/faq.md
git commit -m "docs: add sales FAQ with objection handling"
```

---

### Task 6: Create `social-copy.md`

**Files:**
- Create: `docs/sales/social-copy.md`

- [ ] **Step 1: Create the document**

Write platform-specific launch copy:

```markdown
# Social Copy — Launch Kit

**Purpose:** Ready-to-post copy for launch channels. Each section is tailored to the platform's culture, norms, and character limits.

---

## Product Hunt

**Tagline (60 chars max):**
> Talk to your browser. It talks back. (38 chars)

**Description:**
Nala is a voice assistant that runs entirely in your browser. No cloud. No API keys. No accounts.

A real language model runs on your GPU via WebGPU, voice input and output use the Web Speech API, and your conversations persist in PostgreSQL. Every bit of AI inference happens in your browser tab — the server is just a dumb persistence layer.

Built for people who think the browser is an underrated runtime and local-first isn't just a buzzword.

**First Comment (Maker's Comment):**
Hey Product Hunt! 👋

I built Nala because I wanted a voice assistant I could actually trust — one where "private" means "your data physically cannot leave your machine," not "please read our 47-page privacy policy."

The whole thing runs in a browser tab. WebGPU handles LLM inference, Web Speech API handles voice I/O, and a simple Express/PostgreSQL backend saves your conversations. That's it. No accounts, no API keys, no cloud inference.

It's an MVP — there are things it can't do (no smart home, no mobile yet, model quality won't match GPT-4). But it's free, it's private, and you can read every line of code.

Would love your feedback on what to build next! 🐱

---

## Hacker News

**Title:**
> Show HN: Nala – Voice assistant that runs entirely in your browser via WebGPU

**Post Body:**
I built a voice assistant that runs a local LLM in the browser using WebGPU (via WebLLM). Voice input uses SpeechRecognition, voice output uses SpeechSynthesis — all browser-native APIs. Conversations persist in PostgreSQL via a minimal Express.js backend.

The server has no AI logic. It stores and retrieves conversations. That's it. All inference happens on the client's GPU.

Stack: React + Vite + TypeScript, WebLLM (MLCEngine), Web Speech API, Express.js, PostgreSQL.

Trade-offs I chose:
- Local model quality vs. GPT-4: you lose some capability, you gain actual privacy and zero cost
- Web Speech API vs. Whisper: worse recognition, but zero setup and no additional model download
- No streaming to UI: TTS needs the complete text, so responses render all at once

Requires Chrome 113+ with WebGPU. Works best with a dedicated GPU but integrated graphics are functional.

Try it: [link]
Source: [GitHub link]

---

## Twitter/X

**Variant 1 — Announcement (224 chars):**
> I built a voice assistant that runs entirely in your browser.
>
> No cloud. No API keys. No account.
>
> A real LLM on your GPU via WebGPU. Voice in, voice out. Conversations saved.
>
> Meet Nala 🐱
>
> [link]

**Variant 2 — Technical (248 chars):**
> WebGPU + WebLLM + Web Speech API =
>
> A voice assistant running a local LLM in a browser tab.
>
> No cloud inference. No API keys. Voice I/O via native browser APIs. Conversations persist in PostgreSQL.
>
> The browser is an underrated runtime.
>
> [link]

**Variant 3 — Provocative (196 chars):**
> Your voice assistant sends everything you say to the cloud.
>
> Mine runs a language model on your GPU inside a browser tab.
>
> No accounts. No subscriptions. No data leaves your machine.
>
> [link]

**Variant 4 — Casual (187 chars):**
> me: what if a voice assistant just... ran in your browser?
>
> also me: *builds one*
>
> Nala: local LLM via WebGPU, voice via Web Speech API, zero cloud, zero cost.
>
> 🐱 [link]

---

## Reddit

### r/webdev

**Title:** I built a voice assistant that runs entirely in the browser using WebGPU, Web Speech API, and WebLLM

**Body:**
Been working on Nala — a voice-first AI assistant where everything runs client-side in a Chrome tab.

**How it works:**
- **LLM inference**: WebLLM loads an open-source model into the browser via WebGPU. Your GPU does the thinking.
- **Voice input**: SpeechRecognition API — built into the browser, no third-party STT service
- **Voice output**: SpeechSynthesis API — same deal, all native
- **Persistence**: Express.js + PostgreSQL backend. It saves your conversations. That's literally all the server does.

**Why I built it this way:**
I wanted to see how far you could push browser-native APIs for a real consumer app. Turns out, pretty far. WebGPU is genuinely powerful for LLM inference, and the Web Speech APIs are surprisingly usable.

**Honest limitations:**
- Chrome 113+ only (WebGPU support)
- Model quality is good, not GPT-4 level
- Need a decent GPU (integrated works, just slower)
- No mobile yet (WebGPU on mobile isn't there)

Would love feedback from other web devs — especially on the WebGPU/WebLLM integration. Source is on GitHub.

[Demo link] | [GitHub link]

---

### r/LocalLLaMA

**Title:** Voice assistant with browser-local LLM inference via WebGPU — no Ollama, no Python, just a Chrome tab

**Body:**
Made a voice assistant called Nala that runs local LLM inference directly in the browser using WebLLM + WebGPU. No server-side inference, no Python environment, no Ollama — just open a tab in Chrome.

**Stack:**
- WebLLM (MLCEngine) for in-browser inference via WebGPU
- Web Speech API for voice I/O (no Whisper dependency)
- Express + PostgreSQL for conversation persistence (server does zero inference)

It loads the model into browser memory once, caches it in IndexedDB, and subsequent visits skip the download. Voice recognition and TTS are all browser-native.

**What I'm curious about:**
- Anyone else experimenting with WebGPU for local inference?
- Model recommendations that work well within browser memory constraints?

[Demo link] | [GitHub link]

---

### r/SideProject

**Title:** Nala — a free, private voice assistant that runs in your browser 🐱

**Body:**
Just shipped Nala, a voice assistant where everything runs locally in your browser:

🎙️ Talk to it — speech recognition via Web Speech API
🧠 It thinks — LLM runs on your GPU via WebGPU
🔊 It talks back — text-to-speech via SpeechSynthesis
💾 Conversations saved in PostgreSQL

**No accounts. No API keys. No cloud AI. Free forever.**

It's an MVP — not trying to compete with Siri on smart home stuff. It's a conversational AI that happens to be completely private because all inference runs client-side.

Built with React, Vite, TypeScript, Express.js, WebLLM.

Would love feedback! What features would make you actually use this daily?

[Try it →] | [Source →]
```

- [ ] **Step 2: Commit**

```bash
git add docs/sales/social-copy.md
git commit -m "docs: add social copy launch kit"
```
