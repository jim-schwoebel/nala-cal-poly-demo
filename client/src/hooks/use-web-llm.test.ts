import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWebLLM } from "./use-web-llm";

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
