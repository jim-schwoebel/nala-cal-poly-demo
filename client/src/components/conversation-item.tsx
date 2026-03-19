import type { Conversation } from "@nala/shared";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={`sidebar-item ${isSelected ? "sidebar-item--active" : ""}`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="sidebar-item__content">
        <span className="sidebar-item__title">
          {conversation.title || "New Conversation"}
        </span>
        <span className="sidebar-item__meta">
          {formatDate(conversation.updated_at)}
        </span>
      </div>
      <button
        className="sidebar-item__delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        aria-label="Delete conversation"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
