import type { Conversation, Message, MessageRole } from "@nala/shared";
import { pool } from "./connection";

export async function createConversation(
  userId: string
): Promise<Conversation> {
  const result = await pool.query(
    `INSERT INTO conversations (user_id) VALUES ($1)
     RETURNING id, user_id, title, created_at, updated_at`,
    [userId]
  );
  return result.rows[0];
}

export async function listConversations(
  userId: string
): Promise<Conversation[]> {
  const result = await pool.query(
    `SELECT id, user_id, title, created_at, updated_at
     FROM conversations WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getConversation(
  id: string
): Promise<(Conversation & { messages: Message[] }) | null> {
  const convoResult = await pool.query(
    `SELECT id, user_id, title, created_at, updated_at
     FROM conversations WHERE id = $1`,
    [id]
  );
  if (convoResult.rows.length === 0) return null;

  const messages = await getMessages(id);
  return { ...convoResult.rows[0], messages };
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<Conversation | null> {
  const result = await pool.query(
    `UPDATE conversations SET title = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, user_id, title, created_at, updated_at`,
    [title, id]
  );
  return result.rows[0] || null;
}

export async function deleteConversation(id: string): Promise<void> {
  await pool.query("DELETE FROM conversations WHERE id = $1", [id]);
}

export async function createMessage(
  conversationId: string,
  role: MessageRole,
  content: string
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, conversation_id, role, content, created_at`,
    [conversationId, role, content]
  );

  await pool.query(
    "UPDATE conversations SET updated_at = now() WHERE id = $1",
    [conversationId]
  );

  return result.rows[0];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const result = await pool.query(
    `SELECT id, conversation_id, role, content, created_at
     FROM messages WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );
  return result.rows;
}
