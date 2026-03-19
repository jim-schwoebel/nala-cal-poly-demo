import { MicButton } from "./mic-button";

interface VoiceControlsProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export function VoiceControls({ isRecording, onToggle, disabled }: VoiceControlsProps) {
  return (
    <div className="voice-controls">
      <MicButton isRecording={isRecording} onClick={onToggle} disabled={disabled} />
    </div>
  );
}
