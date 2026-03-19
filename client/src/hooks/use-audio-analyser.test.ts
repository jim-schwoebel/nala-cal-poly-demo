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
  mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser);
  mockAudioContext.createMediaStreamSource.mockReturnValue(mockSource);
  (globalThis as any).AudioContext = vi.fn(() => mockAudioContext);
  (globalThis as any).navigator = {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [] }),
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
    expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(expect.objectContaining({ getTracks: expect.any(Function) }));
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
