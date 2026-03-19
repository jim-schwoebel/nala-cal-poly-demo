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
