import type { Conversation } from "@nala/shared";
import { ConversationList } from "./conversation-list";
import { NalaLogo } from "./nala-logo";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onGoHome: () => void;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onGoHome,
}: ConversationSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <NalaLogo size="sm" onClick={onGoHome} />
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
        <div className="sidebar__footer-item" onClick={onGoHome} role="button" tabIndex={0}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 6l6-4 6 4v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 14V9h4v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Home</span>
        </div>
        <a className="sidebar__footer-item" href="https://github.com/jim-schwoebel/nala-cal-poly-demo" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1C4.13 1 1 4.13 1 8a7 7 0 0 0 4.78 6.65c.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.03-.78-1.03-.63-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.94-1.55-.18-3.18-.78-3.18-3.46 0-.76.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.93.72a6.7 6.7 0 0 1 3.5 0c1.34-.91 1.93-.72 1.93-.72.38.96.14 1.67.07 1.85.45.49.72 1.12.72 1.88 0 2.69-1.64 3.28-3.2 3.45.25.22.48.65.48 1.31v1.94c0 .19.13.41.48.34A7 7 0 0 0 15 8c0-3.87-3.13-7-7-7z" fill="currentColor" />
          </svg>
          <span>GitHub</span>
        </a>
        <div className="sidebar__footer-status">
          <span className="sidebar__footer-dot" />
          <span>WebGPU active</span>
        </div>
      </div>
    </aside>
  );
}
