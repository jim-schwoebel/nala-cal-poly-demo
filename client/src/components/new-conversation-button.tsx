interface NewConversationButtonProps {
  onCreate: () => void;
}

export function NewConversationButton({ onCreate }: NewConversationButtonProps) {
  return (
    <button className="new-conversation-button" onClick={onCreate} aria-label="New conversation">
      + New
    </button>
  );
}
