import { useEffect, useRef } from "react";
import type { Message } from "@nala/shared";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

interface ChatHistoryProps {
  messages: Message[];
  isGenerating?: boolean;
  isSpeaking?: boolean;
}

export function ChatHistory({ messages, isGenerating, isSpeaking }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  const lastAssistantIdx = isSpeaking
    ? messages.map((m) => m.role).lastIndexOf("assistant")
    : -1;

  return (
    <div className="chat-history">
      {messages.length === 0 && !isGenerating ? (
        <div className="chat-history__empty-hint">
          <p>Your conversation will appear here</p>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSpeaking={i === lastAssistantIdx}
            />
          ))}
          {isGenerating && <TypingIndicator />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
