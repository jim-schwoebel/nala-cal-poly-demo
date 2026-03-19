import { useState, useCallback, useRef } from "react";

export function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onDoneRef = useRef<(() => void) | null>(null);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!("speechSynthesis" in globalThis)) {
      onDone?.();
      return;
    }

    onDoneRef.current = onDone || null;
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

  const cancel = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, cancel };
}
