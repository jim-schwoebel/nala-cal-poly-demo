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
