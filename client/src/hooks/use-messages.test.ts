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
