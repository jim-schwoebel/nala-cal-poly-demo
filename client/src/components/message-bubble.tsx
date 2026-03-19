import type { Message } from "@nala/shared";

interface MessageBubbleProps {
  message: Message;
  isSpeaking?: boolean;
}

export function MessageBubble({ message, isSpeaking }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--assistant"} ${isSpeaking ? "message-bubble--speaking" : ""}`}
    >
      <p>{message.content}</p>
    </div>
  );
}
