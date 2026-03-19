import { useEffect, useRef } from "react";
import type { Message } from "@nala/shared";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

const STARTER_PROMPTS = [
  { emoji: "👋", text: "Introduce yourself" },
  { emoji: "💡", text: "Creative project idea" },
  { emoji: "📚", text: "Book recommendation" },
];

interface ChatHistoryProps {
  messages: Message[];
  isGenerating?: boolean;
  isSpeaking?: boolean;
  onPromptSelect?: (prompt: string) => void;
}

export function ChatHistory({ messages, isGenerating, isSpeaking, onPromptSelect }: ChatHistoryProps) {
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
        <div className="welcome">
          <p className="welcome__heading">Try asking Nala something</p>
          <div className="welcome__prompts">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                className="prompt-chip"
                onClick={() => onPromptSelect?.(prompt.text)}
              >
                <span className="prompt-chip__emoji">{prompt.emoji}</span>
                {prompt.text}
              </button>
            ))}
          </div>
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
