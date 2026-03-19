# Nala Architecture Design

## Overview

Nala is a voice-first conversational AI web app that runs entirely in the browser. Users speak into their mic, a local LLM (via WebLLM/WebGPU) generates responses, and the browser speaks them aloud via SpeechSynthesis. All conversations persist in PostgreSQL so users can reference past interactions.

**Stack**: React + Vite + TypeScript frontend, Express.js backend (persistence only), PostgreSQL, WebLLM (browser-local inference), Web Speech API (voice I/O).

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI inference | WebLLM in browser | No external API coupling, no API keys, no per-request costs, fully self-contained |
| Users table | Present but no auth | Schema is multi-user ready with `user_id` FK on conversations; hardcoded default user for now |
| Conversation memory | Last N messages (current conversation only) | Simple, avoids token bloat; users can explicitly ask to look back |
| Waveform display | Recording + thinking pulse | Waveform animates during mic input; distinct pulse animation while waiting for LLM generation |
| Project structure | Monorepo with shared types | npm workspaces with `client/`, `server/`, `shared/` packages; shared TypeScript types prevent drift |
| Server role | Pure persistence layer | No AI logic on server; stores/retrieves conversations and messages only |

## Section 1: PostgreSQL Schema

### `users`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT `gen_random_uuid()` |
| name | varchar(255) | NOT NULL |
| created_at | timestamptz | DEFAULT `now()` |

A single seed row (`'Default User'`) is inserted via migration.

### `conversations`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT `gen_random_uuid()` |
| user_id | uuid | FK -> users(id), NOT NULL |
| title | varchar(255) | Nullable, auto-generated from first message |
| created_at | timestamptz | DEFAULT `now()` |
| updated_at | timestamptz | DEFAULT `now()`, updated on new message |

**Indexes:**
- `idx_conversations_user_id` on `(user_id)`
- `idx_conversations_updated_at` on `(updated_at)` for recent-first sorting

### `messages`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT `gen_random_uuid()` |
| conversation_id | uuid | FK -> conversations(id) ON DELETE CASCADE, NOT NULL |
| role | varchar(20) | `'user'` or `'assistant'`, NOT NULL |
| content | text | NOT NULL |
| created_at | timestamptz | DEFAULT `now()` |

**Indexes:**
- `idx_messages_conversation_id_created_at` composite on `(conversation_id, created_at)` for fetching messages in order

### Schema decisions
- CASCADE delete on messages when a conversation is deleted
- No `updated_at` on messages — messages are immutable
- `timestamptz` everywhere to avoid timezone bugs
- Auto-title: first user message truncated to ~50 chars

## Section 2: API Endpoints

All routes prefixed with `/api`. The backend is a pure persistence layer — no AI logic.

### Conversations

| Method | Route | Request Body | Response |
|--------|-------|-------------|----------|
| POST | `/api/conversations` | `{}` | `{ id, user_id, title, created_at }` |
| GET | `/api/conversations` | — | `{ conversations: [{ id, title, created_at, updated_at }] }` |
| GET | `/api/conversations/:id` | — | `{ id, title, created_at, messages: [{ id, role, content, created_at }] }` |
| PATCH | `/api/conversations/:id` | `{ title }` | `{ id, title, updated_at }` |
| DELETE | `/api/conversations/:id` | — | `204 No Content` |

### Messages

| Method | Route | Request Body | Response |
|--------|-------|-------------|----------|
| POST | `/api/conversations/:id/messages` | `{ role, content }` | `{ id, role, content, created_at }` |

### Endpoint behavior
- `POST /messages` persists a single message — called twice per exchange (user message before generation, assistant message after)
- Both roles are sent from the client since inference happens in the browser
- `PATCH /conversations/:id` is used by the client to set the title after generating it locally
- Conversations listed in `updated_at` descending order

### Error responses

Standard shape: `{ error: string, code: string }`

| Status | When |
|--------|------|
| 400 | Empty message content, invalid role |
| 404 | Conversation not found |
| 500 | Database error |

## Section 3: React Component Tree

```
<App>
├── <ModelLoader>                       (WebGPU check, download progress bar)
│
├── <ConversationSidebar>
│   ├── <NewConversationButton />
│   └── <ConversationList>
│       └── <ConversationItem />        (title + date, click to select, delete)
│
└── <MainPanel>
    ├── <ChatHistory>
    │   └── <MessageBubble />           (per message, styled by role)
    │
    ├── <StatusIndicator />             (idle / listening / thinking)
    │
    ├── <Waveform />                    (canvas: waveform during recording,
    │                                    pulse during thinking, hidden when idle)
    │
    └── <VoiceControls>
        └── <MicButton />              (toggle recording)
```

### Component responsibilities

| Component | State Owned | Purpose |
|-----------|------------|---------|
| App | Current conversation ID | Top-level layout, composes hooks, routes state |
| ModelLoader | None (receives loadProgress) | Gate screen shown until WebLLM model is ready |
| ConversationSidebar | None | Left panel layout |
| ConversationList | None | Renders ConversationItems |
| ConversationItem | None | Title, date, click handler, delete button |
| NewConversationButton | None | Calls create API, selects new conversation |
| MainPanel | None | Right panel layout |
| ChatHistory | Scroll position, auto-scroll ref | Scrollable message list |
| MessageBubble | None | Single message — right-aligned (user), left-aligned (assistant) |
| StatusIndicator | None (receives status) | Text display: "Listening...", "Thinking...", or hidden |
| Waveform | Canvas ref, animation frame ID | Live waveform from AnalyserNode (recording) or pulse animation (thinking) |
| VoiceControls | None | Container for MicButton |
| MicButton | None (receives isRecording + handler) | Toggle button with visual feedback |

### Custom hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useVoiceInput()` | `{ transcript, isListening, startListening, stopListening }` | Wraps SpeechRecognition API |
| `useVoiceOutput()` | `{ speak, isSpeaking, cancel }` | Wraps SpeechSynthesis API |
| `useAudioAnalyser()` | `{ analyserNode, frequencyData }` | Creates AudioContext + AnalyserNode from mic stream for Waveform canvas |
| `useWebLLM()` | `{ generate, isReady, loadProgress, error }` | Initializes WebLLM MLCEngine, loads model, exposes generation |
| `useConversations()` | `{ conversations, create, remove, updateTitle, isLoading }` | CRUD API calls for conversations |
| `useMessages(conversationId)` | `{ messages, sendMessage, isLoading }` | Fetches/persists messages, orchestrates WebLLM generation |

### Key decisions
- State lives in hooks, not deeply nested components
- Waveform is one component with a `mode` prop (`'recording' | 'thinking' | 'idle'`)
- No global state library — hooks + props are sufficient
- ModelLoader gates the app until WebLLM is ready

## Section 4: Data Flow

Complete lifecycle of a voice message:

```
BROWSER                                          SERVER

 1. User taps MicButton
 2. useVoiceInput starts SpeechRecognition
 3. useAudioAnalyser connects mic -> AnalyserNode
 4. Waveform renders live frequency data
 5. User stops speaking or taps MicButton
 6. SpeechRecognition returns transcript
 7. ChatHistory adds user MessageBubble
 8. POST /api/conversations/:id/messages    ---> 9. INSERT user message
    { role: "user", content }               <---    return saved message
10. Waveform switches to "thinking" pulse
11. useWebLLM().generate()
    - Build prompt from last N messages
    - Feed to local model via MLCEngine
    - Receive generated text
12. Add assistant MessageBubble
13. POST /api/conversations/:id/messages    ---> 14. INSERT assistant message
    { role: "assistant", content }          <---     return saved message
15. Waveform stops (idle)
16. useVoiceOutput speaks response via TTS
17. If first message pair:
    generate title locally (truncate ~50 chars)
    PATCH /api/conversations/:id            ---> 18. UPDATE title
    { title }                               <---
```

### Error handling

| Stage | Failure | Handling |
|-------|---------|----------|
| App init | WebGPU not available | Show "Nala requires Chrome 113+ with WebGPU", block app |
| App init | Model download fails | Retry button on progress screen, resume partial download |
| 2 | Mic permission denied | Show permission prompt, disable MicButton |
| 6 | Speech not recognized | Show "Didn't catch that, try again" |
| 8, 13 | Network/DB error | Show error toast, keep message for retry |
| 11 | Generation fails (OOM) | Show error toast "Nala ran into trouble", clear thinking state |
| 16 | TTS unavailable | Fail silently — text response is visible in chat |

### Key decisions
- All AI inference in the browser — server never involved in generation
- Two separate POST calls to persist messages: user before generation, assistant after (crash-safe)
- Title generation is client-side — simple truncation, no LLM needed
- ModelLoader gates the app on first visit while model downloads (~1-4GB, cached in IndexedDB after)
- No streaming from LLM to UI for now — full response waited for since TTS needs complete text

## File Structure

```
nala/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── app.tsx
│   │   │   ├── model-loader.tsx
│   │   │   ├── conversation-sidebar.tsx
│   │   │   ├── conversation-list.tsx
│   │   │   ├── conversation-item.tsx
│   │   │   ├── new-conversation-button.tsx
│   │   │   ├── main-panel.tsx
│   │   │   ├── chat-history.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── status-indicator.tsx
│   │   │   ├── waveform.tsx
│   │   │   ├── voice-controls.tsx
│   │   │   └── mic-button.tsx
│   │   ├── hooks/
│   │   │   ├── use-voice-input.ts
│   │   │   ├── use-voice-output.ts
│   │   │   ├── use-audio-analyser.ts
│   │   │   ├── use-web-llm.ts
│   │   │   ├── use-conversations.ts
│   │   │   └── use-messages.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── conversations.ts
│   │   │   └── messages.ts
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   ├── queries.ts
│   │   │   └── migrations/
│   │   │       └── 001-initial-schema.sql
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   └── tsconfig.json
├── shared/
│   ├── types.ts
│   └── package.json
├── package.json
├── CLAUDE.md
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-03-19-nala-architecture-design.md
```
