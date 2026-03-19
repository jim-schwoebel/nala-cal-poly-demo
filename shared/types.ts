export type MessageRole = "user" | "assistant";

export interface User {
  id: string;
  name: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ApiError {
  error: string;
  code: string;
}
