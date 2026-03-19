import type { Conversation, Message, MessageRole } from "@nala/shared";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function createConversation(): Promise<Conversation> {
  return request("/conversations", {
    method: "POST",
    body: "{}",
  });
}

export async function listConversations(): Promise<Conversation[]> {
  const data = await request<{ conversations: Conversation[] }>("/conversations");
  return data.conversations;
}

export async function getConversation(
  id: string
): Promise<Conversation & { messages: Message[] }> {
  return request(`/conversations/${id}`);
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<Conversation> {
  return request(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  return request(`/conversations/${id}`, { method: "DELETE" });
}

export async function createMessage(
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ role, content }),
  });
}
