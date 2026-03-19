import { useState, useEffect, useCallback } from "react";
import type { Message } from "@nala/shared";
import * as api from "../services/api";

type GenerateFn = (messages: Message[]) => Promise<string>;

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    api.getConversation(conversationId).then((data) => {
      setMessages(data.messages);
      setIsLoading(false);
    });
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, generate: GenerateFn) => {
      if (!conversationId) return;

      const userMessage = await api.createMessage(
        conversationId,
        "user",
        content
      );
      setMessages((prev) => [...prev, userMessage]);

      setIsGenerating(true);
      try {
        const allMessages = [...messages, userMessage];
        const response = await generate(allMessages);

        const assistantMessage = await api.createMessage(
          conversationId,
          "assistant",
          response
        );
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsGenerating(false);
      }
    },
    [conversationId, messages]
  );

  return { messages, isLoading, isGenerating, sendMessage };
}
