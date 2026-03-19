interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function MicButton({ isRecording, onClick, disabled }: MicButtonProps) {
  return (
    <button
      className={`mic-button ${isRecording ? "mic-button--recording" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={isRecording ? "Stop mic" : "Start mic"}
    >
      {isRecording ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
          <path d="M5 11a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 18v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 21h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
