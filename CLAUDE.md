# Nala — Voice Assistant Web App

## WHAT

Nala is a voice-first conversational AI web app. Users speak into their mic, a local LLM running in the browser via WebLLM (WebGPU) generates responses, and the browser speaks them aloud via SpeechSynthesis. All conversations persist in PostgreSQL. No external API dependencies.

### Architecture

```
Browser (React + Vite + TS)
  ├── WebLLM (MLCEngine) — local LLM inference via WebGPU
  ├── Web Speech API (SpeechRecognition for input, SpeechSynthesis for output)
  ├── Voice waveform visualization (canvas-based)
  └── REST client
        │
        ▼
Express.js API Server (TypeScript) — persistence only
  ├── POST  /api/conversations — create conversation
  ├── GET   /api/conversations — list conversations
  ├── GET   /api/conversations/:id — get conversation with messages
  ├── PATCH /api/conversations/:id — update title
  ├── DELETE /api/conversations/:id — delete conversation
  └── POST  /api/conversations/:id/messages — persist a single message
        │
        └── PostgreSQL — conversation and message persistence
```

### Data Model

- **users**: id (uuid), name, created_at
- **conversations**: id (uuid), user_id (fk), title, created_at, updated_at
- **messages**: id (uuid), conversation_id (fk), role (user|assistant), content (text), created_at

## WHY

- **WebLLM** over Claude API: no external API coupling, no API keys, no per-request costs, fully self-contained. Requires WebGPU (Chrome 113+).
- **Web Speech API** over third-party STT/TTS: zero cost, no API keys, works in modern browsers, good enough quality for MVP.
- **PostgreSQL** over SQLite/file storage: proper relational model for conversations + messages, scales if needed.
- **REST over WebSocket**: simpler to implement and debug. Voice and AI run entirely in the browser, so the server only handles persistence.
- **Vite** over CRA/Next: fast dev server, simple config, no SSR needed for a SPA.
- **Users table but no auth**: schema is multi-user ready (conversations have user_id FK), hardcoded default user for now.
- **Backend as pure persistence layer**: all AI inference happens client-side. Server stores and retrieves data only.

## HOW

### Coding Standards

- TypeScript strict mode everywhere (`"strict": true`)
- ESLint + Prettier for formatting
- Functional React components with hooks only — no class components
- Named exports over default exports
- Use `async/await` over `.then()` chains
- Error handling: try/catch in async functions, error boundaries in React

### Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` (e.g., `Waveform`, `ConversationList`)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/interfaces: `PascalCase`, no `I` prefix
- Database columns: `snake_case`
- API routes: `kebab-case` (e.g., `/api/conversations`)

### File Structure

```
nala/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks (useVoiceInput, useWebLLM, etc.)
│   │   ├── services/        # API client functions
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                  # Express backend (persistence only)
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── db/              # Database connection, queries, migrations
│   │   ├── types/           # Server-specific types
│   │   └── index.ts         # Server entry point
│   └── tsconfig.json
├── shared/                  # Shared TypeScript types
│   ├── types.ts
│   └── package.json
├── CLAUDE.md
└── package.json             # Root package.json with workspaces
```

### Key Patterns

- **Conversation context**: Client fetches last N messages from the server and builds the prompt locally for WebLLM.
- **Voice flow**: Browser captures speech → WebLLM generates response locally → browser speaks it via SpeechSynthesis → both messages persisted to server. All processing stays in the browser.
- **Waveform visualization**: Use `AnalyserNode` from Web Audio API connected to the mic stream. Render frequency data on a `<canvas>` element with `requestAnimationFrame`. Switches to pulse animation while LLM is generating.
- **Message persistence**: Client sends two separate POST requests per exchange — user message before generation, assistant message after. Crash-safe: user input is never lost.
