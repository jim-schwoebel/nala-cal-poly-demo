import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversationSidebar } from "./conversation-sidebar";

describe("ConversationSidebar", () => {
  const conversations = [
    { id: "1", user_id: "u1", title: "First Chat", created_at: "2026-03-19T10:00:00Z", updated_at: "2026-03-19T10:00:00Z" },
    { id: "2", user_id: "u1", title: null, created_at: "2026-03-19T11:00:00Z", updated_at: "2026-03-19T11:00:00Z" },
  ];

  it("renders conversation titles", () => {
    render(
      <ConversationSidebar
        conversations={conversations}
        selectedId="1"
        onSelect={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("First Chat")).toBeDefined();
    expect(screen.getByText("New Conversation")).toBeDefined();
  });

  it("calls onSelect when clicking a conversation", () => {
    const onSelect = vi.fn();
    render(
      <ConversationSidebar
        conversations={conversations}
        selectedId="1"
        onSelect={onSelect}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("First Chat"));
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("calls onCreate when clicking new button", () => {
    const onCreate = vi.fn();
    render(
      <ConversationSidebar
        conversations={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onCreate={onCreate}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /new/i }));
    expect(onCreate).toHaveBeenCalled();
  });
});
