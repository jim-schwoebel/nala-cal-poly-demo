import { useState, useCallback, useRef } from "react";
import { KokoroTTS } from "kokoro-js";

let ttsInstance: KokoroTTS | null = null;
let ttsLoading = false;
const ttsReadyCallbacks: (() => void)[] = [];

async function getTTS(): Promise<KokoroTTS> {
  if (ttsInstance) return ttsInstance;

  if (ttsLoading) {
    return new Promise((resolve) => {
      ttsReadyCallbacks.push(() => resolve(ttsInstance!));
    });
  }

  ttsLoading = true;
  ttsInstance = await KokoroTTS.from_pretrained(
    "onnx-community/Kokoro-82M-v1.0-ONNX",
    { dtype: "q8", device: "wasm" }
  );
  ttsLoading = false;
  ttsReadyCallbacks.forEach((cb) => cb());
  ttsReadyCallbacks.length = 0;
  return ttsInstance;
}

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onDoneRef = useRef<(() => void) | null>(null);

  const speak = useCallback(async (text: string, onDone?: () => void) => {
    onDoneRef.current = onDone || null;

    try {
      setIsLoading(true);
      const tts = await getTTS();
      setIsLoading(false);

      const result = await tts.generate(text, { voice: "af_heart" });

      // Convert to audio blob and play
      const blob = result.toBlob();
      const url = URL.createObjectURL(blob);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setIsSpeaking(false);
        onDoneRef.current?.();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        setIsSpeaking(false);
        onDoneRef.current?.();
      };

      setIsSpeaking(true);
      await audio.play();
    } catch (err) {
      console.error("Kokoro TTS error:", err);
      setIsLoading(false);
      setIsSpeaking(false);
      onDoneRef.current?.();
    }
  }, []);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, isLoading, cancel };
}
