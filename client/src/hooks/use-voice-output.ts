import { useState, useCallback, useRef } from "react";
import { KokoroTTS } from "kokoro-js";

const USE_KOKORO = import.meta.env.VITE_TTS === "kokoro";

let ttsInstance: KokoroTTS | null = null;
let ttsLoading = false;
const ttsReadyCallbacks: ((tts: KokoroTTS | null) => void)[] = [];

async function getTTS(): Promise<KokoroTTS | null> {
  if (ttsInstance) return ttsInstance;

  if (ttsLoading) {
    return new Promise((resolve) => {
      ttsReadyCallbacks.push(resolve);
    });
  }

  ttsLoading = true;
  try {
    console.log("[Nala TTS] Loading Kokoro model...");
    ttsInstance = await KokoroTTS.from_pretrained(
      "onnx-community/Kokoro-82M-v1.0-ONNX",
      { dtype: "q8", device: "wasm" }
    );
    console.log("[Nala TTS] Kokoro model loaded successfully");
    ttsLoading = false;
    ttsReadyCallbacks.forEach((cb) => cb(ttsInstance));
    ttsReadyCallbacks.length = 0;
    return ttsInstance;
  } catch (err) {
    console.warn("[Nala TTS] Kokoro failed to load:", err);
    ttsLoading = false;
    ttsReadyCallbacks.forEach((cb) => cb(null));
    ttsReadyCallbacks.length = 0;
    return null;
  }
}

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const onDoneRef = useRef<(() => void) | null>(null);

  const speakWithWebSpeech = useCallback((text: string) => {
    if (!("speechSynthesis" in globalThis)) {
      setIsSpeaking(false);
      onDoneRef.current?.();
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsSpeaking(false);
      onDoneRef.current?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onDoneRef.current?.();
    };
    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  }, []);

  const speakWithKokoro = useCallback(async (text: string) => {
    try {
      setIsLoading(true);
      const tts = await getTTS();
      setIsLoading(false);

      if (!tts) {
        // Fallback to Web Speech if Kokoro fails
        speakWithWebSpeech(text);
        return;
      }

      const result = await tts.generate(text, { voice: "af_heart" });

      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const audioCtx = audioContextRef.current;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const wavBuffer = result.toWav();
      const audioBuffer = await audioCtx.decodeAudioData(wavBuffer);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      sourceRef.current = source;

      source.onended = () => {
        sourceRef.current = null;
        setIsSpeaking(false);
        onDoneRef.current?.();
      };

      setIsSpeaking(true);
      source.start(0);
    } catch (err) {
      console.error("[Nala TTS] Kokoro error, falling back:", err);
      setIsLoading(false);
      speakWithWebSpeech(text);
    }
  }, []);

  const speak = useCallback(async (text: string, onDone?: () => void) => {
    onDoneRef.current = onDone || null;

    if (USE_KOKORO) {
      await speakWithKokoro(text);
    } else {
      speakWithWebSpeech(text);
    }
  }, []);

  const cancel = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    if ("speechSynthesis" in globalThis) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, isLoading, cancel };
}
