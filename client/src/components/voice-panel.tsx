import { NalaAvatar } from "./nala-avatar";
import { Waveform } from "./waveform";
import { MicButton } from "./mic-button";
import type { Status } from "./status-indicator";

interface VoicePanelProps {
  status: Status;
  waveformMode: "idle" | "recording" | "thinking" | "speaking";
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
  onToggleMic: () => void;
  micDisabled: boolean;
  conversationActive: boolean;
}

const STATUS_LABEL: Record<Status, string> = {
  idle: "Tap to start talking",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Nala is speaking...",
};

export function VoicePanel({
  status,
  waveformMode,
  analyserNode,
  isRecording,
  onToggleMic,
  micDisabled,
  conversationActive,
}: VoicePanelProps) {
  return (
    <div className="voice-panel">
      <div className="voice-panel__inner">
        <div className="voice-panel__avatar-area">
          <Waveform mode={waveformMode} analyserNode={analyserNode} />
          <div className="voice-panel__avatar-overlay">
            <NalaAvatar status={status} />
          </div>
        </div>

        <div className="voice-panel__controls">
          <span className={`voice-panel__status ${status !== "idle" ? "voice-panel__status--active" : ""}`}>
            {STATUS_LABEL[status]}
          </span>
          <MicButton isRecording={isRecording} onClick={onToggleMic} disabled={micDisabled} />
          {conversationActive && (
            <span className="voice-panel__hint">Say &ldquo;stop&rdquo; to end</span>
          )}
        </div>
      </div>
    </div>
  );
}
