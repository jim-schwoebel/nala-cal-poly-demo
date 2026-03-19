import type { Conversation } from "@nala/shared";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="conversation-list conversation-list--empty">
        <p>No conversations yet</p>
        <p>Tap the mic or pick a topic to start</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((convo) => (
        <ConversationItem
          key={convo.id}
          conversation={convo}
          isSelected={convo.id === selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
