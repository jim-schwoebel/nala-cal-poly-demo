import { useState, useEffect, useCallback } from "react";
import type { Conversation } from "@nala/shared";
import * as api from "../services/api";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.listConversations().then((data) => {
      setConversations(data);
      setIsLoading(false);
    });
  }, []);

  const create = useCallback(async () => {
    const conversation = await api.createConversation();
    setConversations((prev) => [conversation, ...prev]);
    return conversation;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateTitle = useCallback(async (id: string, title: string) => {
    const updated = await api.updateConversationTitle(id, title);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  }, []);

  return { conversations, isLoading, create, remove, updateTitle };
}
