import { useState, useCallback, useRef } from "react";
import type { Message } from "@nala/shared";
import { CreateMLCEngine, type MLCEngine, type InitProgressReport } from "@mlc-ai/web-llm";

const MODEL_ID = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

const SYSTEM_PROMPT =
  "You are Nala, a friendly and helpful voice assistant. Keep responses concise and conversational since they will be spoken aloud.";

export function useWebLLM() {
  const engineRef = useRef<MLCEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    try {
      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: InitProgressReport) => {
          setLoadProgress(report.progress);
        },
      });
      engineRef.current = engine;
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
    }
  }, []);

  const generate = useCallback(async (messages: Message[]): Promise<string> => {
    if (!engineRef.current) throw new Error("Engine not initialized");

    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await engineRef.current.chat.completions.create({
      messages: chatMessages,
    });

    return response.choices[0].message.content || "";
  }, []);

  return { init, generate, isReady, loadProgress, error };
}
