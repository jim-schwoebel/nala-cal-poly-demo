import type { Conversation } from "@nala/shared";
import { ConversationList } from "./conversation-list";
import { NalaLogo } from "./nala-logo";

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
    <aside className="sidebar">
      <div className="sidebar__brand">
        <NalaLogo size="sm" />
      </div>

      <div className="sidebar__section">
        <div className="sidebar__section-header">
          <span className="sidebar__section-label">Conversations</span>
          <button className="sidebar__new-btn" onClick={onCreate} aria-label="New conversation">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__footer-badge">
          <span className="sidebar__footer-dot" />
          <span>Voice assistant</span>
        </div>
      </div>
    </aside>
  );
}
