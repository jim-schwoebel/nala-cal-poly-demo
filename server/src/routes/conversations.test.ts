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
