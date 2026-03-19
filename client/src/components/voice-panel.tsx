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
        {/* You section */}
        <div className="voice-panel__side">
          <div className="voice-panel__circle">
            <MicButton isRecording={isRecording} onClick={onToggleMic} disabled={micDisabled} />
          </div>
          <span className="voice-panel__label">You</span>
          <span className="voice-panel__sublabel">
            {isRecording ? "Listening..." : conversationActive ? "Say \u201cstop\u201d to end" : "Tap to talk"}
          </span>
        </div>

        {/* Center status */}
        <div className="voice-panel__center">
          <div className="voice-panel__connector" />
          <span className={`voice-panel__status ${status !== "idle" ? "voice-panel__status--active" : ""}`}>
            {status === "idle" ? "" : status === "listening" ? "Listening" : status === "thinking" ? "Thinking" : "Speaking"}
          </span>
        </div>

        {/* Nala section */}
        <div className="voice-panel__side">
          <div className="voice-panel__circle voice-panel__nala-circle">
            <div className="voice-panel__waveform-bg">
              <Waveform mode={waveformMode} analyserNode={analyserNode} />
            </div>
            <div className="voice-panel__avatar-fg">
              <NalaAvatar status={status} />
            </div>
          </div>
          <span className="voice-panel__label">Nala</span>
          <span className="voice-panel__sublabel">
            {status === "speaking" ? "Speaking..." : status === "thinking" ? "Thinking..." : "Voice assistant"}
          </span>
        </div>
      </div>
    </div>
  );
}
