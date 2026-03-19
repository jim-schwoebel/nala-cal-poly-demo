import type { Conversation } from "@nala/shared";
import { ConversationList } from "./conversation-list";
import { NewConversationButton } from "./new-conversation-button";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: ConversationSidebarProps) {
  return (
    <aside className="conversation-sidebar">
      <div className="conversation-sidebar__header">
        <h2>Nala</h2>
        <NewConversationButton onCreate={onCreate} />
      </div>
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    </aside>
  );
}
