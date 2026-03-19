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
      {isRecording ? "⏹" : "🎤"}
    </button>
  );
}
