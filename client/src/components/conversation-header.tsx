interface ConversationHeaderProps {
  title: string | null;
  onMenuToggle: () => void;
  showMenuButton: boolean;
}

export function ConversationHeader({ title, onMenuToggle, showMenuButton }: ConversationHeaderProps) {
  return (
    <div className="conversation-header">
      {showMenuButton && (
        <button className="conversation-header__menu" onClick={onMenuToggle} aria-label="Toggle sidebar">
          ☰
        </button>
      )}
      <h3 className="conversation-header__title">
        {title || "New Conversation"}
      </h3>
    </div>
  );
}
