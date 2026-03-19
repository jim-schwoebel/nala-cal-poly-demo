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
