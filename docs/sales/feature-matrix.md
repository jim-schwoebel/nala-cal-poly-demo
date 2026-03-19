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
