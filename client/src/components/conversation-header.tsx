interface ConversationHeaderProps {
  title: string | null;
  onMenuToggle: () => void;
  showMenuButton: boolean;
}

export function ConversationHeader({ title, onMenuToggle, showMenuButton }: ConversationHeaderProps) {
  return (
    <div className="conv-header">
      {showMenuButton && (
        <button className="conv-header__menu" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <span className="conv-header__title">
        {title || "New Conversation"}
      </span>
    </div>
  );
}
