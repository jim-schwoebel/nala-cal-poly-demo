interface MicPermissionModalProps {
  onAllow: () => void;
  onDeny: () => void;
}

export function MicPermissionModal({ onAllow, onDeny }: MicPermissionModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__icon">🎙️</div>
        <h2 className="modal__title">Microphone Access</h2>
        <p className="modal__body">
          Nala needs your microphone to hear you. Your audio is processed
          locally on your device and never leaves your browser.
        </p>
        <div className="modal__actions">
          <button className="modal__btn modal__btn--secondary" onClick={onDeny}>
            Not now
          </button>
          <button className="modal__btn modal__btn--primary" onClick={onAllow}>
            Allow microphone
          </button>
        </div>
      </div>
    </div>
  );
}
