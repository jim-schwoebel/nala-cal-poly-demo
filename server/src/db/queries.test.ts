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
    await new Promise((r) => setTimeout(r, 50));
    await createMessage(convo.id, "user", "hello");
    const updated = await getConversation(convo.id);
    const after = new Date(updated!.updated_at);
    expect(after.getTime()).toBeGreaterThan(before.getTime());
  });
});
