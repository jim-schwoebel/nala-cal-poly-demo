import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./message-bubble";

describe("MessageBubble", () => {
  it("renders user message with correct content", () => {
    render(
      <MessageBubble
        message={{ id: "1", conversation_id: "c1", role: "user", content: "Hello Nala", created_at: "" }}
      />
    );
    expect(screen.getByText("Hello Nala")).toBeDefined();
  });

  it("renders assistant message", () => {
    render(
      <MessageBubble
        message={{ id: "2", conversation_id: "c1", role: "assistant", content: "Hi there!", created_at: "" }}
      />
    );
    expect(screen.getByText("Hi there!")).toBeDefined();
  });

  it("applies different styles for user vs assistant", () => {
    const { container: userContainer } = render(
      <MessageBubble
        message={{ id: "1", conversation_id: "c1", role: "user", content: "test", created_at: "" }}
      />
    );
    const { container: assistantContainer } = render(
      <MessageBubble
        message={{ id: "2", conversation_id: "c1", role: "assistant", content: "test", created_at: "" }}
      />
    );
    const userBubble = userContainer.firstElementChild as HTMLElement;
    const assistantBubble = assistantContainer.firstElementChild as HTMLElement;
    expect(userBubble.className).not.toBe(assistantBubble.className);
  });
});
