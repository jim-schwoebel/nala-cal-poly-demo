import { useEffect, useRef } from "react";
import type { Message } from "@nala/shared";
import { MessageBubble } from "./message-bubble";

const STARTER_PROMPTS = [
  { emoji: "👋", text: "Tell me about yourself, Nala" },
  { emoji: "🌤️", text: "What should I do on a sunny day?" },
  { emoji: "💡", text: "Give me a creative project idea" },
  { emoji: "📚", text: "Recommend a book for me" },
  { emoji: "🎵", text: "Suggest some music to listen to" },
  { emoji: "🧠", text: "Tell me an interesting fact" },
];

interface ChatHistoryProps {
  messages: Message[];
  onPromptSelect?: (prompt: string) => void;
}

export function ChatHistory({ messages, onPromptSelect }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <div className="chat-history__welcome">
          <h1 className="chat-history__title">Hi, I'm Nala</h1>
          <p className="chat-history__subtitle">
            Tap the mic and start talking, or pick a topic below
          </p>
          <div className="chat-history__prompts">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                className="chat-history__prompt"
                onClick={() => onPromptSelect?.(prompt.text)}
              >
                <span className="chat-history__prompt-emoji">{prompt.emoji}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
}
