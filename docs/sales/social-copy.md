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
