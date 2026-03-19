import { useEffect, useRef } from "react";
import type { Message } from "@nala/shared";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

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

  // The last assistant message is "speaking" if TTS is active
  const lastAssistantIdx = isSpeaking
    ? messages.map((m) => m.role).lastIndexOf("assistant")
    : -1;

  return (
    <div className="chat-history">
      {messages.length === 0 && !isGenerating ? (
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
