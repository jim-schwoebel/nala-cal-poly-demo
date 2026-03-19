import { useEffect } from "react";

interface DeleteToastProps {
  conversationTitle: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function DeleteToast({ conversationTitle, onUndo, onDismiss }: DeleteToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="toast">
      <span>Deleted &ldquo;{conversationTitle || "New Conversation"}&rdquo;</span>
      <button className="toast__undo" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}
