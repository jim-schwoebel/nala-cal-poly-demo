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
