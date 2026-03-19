# Nala

A voice-first AI assistant that runs entirely in your browser. Talk to Nala, and she talks back — no cloud APIs, no API keys, no data leaving your device.

Built with React, Express, PostgreSQL, [WebLLM](https://github.com/mlc-ai/web-llm) (browser-local LLM), and the Web Speech API.

## Features

- **Voice in, voice out** - Speak naturally, hear Nala respond aloud
- **Fully local AI** - LLM runs in your browser via WebGPU (no external API calls)
- **Conversation memory** - All chats persist in PostgreSQL across sessions
- **Animated avatar** - Lion character with lip-synced mouth animation while speaking
- **Auto-continue** - Conversation flows naturally; Nala listens again after responding
- **Say "stop"** - End a conversation hands-free with a voice command
- **Mobile responsive** - Works on desktop and mobile with adaptive layout
- **Guided onboarding** - Starter prompts help new users get started immediately

## Quick Start

The entire app runs with a single Docker command. You need [Docker](https://www.docker.com/products/docker-desktop/) installed.

```bash
git clone https://github.com/jim-schwoebel/nala-cal-poly-demo.git
cd nala-cal-poly-demo
docker compose up --build
```

Open **http://localhost:5173** in Chrome (113+ required for WebGPU).

On first load, the AI model downloads (~1-4 GB). It's cached in your browser after that.

## Architecture

```
Browser (React + Vite + TypeScript)
  ├── WebLLM         - Local LLM inference via WebGPU
  ├── Web Speech API  - Speech-to-text (mic input)
  ├── Kokoro TTS *    - Neural text-to-speech (optional)
  └── REST client     - Talks to Express API
        │
Express.js API Server (persistence only)
        │
PostgreSQL - Conversations + messages
```

*\* Kokoro TTS is opt-in via `VITE_TTS=kokoro`. Default uses the browser's built-in speech synthesis for lower latency.*

### Data Flow

1. You tap the mic and speak
2. Web Speech API converts your voice to text
3. Your message is saved to PostgreSQL
4. WebLLM generates a response locally in the browser
5. The response is saved to PostgreSQL
6. Nala speaks the response aloud (with lip-synced avatar)
7. The mic automatically re-activates for your next turn

## Project Structure

```
nala/
├── client/               # React + Vite frontend
│   └── src/
│       ├── components/   # UI components (avatar, waveform, chat, etc.)
│       ├── hooks/        # Custom hooks (voice, LLM, conversations)
│       └── services/     # API client
├── server/               # Express.js backend
│   └── src/
│       ├── routes/       # REST API endpoints
│       └── db/           # PostgreSQL connection, queries, migrations
├── shared/               # Shared TypeScript types
├── docker-compose.yml    # Run everything with one command
└── CLAUDE.md             # AI coding assistant context
```

## Development

### With Docker (recommended)

```bash
docker compose up --build
```

Source files are volume-mounted — edit code and see changes instantly via hot reload.

| Service | URL | Purpose |
|---------|-----|---------|
| Client | http://localhost:5173 | React app (Vite dev server) |
| Server | http://localhost:3001 | Express API |
| Database | localhost:5432 | PostgreSQL |

### Without Docker

Prerequisites: Node.js 20+, PostgreSQL 14+

```bash
# Install dependencies
npm install

# Set up database
createdb nala
psql nala -f server/src/db/migrations/001-initial-schema.sql

# Start server (terminal 1)
cd server && npm run dev

# Start client (terminal 2)
cd client && npm run dev
```

### Running Tests

```bash
# Client tests (all 38 pass)
npm run test:client

# Server tests (requires PostgreSQL)
createdb nala_test
cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `VITE_TTS` | *(unset)* | Set to `kokoro` for neural TTS voice (higher quality, slower first load) |
| `DATABASE_URL` | `postgresql://localhost:5432/nala` | PostgreSQL connection string |
| `PORT` | `3001` | Express server port |
| `API_URL` | `http://localhost:3001` | Backend URL for Vite proxy (Docker sets this automatically) |

## Browser Requirements

- **Chrome 113+** (required for WebGPU)
- Microphone access (prompted on first use)
- ~2-4 GB free memory for the LLM model

Firefox and Safari do not yet support WebGPU and will not work.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite 5, TypeScript | UI framework |
| AI | WebLLM (Llama 3.1 8B) | Browser-local LLM |
| Speech Input | Web Speech API | Voice-to-text |
| Speech Output | Web Speech API / Kokoro TTS | Text-to-voice |
| Visualization | Canvas API | Animated waveform orb |
| Avatar | SVG + requestAnimationFrame | Lion with lip sync |
| Backend | Express.js, TypeScript | REST API (persistence only) |
| Database | PostgreSQL 16 | Conversation storage |
| DevOps | Docker Compose | One-command setup |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Quick version:
1. Fork the repo
2. Make your changes
3. Run tests: `npm run test:client`
4. Open a PR

Check [open issues](https://github.com/jim-schwoebel/nala-cal-poly-demo/issues) for ideas on what to work on.

## License

[Apache 2.0](LICENSE)
