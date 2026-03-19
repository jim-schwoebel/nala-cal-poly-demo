import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatHistory } from "./chat-history";

describe("ChatHistory", () => {
  it("renders messages", () => {
    const messages = [
      { id: "1", conversation_id: "c1", role: "user" as const, content: "Hello", created_at: "" },
      { id: "2", conversation_id: "c1", role: "assistant" as const, content: "Hi!", created_at: "" },
    ];
    render(<ChatHistory messages={messages} />);
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Hi!")).toBeDefined();
  });

  it("renders empty state when no messages", () => {
    render(<ChatHistory messages={[]} />);
    expect(screen.getByText(/start a conversation/i)).toBeDefined();
  });
});
