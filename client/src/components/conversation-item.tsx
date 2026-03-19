import type { Conversation } from "@nala/shared";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={`conversation-item ${isSelected ? "conversation-item--selected" : ""}`}
      onClick={() => onSelect(conversation.id)}
    >
      <span className="conversation-item__title">
        {conversation.title || "New Conversation"}
      </span>
      <button
        className="conversation-item__delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        aria-label="Delete conversation"
      >
        &times;
      </button>
    </div>
  );
}
