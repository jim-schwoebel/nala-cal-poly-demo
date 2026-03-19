# Nala Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a voice-first conversational AI web app with browser-local LLM inference, voice I/O, and persistent conversation storage.

**Architecture:** Monorepo (npm workspaces) with React+Vite client, Express.js server (persistence only), and shared types. AI inference runs in-browser via WebLLM. Voice handled by Web Speech API. PostgreSQL stores all conversations.

**Tech Stack:** React 18, Vite 5, TypeScript, Express.js, PostgreSQL, `pg` driver, `@mlc-ai/web-llm`, Web Speech API, Web Audio API, Vitest, Supertest.

**Spec:** `docs/superpowers/specs/2026-03-19-nala-architecture-design.md`

**Spec deviations (intentional):**
- `server/src/types/index.ts` from the spec file structure is omitted — all shared types live in `@nala/shared` to avoid duplication. Server-internal types (if any) go inline.
- `useWebLLM` adds an `init()` method not in spec — gives the consumer control over when the ~1-4GB model download starts rather than auto-initializing.
- `useAudioAnalyser` returns `{ analyserNode, start, stop }` instead of spec's `{ analyserNode, frequencyData }` — components read frequency data directly from the AnalyserNode, making `frequencyData` redundant.
- `useMessages` adds `isGenerating` to the return value and `sendMessage` accepts a `generate` function — decouples the hook from WebLLM for testability.
- `useVoiceInput` adds `error` to the return value — needed for mic permission denied UI feedback.
- `CLAUDE.md` already exists at the project root and does not need to be created by this plan.

**Prerequisites:**
- PostgreSQL must be running locally.
- Create test database before running any server tests: `createdb nala_test`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `shared/package.json`
- Create: `shared/types.ts`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/vitest.config.ts`
- Create: `server/src/index.ts`
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/index.html`
- Create: `client/src/main.tsx`
- Create: `client/src/index.css`

- [ ] **Step 1: Create root package.json with workspaces**

```json
{
  "name": "nala",
  "private": true,
  "workspaces": ["shared", "server", "client"],
  "scripts": {
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client",
    "test:server": "npm test --workspace=server",
    "test:client": "npm test --workspace=client"
  }
}
```

- [ ] **Step 2: Create shared types package**

`shared/package.json`:
```json
{
  "name": "@nala/shared",
  "version": "1.0.0",
  "main": "types.ts",
  "types": "types.ts"
}
```

`shared/types.ts`:
```typescript
export type MessageRole = "user" | "assistant";

export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  code: string;
}
```

- [ ] **Step 3: Create server package**

`server/package.json`:
```json
{
  "name": "@nala/server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "test": "vitest"
  },
  "dependencies": {
    "@nala/shared": "*",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "pg": "^8.13.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.11.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2"
  }
}
```

`server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

`server/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

`server/src/index.ts` (minimal placeholder):
```typescript
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Nala server running on port ${PORT}`);
});

export { app };
```

- [ ] **Step 4: Create client package**

`client/package.json`:
```json
{
  "name": "@nala/client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "@nala/shared": "*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "jsdom": "^25.0.0"
  }
}
```

`client/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

`client/vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

`client/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nala</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`client/src/main.tsx`:
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return <div>Nala</div>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`client/src/index.css`:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  font-family: system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
  background: #fafafa;
}

body {
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 5: Install dependencies and verify**

Run: `npm install`
Expected: Successful install, no errors.

Run: `npm run dev:server`
Expected: "Nala server running on port 3001"

Run: `npm run dev:client` (in separate terminal)
Expected: Vite dev server on http://localhost:5173, shows "Nala" text.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold monorepo with client, server, and shared packages"
```

---

## Task 2: Database Schema and Connection

**Files:**
- Create: `server/src/db/connection.ts`
- Create: `server/src/db/migrations/001-initial-schema.sql`
- Create: `server/src/db/queries.ts`
- Create: `server/src/db/queries.test.ts`

- [ ] **Step 1: Write the migration SQL**

`server/src/db/migrations/001-initial-schema.sql`:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title varchar(255),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at);

-- Seed default user
INSERT INTO users (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Default User');
```

- [ ] **Step 2: Write the database connection module**

`server/src/db/connection.ts`:
```typescript
import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/nala",
});

export { pool };
```

- [ ] **Step 3: Write the failing tests for query functions**

`server/src/db/queries.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { pool } from "./connection";
import {
  createConversation,
  listConversations,
  getConversation,
  updateConversationTitle,
  deleteConversation,
  createMessage,
  getMessages,
} from "./queries";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

beforeAll(async () => {
  // Run migration
  const fs = await import("fs");
  const url = new URL("migrations/001-initial-schema.sql", import.meta.url);
  const sql = fs.readFileSync(url, "utf-8");
  await pool.query(sql);
});

beforeEach(async () => {
  await pool.query("DELETE FROM messages");
  await pool.query("DELETE FROM conversations");
});

afterAll(async () => {
  await pool.query("DROP TABLE IF EXISTS messages CASCADE");
  await pool.query("DROP TABLE IF EXISTS conversations CASCADE");
  await pool.query("DROP TABLE IF EXISTS users CASCADE");
  await pool.end();
});

describe("conversations", () => {
  it("creates a conversation", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    expect(convo.id).toBeDefined();
    expect(convo.user_id).toBe(DEFAULT_USER_ID);
    expect(convo.title).toBeNull();
  });

  it("lists conversations in updated_at descending order", async () => {
    const c1 = await createConversation(DEFAULT_USER_ID);
    const c2 = await createConversation(DEFAULT_USER_ID);
    const list = await listConversations(DEFAULT_USER_ID);
    expect(list[0].id).toBe(c2.id);
    expect(list[1].id).toBe(c1.id);
  });

  it("gets a conversation with its messages", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    await createMessage(convo.id, "user", "hello");
    await createMessage(convo.id, "assistant", "hi there");
    const result = await getConversation(convo.id);
    expect(result).not.toBeNull();
    expect(result!.messages).toHaveLength(2);
    expect(result!.messages[0].role).toBe("user");
    expect(result!.messages[1].role).toBe("assistant");
  });

  it("returns null for non-existent conversation", async () => {
    const result = await getConversation("00000000-0000-0000-0000-000000000099");
    expect(result).toBeNull();
  });

  it("updates conversation title", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    const updated = await updateConversationTitle(convo.id, "Test Title");
    expect(updated!.title).toBe("Test Title");
  });

  it("deletes a conversation and its messages", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    await createMessage(convo.id, "user", "hello");
    await deleteConversation(convo.id);
    const result = await getConversation(convo.id);
    expect(result).toBeNull();
    const msgs = await getMessages(convo.id);
    expect(msgs).toHaveLength(0);
  });
});

describe("messages", () => {
  it("creates a message", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    const msg = await createMessage(convo.id, "user", "hello");
    expect(msg.id).toBeDefined();
    expect(msg.role).toBe("user");
    expect(msg.content).toBe("hello");
    expect(msg.conversation_id).toBe(convo.id);
  });

  it("gets messages in chronological order", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    await createMessage(convo.id, "user", "first");
    await createMessage(convo.id, "assistant", "second");
    await createMessage(convo.id, "user", "third");
    const msgs = await getMessages(convo.id);
    expect(msgs).toHaveLength(3);
    expect(msgs[0].content).toBe("first");
    expect(msgs[2].content).toBe("third");
  });

  it("updates conversation updated_at when message is created", async () => {
    const convo = await createConversation(DEFAULT_USER_ID);
    const before = new Date(convo.updated_at);
    // Small delay to ensure timestamp difference
    await new Promise((r) => setTimeout(r, 50));
    await createMessage(convo.id, "user", "hello");
    const updated = await getConversation(convo.id);
    const after = new Date(updated!.updated_at);
    expect(after.getTime()).toBeGreaterThan(before.getTime());
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd server && npx vitest run src/db/queries.test.ts`
Expected: FAIL — `queries` module does not exist yet.

- [ ] **Step 5: Implement query functions**

`server/src/db/queries.ts`:
```typescript
import type { Conversation, Message, MessageRole } from "@nala/shared";
import { pool } from "./connection";

export async function createConversation(
  userId: string
): Promise<Conversation> {
  const result = await pool.query(
    `INSERT INTO conversations (user_id) VALUES ($1)
     RETURNING id, user_id, title, created_at, updated_at`,
    [userId]
  );
  return result.rows[0];
}

export async function listConversations(
  userId: string
): Promise<Conversation[]> {
  const result = await pool.query(
    `SELECT id, user_id, title, created_at, updated_at
     FROM conversations WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getConversation(
  id: string
): Promise<(Conversation & { messages: Message[] }) | null> {
  const convoResult = await pool.query(
    `SELECT id, user_id, title, created_at, updated_at
     FROM conversations WHERE id = $1`,
    [id]
  );
  if (convoResult.rows.length === 0) return null;

  const messages = await getMessages(id);
  return { ...convoResult.rows[0], messages };
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<Conversation | null> {
  const result = await pool.query(
    `UPDATE conversations SET title = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, user_id, title, created_at, updated_at`,
    [title, id]
  );
  return result.rows[0] || null;
}

export async function deleteConversation(id: string): Promise<void> {
  await pool.query("DELETE FROM conversations WHERE id = $1", [id]);
}

export async function createMessage(
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, conversation_id, role, content, created_at`,
    [conversationId, role, content]
  );

  // Update conversation's updated_at
  await pool.query(
    "UPDATE conversations SET updated_at = now() WHERE id = $1",
    [conversationId]
  );

  return result.rows[0];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const result = await pool.query(
    `SELECT id, conversation_id, role, content, created_at
     FROM messages WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );
  return result.rows;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Prerequisite: A PostgreSQL database named `nala_test` must exist.
Run: `createdb nala_test` (if not exists)
Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run src/db/queries.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add server/src/db/ shared/types.ts
git commit -m "feat: add database schema, connection, and query functions with tests"
```

---

## Task 3: Express API Routes — Conversations

**Files:**
- Create: `server/src/routes/conversations.ts`
- Create: `server/src/routes/conversations.test.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Write failing tests for conversation routes**

`server/src/routes/conversations.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index";
import { pool } from "../db/connection";

beforeAll(async () => {
  const fs = await import("fs");
  const url = new URL("../db/migrations/001-initial-schema.sql", import.meta.url);
  const sql = fs.readFileSync(url, "utf-8");
  await pool.query(sql);
});

beforeEach(async () => {
  await pool.query("DELETE FROM messages");
  await pool.query("DELETE FROM conversations");
});

afterAll(async () => {
  await pool.query("DROP TABLE IF EXISTS messages CASCADE");
  await pool.query("DROP TABLE IF EXISTS conversations CASCADE");
  await pool.query("DROP TABLE IF EXISTS users CASCADE");
  await pool.end();
});

describe("POST /api/conversations", () => {
  it("creates a conversation", async () => {
    const res = await request(app).post("/api/conversations").send({});
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBeNull();
  });
});

describe("GET /api/conversations", () => {
  it("lists conversations", async () => {
    await request(app).post("/api/conversations").send({});
    await request(app).post("/api/conversations").send({});
    const res = await request(app).get("/api/conversations");
    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(2);
  });
});

describe("GET /api/conversations/:id", () => {
  it("gets a conversation with messages", async () => {
    const create = await request(app).post("/api/conversations").send({});
    const id = create.body.id;
    await request(app)
      .post(`/api/conversations/${id}/messages`)
      .send({ role: "user", content: "hello" });
    const res = await request(app).get(`/api/conversations/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
  });

  it("returns 404 for non-existent conversation", async () => {
    const res = await request(app).get(
      "/api/conversations/00000000-0000-0000-0000-000000000099"
    );
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/conversations/:id", () => {
  it("updates the title", async () => {
    const create = await request(app).post("/api/conversations").send({});
    const res = await request(app)
      .patch(`/api/conversations/${create.body.id}`)
      .send({ title: "New Title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New Title");
  });
});

describe("DELETE /api/conversations/:id", () => {
  it("deletes a conversation", async () => {
    const create = await request(app).post("/api/conversations").send({});
    const res = await request(app).delete(
      `/api/conversations/${create.body.id}`
    );
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run src/routes/conversations.test.ts`
Expected: FAIL — routes not registered, all return 404.

- [ ] **Step 3: Implement conversation routes**

`server/src/routes/conversations.ts`:
```typescript
import { Router } from "express";
import {
  createConversation,
  listConversations,
  getConversation,
  updateConversationTitle,
  deleteConversation,
} from "../db/queries";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

const router = Router();

router.post("/", async (_req, res) => {
  try {
    const conversation = await createConversation(DEFAULT_USER_ID);
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation", code: "DB_ERROR" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const conversations = await listConversations(DEFAULT_USER_ID);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: "Failed to list conversations", code: "DB_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
      return;
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to get conversation", code: "DB_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Title is required", code: "VALIDATION_ERROR" });
      return;
    }
    const conversation = await updateConversationTitle(req.params.id, title);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
      return;
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to update conversation", code: "DB_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteConversation(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete conversation", code: "DB_ERROR" });
  }
});

export { router as conversationsRouter };
```

- [ ] **Step 4: Register routes in server index**

Update `server/src/index.ts`:
```typescript
import express from "express";
import cors from "cors";
import { conversationsRouter } from "./routes/conversations";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/conversations", conversationsRouter);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Nala server running on port ${PORT}`);
  });
}

export { app };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run src/routes/conversations.test.ts`
Expected: All 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/conversations.ts server/src/routes/conversations.test.ts server/src/index.ts
git commit -m "feat: add conversation CRUD API routes with tests"
```

---

## Task 4: Express API Routes — Messages

**Files:**
- Create: `server/src/routes/messages.ts`
- Create: `server/src/routes/messages.test.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Write failing tests for message routes**

`server/src/routes/messages.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index";
import { pool } from "../db/connection";

beforeAll(async () => {
  const fs = await import("fs");
  const url = new URL("../db/migrations/001-initial-schema.sql", import.meta.url);
  const sql = fs.readFileSync(url, "utf-8");
  await pool.query(sql);
});

beforeEach(async () => {
  await pool.query("DELETE FROM messages");
  await pool.query("DELETE FROM conversations");
});

afterAll(async () => {
  await pool.query("DROP TABLE IF EXISTS messages CASCADE");
  await pool.query("DROP TABLE IF EXISTS conversations CASCADE");
  await pool.query("DROP TABLE IF EXISTS users CASCADE");
  await pool.end();
});

describe("POST /api/conversations/:id/messages", () => {
  it("creates a user message", async () => {
    const convo = await request(app).post("/api/conversations").send({});
    const res = await request(app)
      .post(`/api/conversations/${convo.body.id}/messages`)
      .send({ role: "user", content: "hello nala" });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("user");
    expect(res.body.content).toBe("hello nala");
    expect(res.body.conversation_id).toBe(convo.body.id);
  });

  it("creates an assistant message", async () => {
    const convo = await request(app).post("/api/conversations").send({});
    const res = await request(app)
      .post(`/api/conversations/${convo.body.id}/messages`)
      .send({ role: "assistant", content: "hi there!" });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("assistant");
  });

  it("rejects empty content", async () => {
    const convo = await request(app).post("/api/conversations").send({});
    const res = await request(app)
      .post(`/api/conversations/${convo.body.id}/messages`)
      .send({ role: "user", content: "" });
    expect(res.status).toBe(400);
  });

  it("rejects invalid role", async () => {
    const convo = await request(app).post("/api/conversations").send({});
    const res = await request(app)
      .post(`/api/conversations/${convo.body.id}/messages`)
      .send({ role: "system", content: "test" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent conversation", async () => {
    const res = await request(app)
      .post("/api/conversations/00000000-0000-0000-0000-000000000099/messages")
      .send({ role: "user", content: "hello" });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run src/routes/messages.test.ts`
Expected: FAIL — route not registered.

- [ ] **Step 3: Implement message routes**

`server/src/routes/messages.ts`:
```typescript
import { Router } from "express";
import { createMessage, getConversation } from "../db/queries";
import type { MessageRole } from "@nala/shared";

const VALID_ROLES: MessageRole[] = ["user", "assistant"];

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
  try {
    const { role, content } = req.body;
    const { id: conversationId } = req.params;

    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Content is required", code: "VALIDATION_ERROR" });
      return;
    }

    if (!VALID_ROLES.includes(role)) {
      res.status(400).json({ error: "Role must be 'user' or 'assistant'", code: "VALIDATION_ERROR" });
      return;
    }

    // Check conversation exists
    const conversation = await getConversation(conversationId);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
      return;
    }

    const message = await createMessage(conversationId, role, content.trim());
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to create message", code: "DB_ERROR" });
  }
});

export { router as messagesRouter };
```

- [ ] **Step 4: Register message routes in server index**

Update `server/src/index.ts` — add after the conversations router:
```typescript
import { messagesRouter } from "./routes/messages";

// ... existing code ...

app.use("/api/conversations/:id/messages", messagesRouter);
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run src/routes/messages.test.ts`
Expected: All 5 tests PASS.

- [ ] **Step 6: Run all server tests**

Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run`
Expected: All 12 tests PASS (7 query + 5 route).

- [ ] **Step 7: Commit**

```bash
git add server/src/routes/messages.ts server/src/routes/messages.test.ts server/src/index.ts
git commit -m "feat: add message persistence API route with tests"
```

---

## Task 5: Client API Service

**Files:**
- Create: `client/src/services/api.ts`
- Create: `client/src/services/api.test.ts`

- [ ] **Step 1: Write failing tests for the API client**

`client/src/services/api.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createConversation,
  listConversations,
  getConversation,
  updateConversationTitle,
  deleteConversation,
  createMessage,
} from "./api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api client", () => {
  it("createConversation posts to /api/conversations", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "123", user_id: "u1", title: null }),
    });
    const result = await createConversation();
    expect(mockFetch).toHaveBeenCalledWith("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(result.id).toBe("123");
  });

  it("listConversations gets /api/conversations", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ conversations: [{ id: "1" }, { id: "2" }] }),
    });
    const result = await listConversations();
    expect(result).toHaveLength(2);
  });

  it("createMessage posts role and content", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ id: "m1", role: "user", content: "hi" }),
    });
    const result = await createMessage("c1", "user", "hi");
    expect(mockFetch).toHaveBeenCalledWith("/api/conversations/c1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content: "hi" }),
    });
    expect(result.content).toBe("hi");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Not found", code: "NOT_FOUND" }),
    });
    await expect(getConversation("bad-id")).rejects.toThrow("Not found");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/services/api.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the API client**

`client/src/services/api.ts`:
```typescript
import type { Conversation, Message, MessageRole } from "@nala/shared";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function createConversation(): Promise<Conversation> {
  return request("/conversations", {
    method: "POST",
    body: "{}",
  });
}

export async function listConversations(): Promise<Conversation[]> {
  const data = await request<{ conversations: Conversation[] }>("/conversations");
  return data.conversations;
}

export async function getConversation(
  id: string
): Promise<Conversation & { messages: Message[] }> {
  return request(`/conversations/${id}`);
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<Conversation> {
  return request(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  return request(`/conversations/${id}`, { method: "DELETE" });
}

export async function createMessage(
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ role, content }),
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/services/api.test.ts`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/services/
git commit -m "feat: add client API service with tests"
```

---

## Task 6: useConversations Hook

**Files:**
- Create: `client/src/hooks/use-conversations.ts`
- Create: `client/src/hooks/use-conversations.test.ts`

- [ ] **Step 1: Write failing tests**

`client/src/hooks/use-conversations.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useConversations } from "./use-conversations";
import * as api from "../services/api";

vi.mock("../services/api");

const mockApi = vi.mocked(api);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useConversations", () => {
  it("loads conversations on mount", async () => {
    mockApi.listConversations.mockResolvedValue([
      { id: "1", user_id: "u1", title: "Test", created_at: "", updated_at: "" },
    ]);
    const { result } = renderHook(() => useConversations());
    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(1);
    });
  });

  it("creates a conversation and adds it to the list", async () => {
    mockApi.listConversations.mockResolvedValue([]);
    mockApi.createConversation.mockResolvedValue({
      id: "new", user_id: "u1", title: null, created_at: "", updated_at: "",
    });
    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.create();
    });
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].id).toBe("new");
  });

  it("removes a conversation from the list", async () => {
    mockApi.listConversations.mockResolvedValue([
      { id: "1", user_id: "u1", title: "Test", created_at: "", updated_at: "" },
    ]);
    mockApi.deleteConversation.mockResolvedValue(undefined);
    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.conversations).toHaveLength(1));
    await act(async () => {
      await result.current.remove("1");
    });
    expect(result.current.conversations).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/hooks/use-conversations.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the hook**

`client/src/hooks/use-conversations.ts`:
```typescript
import { useState, useEffect, useCallback } from "react";
import type { Conversation } from "@nala/shared";
import * as api from "../services/api";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.listConversations().then((data) => {
      setConversations(data);
      setIsLoading(false);
    });
  }, []);

  const create = useCallback(async () => {
    const conversation = await api.createConversation();
    setConversations((prev) => [conversation, ...prev]);
    return conversation;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateTitle = useCallback(async (id: string, title: string) => {
    const updated = await api.updateConversationTitle(id, title);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  }, []);

  return { conversations, isLoading, create, remove, updateTitle };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/hooks/use-conversations.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/use-conversations.ts client/src/hooks/use-conversations.test.ts
git commit -m "feat: add useConversations hook with tests"
```

---

## Task 7: useMessages Hook

**Files:**
- Create: `client/src/hooks/use-messages.ts`
- Create: `client/src/hooks/use-messages.test.ts`

- [ ] **Step 1: Write failing tests**

`client/src/hooks/use-messages.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMessages } from "./use-messages";
import * as api from "../services/api";

vi.mock("../services/api");

const mockApi = vi.mocked(api);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useMessages", () => {
  it("loads messages when conversationId changes", async () => {
    mockApi.getConversation.mockResolvedValue({
      id: "c1", user_id: "u1", title: null, created_at: "", updated_at: "",
      messages: [
        { id: "m1", conversation_id: "c1", role: "user", content: "hi", created_at: "" },
      ],
    });
    const { result } = renderHook(() => useMessages("c1"));
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });
  });

  it("returns empty messages when no conversationId", () => {
    const { result } = renderHook(() => useMessages(null));
    expect(result.current.messages).toHaveLength(0);
  });

  it("sendMessage persists user message and adds both to state", async () => {
    mockApi.getConversation.mockResolvedValue({
      id: "c1", user_id: "u1", title: null, created_at: "", updated_at: "",
      messages: [],
    });
    mockApi.createMessage.mockResolvedValueOnce({
      id: "m1", conversation_id: "c1", role: "user", content: "hello", created_at: "",
    });
    const { result } = renderHook(() => useMessages("c1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // sendMessage takes content and a generate function
    const mockGenerate = vi.fn().mockResolvedValue("I'm Nala!");
    mockApi.createMessage.mockResolvedValueOnce({
      id: "m2", conversation_id: "c1", role: "assistant", content: "I'm Nala!", created_at: "",
    });

    await act(async () => {
      await result.current.sendMessage("hello", mockGenerate);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[1].role).toBe("assistant");
    expect(mockGenerate).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/hooks/use-messages.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the hook**

`client/src/hooks/use-messages.ts`:
```typescript
import { useState, useEffect, useCallback } from "react";
import type { Message } from "@nala/shared";
import * as api from "../services/api";

type GenerateFn = (messages: Message[]) => Promise<string>;

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    api.getConversation(conversationId).then((data) => {
      setMessages(data.messages);
      setIsLoading(false);
    });
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, generate: GenerateFn) => {
      if (!conversationId) return;

      // Persist user message
      const userMessage = await api.createMessage(
        conversationId,
        "user",
        content
      );
      setMessages((prev) => [...prev, userMessage]);

      // Generate assistant response
      setIsGenerating(true);
      try {
        const allMessages = [...messages, userMessage];
        const response = await generate(allMessages);

        // Persist assistant message
        const assistantMessage = await api.createMessage(
          conversationId,
          "assistant",
          response
        );
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsGenerating(false);
      }
    },
    [conversationId, messages]
  );

  return { messages, isLoading, isGenerating, sendMessage };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/hooks/use-messages.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/use-messages.ts client/src/hooks/use-messages.test.ts
git commit -m "feat: add useMessages hook with tests"
```

---

## Task 8: useWebLLM Hook

**Files:**
- Create: `client/src/hooks/use-web-llm.ts`
- Create: `client/src/hooks/use-web-llm.test.ts`

Note: `@mlc-ai/web-llm` must be added to client dependencies first.

- [ ] **Step 1: Install WebLLM dependency**

Run: `cd client && npm install @mlc-ai/web-llm`

- [ ] **Step 2: Write failing tests**

`client/src/hooks/use-web-llm.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWebLLM } from "./use-web-llm";

// Mock the web-llm module
vi.mock("@mlc-ai/web-llm", () => ({
  CreateMLCEngine: vi.fn(),
}));

import { CreateMLCEngine } from "@mlc-ai/web-llm";

const mockEngine = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(CreateMLCEngine).mockResolvedValue(mockEngine as any);
});

describe("useWebLLM", () => {
  it("initializes engine and reports progress", async () => {
    const { result } = renderHook(() => useWebLLM());

    await act(async () => {
      await result.current.init();
    });

    expect(CreateMLCEngine).toHaveBeenCalled();
    expect(result.current.isReady).toBe(true);
  });

  it("generates a response from messages", async () => {
    mockEngine.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: "Hello! I'm Nala." } }],
    });

    const { result } = renderHook(() => useWebLLM());

    await act(async () => {
      await result.current.init();
    });

    let response: string = "";
    await act(async () => {
      response = await result.current.generate([
        { id: "1", conversation_id: "c1", role: "user", content: "hi", created_at: "" },
      ]);
    });

    expect(response).toBe("Hello! I'm Nala.");
    expect(mockEngine.chat.completions.create).toHaveBeenCalled();
  });

  it("reports error if engine fails to initialize", async () => {
    vi.mocked(CreateMLCEngine).mockRejectedValue(new Error("WebGPU not supported"));

    const { result } = renderHook(() => useWebLLM());

    await act(async () => {
      await result.current.init();
    });

    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBe("WebGPU not supported");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd client && npx vitest run src/hooks/use-web-llm.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 4: Implement the hook**

`client/src/hooks/use-web-llm.ts`:
```typescript
import { useState, useCallback, useRef } from "react";
import type { Message } from "@nala/shared";
import { CreateMLCEngine, type MLCEngine, type InitProgressReport } from "@mlc-ai/web-llm";

const MODEL_ID = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

const SYSTEM_PROMPT =
  "You are Nala, a friendly and helpful voice assistant. Keep responses concise and conversational since they will be spoken aloud.";

export function useWebLLM() {
  const engineRef = useRef<MLCEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    try {
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: InitProgressReport) => {
          setLoadProgress(report.progress);
        },
      });
      engineRef.current = engine;
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
    }
  }, []);

  const generate = useCallback(async (messages: Message[]): Promise<string> => {
    if (!engineRef.current) throw new Error("Engine not initialized");

    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await engineRef.current.chat.completions.create({
      messages: chatMessages,
    });

    return response.choices[0].message.content || "";
  }, []);

  return { init, generate, isReady, loadProgress, error };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd client && npx vitest run src/hooks/use-web-llm.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/hooks/use-web-llm.ts client/src/hooks/use-web-llm.test.ts client/package.json
git commit -m "feat: add useWebLLM hook for browser-local LLM inference"
```

---

## Task 9: useVoiceInput Hook

**Files:**
- Create: `client/src/hooks/use-voice-input.ts`
- Create: `client/src/hooks/use-voice-input.test.ts`

- [ ] **Step 1: Write failing tests**

`client/src/hooks/use-voice-input.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceInput } from "./use-voice-input";

let recognitionInstance: any;

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  constructor() {
    recognitionInstance = this;
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  (globalThis as any).webkitSpeechRecognition = MockSpeechRecognition;
  (globalThis as any).SpeechRecognition = MockSpeechRecognition;
});

describe("useVoiceInput", () => {
  it("starts listening", () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(true);
    expect(recognitionInstance.start).toHaveBeenCalled();
  });

  it("stops listening", () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    act(() => {
      result.current.stopListening();
    });
    expect(recognitionInstance.stop).toHaveBeenCalled();
  });

  it("returns transcript on result", () => {
    const { result } = renderHook(() => useVoiceInput());
    act(() => {
      result.current.startListening();
    });
    act(() => {
      recognitionInstance.onresult({
        results: [[{ transcript: "hello nala" }]],
        resultIndex: 0,
      });
    });
    expect(result.current.transcript).toBe("hello nala");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/hooks/use-voice-input.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the hook**

`client/src/hooks/use-voice-input.ts`:
```typescript
import { useState, useCallback, useRef } from "react";

type SpeechRecognitionType = typeof window.SpeechRecognition extends undefined
  ? any
  : InstanceType<typeof window.SpeechRecognition>;

export function useVoiceInput() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (globalThis as any).SpeechRecognition ||
      (globalThis as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const result = event.results[event.resultIndex][0].transcript;
      setTranscript(result);
    };

    recognition.onerror = (event: any) => {
      setError(event.error || "Recognition error");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { transcript, isListening, error, startListening, stopListening };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/hooks/use-voice-input.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/use-voice-input.ts client/src/hooks/use-voice-input.test.ts
git commit -m "feat: add useVoiceInput hook for speech recognition"
```

---

## Task 10: useVoiceOutput Hook

**Files:**
- Create: `client/src/hooks/use-voice-output.ts`
- Create: `client/src/hooks/use-voice-output.test.ts`

- [ ] **Step 1: Write failing tests**

`client/src/hooks/use-voice-output.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceOutput } from "./use-voice-output";

const mockSpeak = vi.fn();
const mockCancel = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(globalThis, "speechSynthesis", {
    value: {
      speak: mockSpeak,
      cancel: mockCancel,
      speaking: false,
    },
    writable: true,
  });
  (globalThis as any).SpeechSynthesisUtterance = class {
    text = "";
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  };
});

describe("useVoiceOutput", () => {
  it("speaks text", () => {
    const { result } = renderHook(() => useVoiceOutput());
    act(() => {
      result.current.speak("hello");
    });
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("cancels speech", () => {
    const { result } = renderHook(() => useVoiceOutput());
    act(() => {
      result.current.cancel();
    });
    expect(mockCancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/hooks/use-voice-output.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the hook**

`client/src/hooks/use-voice-output.ts`:
```typescript
import { useState, useCallback } from "react";

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in globalThis)) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, cancel };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/hooks/use-voice-output.test.ts`
Expected: All 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/use-voice-output.ts client/src/hooks/use-voice-output.test.ts
git commit -m "feat: add useVoiceOutput hook for speech synthesis"
```

---

## Task 11: useAudioAnalyser Hook

**Files:**
- Create: `client/src/hooks/use-audio-analyser.ts`
- Create: `client/src/hooks/use-audio-analyser.test.ts`

- [ ] **Step 1: Write failing tests**

`client/src/hooks/use-audio-analyser.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioAnalyser } from "./use-audio-analyser";

const mockAnalyser = {
  fftSize: 0,
  frequencyBinCount: 64,
  getByteFrequencyData: vi.fn(),
};

const mockSource = { connect: vi.fn() };

const mockAudioContext = {
  createAnalyser: vi.fn(() => mockAnalyser),
  createMediaStreamSource: vi.fn(() => mockSource),
  close: vi.fn(),
  state: "running",
};

beforeEach(() => {
  vi.resetAllMocks();
  (globalThis as any).AudioContext = vi.fn(() => mockAudioContext);
  (globalThis as any).navigator = {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue("mock-stream"),
    },
  };
});

describe("useAudioAnalyser", () => {
  it("starts and connects to mic stream", async () => {
    const { result } = renderHook(() => useAudioAnalyser());
    await act(async () => {
      await result.current.start();
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith("mock-stream");
    expect(mockSource.connect).toHaveBeenCalledWith(mockAnalyser);
    expect(result.current.analyserNode).toBe(mockAnalyser);
  });

  it("stops and cleans up", async () => {
    const { result } = renderHook(() => useAudioAnalyser());
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      result.current.stop();
    });
    expect(mockAudioContext.close).toHaveBeenCalled();
    expect(result.current.analyserNode).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run src/hooks/use-audio-analyser.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the hook**

`client/src/hooks/use-audio-analyser.ts`:
```typescript
import { useState, useCallback, useRef } from "react";

export function useAudioAnalyser() {
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);
    setAnalyserNode(analyser);
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    setAnalyserNode(null);
  }, []);

  return { analyserNode, start, stop };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run src/hooks/use-audio-analyser.test.ts`
Expected: All 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/use-audio-analyser.ts client/src/hooks/use-audio-analyser.test.ts
git commit -m "feat: add useAudioAnalyser hook for mic waveform data"
```

---

## Task 12: UI Components — MessageBubble, ChatHistory, StatusIndicator

**Files:**
- Create: `client/src/components/message-bubble.tsx`
- Create: `client/src/components/chat-history.tsx`
- Create: `client/src/components/status-indicator.tsx`
- Create: `client/src/components/message-bubble.test.tsx`
- Create: `client/src/components/chat-history.test.tsx`

- [ ] **Step 1: Write failing test for MessageBubble**

`client/src/components/message-bubble.test.tsx`:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./message-bubble";

describe("MessageBubble", () => {
  it("renders user message with correct content", () => {
    render(
      <MessageBubble
        message={{ id: "1", conversation_id: "c1", role: "user", content: "Hello Nala", created_at: "" }}
      />
    );
    expect(screen.getByText("Hello Nala")).toBeDefined();
  });

  it("renders assistant message", () => {
    render(
      <MessageBubble
        message={{ id: "2", conversation_id: "c1", role: "assistant", content: "Hi there!", created_at: "" }}
      />
    );
    expect(screen.getByText("Hi there!")).toBeDefined();
  });

  it("applies different styles for user vs assistant", () => {
    const { container: userContainer } = render(
      <MessageBubble
        message={{ id: "1", conversation_id: "c1", role: "user", content: "test", created_at: "" }}
      />
    );
    const { container: assistantContainer } = render(
      <MessageBubble
        message={{ id: "2", conversation_id: "c1", role: "assistant", content: "test", created_at: "" }}
      />
    );
    const userBubble = userContainer.firstElementChild as HTMLElement;
    const assistantBubble = assistantContainer.firstElementChild as HTMLElement;
    expect(userBubble.className).not.toBe(assistantBubble.className);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/message-bubble.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement MessageBubble**

`client/src/components/message-bubble.tsx`:
```tsx
import type { Message } from "@nala/shared";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--assistant"}`}
    >
      <p>{message.content}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/components/message-bubble.test.tsx`
Expected: All 3 tests PASS.

- [ ] **Step 5: Write failing test for ChatHistory**

`client/src/components/chat-history.test.tsx`:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatHistory } from "./chat-history";

describe("ChatHistory", () => {
  it("renders messages", () => {
    const messages = [
      { id: "1", conversation_id: "c1", role: "user" as const, content: "Hello", created_at: "" },
      { id: "2", conversation_id: "c1", role: "assistant" as const, content: "Hi!", created_at: "" },
    ];
    render(<ChatHistory messages={messages} />);
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Hi!")).toBeDefined();
  });

  it("renders empty state when no messages", () => {
    render(<ChatHistory messages={[]} />);
    expect(screen.getByText(/start a conversation/i)).toBeDefined();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/chat-history.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 7: Implement ChatHistory**

`client/src/components/chat-history.tsx`:
```tsx
import { useEffect, useRef } from "react";
import type { Message } from "@nala/shared";
import { MessageBubble } from "./message-bubble";

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <p className="chat-history__empty">Tap the mic to start a conversation with Nala</p>
      ) : (
        messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd client && npx vitest run src/components/chat-history.test.tsx`
Expected: All 2 tests PASS.

- [ ] **Step 9: Implement StatusIndicator (no test — pure presentational)**

`client/src/components/status-indicator.tsx`:
```tsx
export type Status = "idle" | "listening" | "thinking";

interface StatusIndicatorProps {
  status: Status;
}

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  listening: "Listening...",
  thinking: "Thinking...",
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div className="status-indicator">
      <span>{STATUS_TEXT[status]}</span>
    </div>
  );
}
```

- [ ] **Step 10: Run all client tests**

Run: `cd client && npx vitest run`
Expected: All tests PASS.

- [ ] **Step 11: Commit**

```bash
git add client/src/components/message-bubble.tsx client/src/components/message-bubble.test.tsx \
       client/src/components/chat-history.tsx client/src/components/chat-history.test.tsx \
       client/src/components/status-indicator.tsx
git commit -m "feat: add MessageBubble, ChatHistory, and StatusIndicator components"
```

---

## Task 13: UI Components — Sidebar (ConversationSidebar, ConversationList, ConversationItem, NewConversationButton)

**Files:**
- Create: `client/src/components/conversation-item.tsx`
- Create: `client/src/components/conversation-list.tsx`
- Create: `client/src/components/conversation-sidebar.tsx`
- Create: `client/src/components/new-conversation-button.tsx`
- Create: `client/src/components/conversation-sidebar.test.tsx`

- [ ] **Step 1: Write failing test for the sidebar**

`client/src/components/conversation-sidebar.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversationSidebar } from "./conversation-sidebar";

describe("ConversationSidebar", () => {
  const conversations = [
    { id: "1", user_id: "u1", title: "First Chat", created_at: "2026-03-19T10:00:00Z", updated_at: "2026-03-19T10:00:00Z" },
    { id: "2", user_id: "u1", title: null, created_at: "2026-03-19T11:00:00Z", updated_at: "2026-03-19T11:00:00Z" },
  ];

  it("renders conversation titles", () => {
    render(
      <ConversationSidebar
        conversations={conversations}
        selectedId="1"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("First Chat")).toBeDefined();
    expect(screen.getByText("New Conversation")).toBeDefined(); // fallback for null title
  });

  it("calls onSelect when clicking a conversation", () => {
    const onSelect = vi.fn();
    render(
      <ConversationSidebar
        conversations={conversations}
        selectedId="1"
        onSelect={onSelect}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("First Chat"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("calls onCreate when clicking new button", () => {
    const onCreate = vi.fn();
    render(
      <ConversationSidebar
        conversations={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onCreate={onCreate}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(onCreate).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/conversation-sidebar.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement ConversationItem**

`client/src/components/conversation-item.tsx`:
```tsx
import type { Conversation } from "@nala/shared";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={`conversation-item ${isSelected ? "conversation-item--selected" : ""}`}
      onClick={() => onSelect(conversation.id)}
    >
      <span className="conversation-item__title">
        {conversation.title || "New Conversation"}
      </span>
      <button
        className="conversation-item__delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        aria-label="Delete conversation"
      >
        &times;
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Implement ConversationList**

`client/src/components/conversation-list.tsx`:
```tsx
import type { Conversation } from "@nala/shared";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="conversation-list">
      {conversations.map((convo) => (
        <ConversationItem
          key={convo.id}
          conversation={convo}
          isSelected={convo.id === selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement NewConversationButton**

`client/src/components/new-conversation-button.tsx`:
```tsx
interface NewConversationButtonProps {
  onCreate: () => void;
}

export function NewConversationButton({ onCreate }: NewConversationButtonProps) {
  return (
    <button className="new-conversation-button" onClick={onCreate} aria-label="New conversation">
      + New
    </button>
  );
}
```

- [ ] **Step 6: Implement ConversationSidebar**

`client/src/components/conversation-sidebar.tsx`:
```tsx
import type { Conversation } from "@nala/shared";
import { ConversationList } from "./conversation-list";
import { NewConversationButton } from "./new-conversation-button";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: ConversationSidebarProps) {
  return (
    <aside className="conversation-sidebar">
      <div className="conversation-sidebar__header">
        <h2>Nala</h2>
        <NewConversationButton onCreate={onCreate} />
      </div>
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    </aside>
  );
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd client && npx vitest run src/components/conversation-sidebar.test.tsx`
Expected: All 3 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/conversation-item.tsx client/src/components/conversation-list.tsx \
       client/src/components/new-conversation-button.tsx client/src/components/conversation-sidebar.tsx \
       client/src/components/conversation-sidebar.test.tsx
git commit -m "feat: add conversation sidebar components with tests"
```

---

## Task 14: Waveform Component

**Files:**
- Create: `client/src/components/waveform.tsx`
- Create: `client/src/components/waveform.test.tsx`

- [ ] **Step 1: Write failing test**

`client/src/components/waveform.test.tsx`:
```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Waveform } from "./waveform";

describe("Waveform", () => {
  it("renders canvas when mode is recording", () => {
    const { container } = render(<Waveform mode="recording" analyserNode={null} />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("renders pulse animation when mode is thinking", () => {
    const { container } = render(<Waveform mode="thinking" analyserNode={null} />);
    expect(container.querySelector(".waveform--thinking")).not.toBeNull();
  });

  it("renders nothing when mode is idle", () => {
    const { container } = render(<Waveform mode="idle" analyserNode={null} />);
    expect(container.querySelector(".waveform")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/waveform.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement Waveform**

`client/src/components/waveform.tsx`:
```tsx
import { useEffect, useRef } from "react";

type WaveformMode = "idle" | "recording" | "thinking";

interface WaveformProps {
  mode: WaveformMode;
  analyserNode: AnalyserNode | null;
}

export function Waveform({ mode, analyserNode }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (mode !== "recording" || !analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6366f1";

      const barWidth = canvas.width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillRect(
          i * barWidth,
          canvas.height - barHeight,
          barWidth - 1,
          barHeight
        );
      }
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [mode, analyserNode]);

  if (mode === "idle") return null;

  if (mode === "thinking") {
    return (
      <div className="waveform waveform--thinking">
        <div className="waveform__pulse" />
      </div>
    );
  }

  return (
    <div className="waveform waveform--recording">
      <canvas ref={canvasRef} width={300} height={60} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/components/waveform.test.tsx`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/waveform.tsx client/src/components/waveform.test.tsx
git commit -m "feat: add Waveform component with recording and thinking modes"
```

---

## Task 15: VoiceControls and MicButton Components

**Files:**
- Create: `client/src/components/mic-button.tsx`
- Create: `client/src/components/voice-controls.tsx`
- Create: `client/src/components/mic-button.test.tsx`

- [ ] **Step 1: Write failing test for MicButton**

`client/src/components/mic-button.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MicButton } from "./mic-button";

describe("MicButton", () => {
  it("renders with mic icon", () => {
    render(<MicButton isRecording={false} onClick={vi.fn()} disabled={false} />);
    expect(screen.getByRole("button", { name: /mic/i })).toBeDefined();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<MicButton isRecording={false} onClick={onClick} disabled={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("shows recording state", () => {
    const { container } = render(
      <MicButton isRecording={true} onClick={vi.fn()} disabled={false} />
    );
    expect(container.querySelector(".mic-button--recording")).not.toBeNull();
  });

  it("is disabled when disabled prop is true", () => {
    render(<MicButton isRecording={false} onClick={vi.fn()} disabled={true} />);
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/mic-button.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement MicButton**

`client/src/components/mic-button.tsx`:
```tsx
interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function MicButton({ isRecording, onClick, disabled }: MicButtonProps) {
  return (
    <button
      className={`mic-button ${isRecording ? "mic-button--recording" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isRecording ? "Stop mic" : "Start mic"}
    >
      {isRecording ? "⏹" : "🎤"}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/components/mic-button.test.tsx`
Expected: All 4 tests PASS.

- [ ] **Step 5: Implement VoiceControls (thin wrapper, no separate test)**

`client/src/components/voice-controls.tsx`:
```tsx
import { MicButton } from "./mic-button";

interface VoiceControlsProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export function VoiceControls({ isRecording, onToggle, disabled }: VoiceControlsProps) {
  return (
    <div className="voice-controls">
      <MicButton isRecording={isRecording} onClick={onToggle} disabled={disabled} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/components/mic-button.tsx client/src/components/mic-button.test.tsx \
       client/src/components/voice-controls.tsx
git commit -m "feat: add MicButton and VoiceControls components"
```

---

## Task 16: ModelLoader Component

**Files:**
- Create: `client/src/components/model-loader.tsx`
- Create: `client/src/components/model-loader.test.tsx`

- [ ] **Step 1: Write failing test**

`client/src/components/model-loader.test.tsx`:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelLoader } from "./model-loader";

describe("ModelLoader", () => {
  it("shows progress bar", () => {
    render(<ModelLoader progress={0.5} error={null} />);
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  it("shows error message with retry", () => {
    render(<ModelLoader progress={0} error="WebGPU not supported" />);
    expect(screen.getByText(/WebGPU not supported/)).toBeDefined();
  });

  it("shows loading text", () => {
    render(<ModelLoader progress={0.3} error={null} />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd client && npx vitest run src/components/model-loader.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement ModelLoader**

`client/src/components/model-loader.tsx`:
```tsx
interface ModelLoaderProps {
  progress: number;
  error: string | null;
}

export function ModelLoader({ progress, error }: ModelLoaderProps) {
  return (
    <div className="model-loader">
      <h1>Nala</h1>
      <p className="model-loader__subtitle">Voice Assistant</p>

      {error ? (
        <div className="model-loader__error">
          <p>{error}</p>
          <p>Nala requires Chrome 113+ with WebGPU enabled.</p>
        </div>
      ) : (
        <>
          <p className="model-loader__status">Loading AI model...</p>
          <div
            className="model-loader__progress"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="model-loader__progress-bar"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="model-loader__percent">{Math.round(progress * 100)}%</p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd client && npx vitest run src/components/model-loader.test.tsx`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/model-loader.tsx client/src/components/model-loader.test.tsx
git commit -m "feat: add ModelLoader component with progress bar and error state"
```

---

## Task 17: MainPanel and App Shell

**Files:**
- Create: `client/src/components/main-panel.tsx`
- Create: `client/src/components/app.tsx`
- Modify: `client/src/main.tsx`
- Modify: `client/src/index.css` (add all styles)

- [ ] **Step 1: Implement MainPanel**

`client/src/components/main-panel.tsx`:
```tsx
import type { ReactNode } from "react";

interface MainPanelProps {
  children: ReactNode;
}

export function MainPanel({ children }: MainPanelProps) {
  return <main className="main-panel">{children}</main>;
}
```

- [ ] **Step 2: Implement App component**

`client/src/components/app.tsx`:
```tsx
import { useState, useEffect, useCallback } from "react";
import { ConversationSidebar } from "./conversation-sidebar";
import { MainPanel } from "./main-panel";
import { ChatHistory } from "./chat-history";
import { StatusIndicator } from "./status-indicator";
import type { Status } from "./status-indicator";
import { Waveform } from "./waveform";
import { VoiceControls } from "./voice-controls";
import { ModelLoader } from "./model-loader";
import { useConversations } from "../hooks/use-conversations";
import { useMessages } from "../hooks/use-messages";
import { useWebLLM } from "../hooks/use-web-llm";
import { useVoiceInput } from "../hooks/use-voice-input";
import { useVoiceOutput } from "../hooks/use-voice-output";
import { useAudioAnalyser } from "../hooks/use-audio-analyser";

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { conversations, create, remove, updateTitle } = useConversations();
  const { messages, isGenerating, sendMessage } = useMessages(selectedId);
  const webLLM = useWebLLM();
  const voiceInput = useVoiceInput();
  const voiceOutput = useVoiceOutput();
  const audioAnalyser = useAudioAnalyser();

  // Initialize WebLLM on mount
  useEffect(() => {
    webLLM.init();
  }, []);

  // When voice input completes, send the message
  useEffect(() => {
    if (!voiceInput.isListening && voiceInput.transcript && selectedId) {
      const transcript = voiceInput.transcript;
      audioAnalyser.stop();

      sendMessage(transcript, webLLM.generate).then(() => {
        // Auto-title on first message
        if (messages.length === 0) {
          const title = transcript.slice(0, 50);
          updateTitle(selectedId, title);
        }
      });
    }
  }, [voiceInput.isListening, voiceInput.transcript]);

  // Speak assistant response
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        voiceOutput.speak(lastMessage.content);
      }
    }
  }, [messages]);

  const handleToggleMic = useCallback(async () => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();
    } else {
      // Ensure a conversation exists
      let convoId = selectedId;
      if (!convoId) {
        const convo = await create();
        convoId = convo.id;
        setSelectedId(convo.id);
      }
      await audioAnalyser.start();
      voiceInput.startListening();
    }
  }, [voiceInput.isListening, selectedId]);

  const handleCreate = useCallback(async () => {
    const convo = await create();
    setSelectedId(convo.id);
  }, [create]);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
      if (selectedId === id) setSelectedId(null);
    },
    [remove, selectedId]
  );

  // Determine current status
  let status: Status = "idle";
  if (voiceInput.isListening) status = "listening";
  else if (isGenerating) status = "thinking";

  // Determine waveform mode
  let waveformMode: "idle" | "recording" | "thinking" = "idle";
  if (voiceInput.isListening) waveformMode = "recording";
  else if (isGenerating) waveformMode = "thinking";

  // Gate on model loading
  if (!webLLM.isReady) {
    return <ModelLoader progress={webLLM.loadProgress} error={webLLM.error} />;
  }

  return (
    <div className="app">
      <ConversationSidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
      <MainPanel>
        <ChatHistory messages={messages} />
        <StatusIndicator status={status} />
        <Waveform mode={waveformMode} analyserNode={audioAnalyser.analyserNode} />
        <VoiceControls
          isRecording={voiceInput.isListening}
          onToggle={handleToggleMic}
          disabled={isGenerating}
        />
      </MainPanel>
    </div>
  );
}
```

- [ ] **Step 3: Update main.tsx to use App component**

`client/src/main.tsx`:
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/app";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Add complete CSS styles**

Replace `client/src/index.css` with full styles:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  font-family: system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
  background: #fafafa;
  --sidebar-width: 280px;
  --primary: #6366f1;
  --primary-light: #818cf8;
  --bg-dark: #1e1e2e;
  --bg-card: #ffffff;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --radius: 12px;
}

body {
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}

/* Layout */
.app {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.conversation-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-dark);
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
}

.conversation-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.conversation-sidebar__header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.new-conversation-button {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.new-conversation-button:hover {
  background: var(--primary-light);
}

/* Conversation List */
.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
}

.conversation-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.conversation-item--selected {
  background: rgba(255, 255, 255, 0.12);
}

.conversation-item__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
}

.conversation-item__delete {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  font-size: 1.125rem;
  padding: 0 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.conversation-item:hover .conversation-item__delete {
  opacity: 1;
}

.conversation-item__delete:hover {
  color: #ef4444;
}

/* Main Panel */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Chat History */
.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-history__empty {
  margin: auto;
  color: var(--text-muted);
  font-size: 1rem;
}

/* Message Bubble */
.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: var(--radius);
  line-height: 1.5;
  font-size: 0.9375rem;
}

.message-bubble--user {
  align-self: flex-end;
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-bubble--assistant {
  align-self: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

/* Status Indicator */
.status-indicator {
  text-align: center;
  padding: 8px;
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Waveform */
.waveform {
  display: flex;
  justify-content: center;
  padding: 8px 24px;
}

.waveform--thinking {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.waveform__pulse {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
}

.waveform canvas {
  border-radius: 8px;
}

/* Voice Controls */
.voice-controls {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.mic-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

.mic-button:hover:not(:disabled) {
  transform: scale(1.05);
  background: var(--primary-light);
}

.mic-button--recording {
  background: #ef4444;
  animation: recording-pulse 1s ease-in-out infinite;
}

@keyframes recording-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
}

.mic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Model Loader */
.model-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
}

.model-loader h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
}

.model-loader__subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.model-loader__status {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.model-loader__progress {
  width: 300px;
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.model-loader__progress-bar {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.model-loader__percent {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.model-loader__error {
  text-align: center;
  color: #ef4444;
  max-width: 400px;
}
```

- [ ] **Step 5: Run all client tests**

Run: `cd client && npx vitest run`
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/main-panel.tsx client/src/components/app.tsx \
       client/src/main.tsx client/src/index.css
git commit -m "feat: wire up App shell with all components, hooks, and styles"
```

---

## Task 18: Database Setup and Manual Verification

**Files:** None new — this task sets up the database and does end-to-end verification.

- [ ] **Step 1: Create the production database**

Run: `createdb nala`

- [ ] **Step 2: Run the migration**

Run: `psql nala -f server/src/db/migrations/001-initial-schema.sql`
Expected: CREATE TABLE (x3), CREATE INDEX (x3), INSERT 0 1.

- [ ] **Step 3: Start server and client**

Terminal 1: `cd server && npm run dev`
Expected: "Nala server running on port 3001"

Terminal 2: `cd client && npm run dev`
Expected: Vite dev server on http://localhost:5173

- [ ] **Step 4: Manual smoke test**

Open http://localhost:5173 in Chrome 113+:
1. Model loading screen appears with progress bar
2. After model loads, sidebar + main panel appear
3. Click "+ New" to create a conversation
4. Click mic button, speak a phrase
5. Waveform animates while speaking
6. Thinking pulse appears while LLM generates
7. Assistant response appears in chat
8. Browser speaks the response aloud
9. Conversation title appears in sidebar
10. Refresh page — conversation persists

- [ ] **Step 5: Run full test suite**

Run: `cd server && DATABASE_URL=postgresql://localhost:5432/nala_test npx vitest run`
Expected: All server tests PASS.

Run: `npm run test:client`
Expected: All client tests PASS.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Nala voice assistant MVP"
```
