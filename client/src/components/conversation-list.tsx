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
      <div className="sidebar-empty">
        <p className="sidebar-empty__text">No conversations yet</p>
        <p className="sidebar-empty__hint">Start by tapping the mic or choosing a topic</p>
      </div>
    );
  }

  return (
    <div className="sidebar-list">
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
