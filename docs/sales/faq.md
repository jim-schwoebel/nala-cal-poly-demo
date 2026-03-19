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
