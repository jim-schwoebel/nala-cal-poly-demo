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
