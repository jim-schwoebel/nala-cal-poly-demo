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
