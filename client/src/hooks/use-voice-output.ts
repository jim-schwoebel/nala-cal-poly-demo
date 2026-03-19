import { useState, useCallback, useRef } from "react";
import { KokoroTTS } from "kokoro-js";

let ttsInstance: KokoroTTS | null = null;
let ttsLoadFailed = false;
let ttsLoading = false;
const ttsReadyCallbacks: ((tts: KokoroTTS | null) => void)[] = [];

async function getTTS(): Promise<KokoroTTS | null> {
  if (ttsLoadFailed) return null;
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
    console.warn("[Nala TTS] Kokoro failed to load, falling back to Web Speech API:", err);
    ttsLoadFailed = true;
    ttsLoading = false;
    ttsReadyCallbacks.forEach((cb) => cb(null));
    ttsReadyCallbacks.length = 0;
    return null;
  }
}

function speakWithWebSpeech(text: string, onEnd: () => void) {
  if (!("speechSynthesis" in globalThis)) {
    onEnd();
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  speechSynthesis.speak(utterance);
}

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const onDoneRef = useRef<(() => void) | null>(null);

  const speak = useCallback(async (text: string, onDone?: () => void) => {
    onDoneRef.current = onDone || null;

    try {
      setIsLoading(true);
      const tts = await getTTS();
      setIsLoading(false);

      // Fallback to Web Speech API if Kokoro failed to load
      if (!tts) {
        setIsSpeaking(true);
        speakWithWebSpeech(text, () => {
          setIsSpeaking(false);
          onDoneRef.current?.();
        });
        return;
      }

      console.log("[Nala TTS] Generating speech...");
      const result = await tts.generate(text, { voice: "af_heart" });
      console.log("[Nala TTS] Speech generated, playing audio");

      // Stop any currently playing audio
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }

      // Play using AudioContext for maximum compatibility
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const audioCtx = audioContextRef.current;

      // Resume context if suspended (browser autoplay policy)
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      // Convert RawAudio WAV to AudioBuffer
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
      console.error("[Nala TTS] Error:", err);
      setIsLoading(false);

      // Fallback to Web Speech API on any error
      setIsSpeaking(true);
      speakWithWebSpeech(text, () => {
        setIsSpeaking(false);
        onDoneRef.current?.();
      });
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
