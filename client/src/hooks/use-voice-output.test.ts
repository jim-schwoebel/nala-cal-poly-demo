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
