import { useEffect, useRef } from "react";
import type { Message } from "@nala/shared";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { NalaLogo } from "./nala-logo";

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

  const lastAssistantIdx = isSpeaking
    ? messages.map((m) => m.role).lastIndexOf("assistant")
    : -1;

  return (
    <div className="chat-history">
      {messages.length === 0 && !isGenerating ? (
        <div className="welcome">
          <NalaLogo size="lg" />
          <h1 className="welcome__heading">How can I help you today?</h1>
          <p className="welcome__sub">
            Tap the mic to start talking, or try one of these
          </p>
          <div className="welcome__prompts">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                className="prompt-card"
                onClick={() => onPromptSelect?.(prompt.text)}
              >
                <span className="prompt-card__emoji">{prompt.emoji}</span>
                <span className="prompt-card__text">{prompt.text}</span>
                <svg className="prompt-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
