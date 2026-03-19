import { NalaAvatar } from "./nala-avatar";
import { Waveform } from "./waveform";
import { MicButton } from "./mic-button";
import type { Status } from "./status-indicator";

const STARTER_PROMPTS = [
  { emoji: "👋", text: "Introduce yourself" },
  { emoji: "💡", text: "Creative project idea" },
  { emoji: "📚", text: "Book recommendation" },
];

interface VoicePanelProps {
  status: Status;
  waveformMode: "idle" | "recording" | "thinking" | "speaking";
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
  onToggleMic: () => void;
  micDisabled: boolean;
  conversationActive: boolean;
  hasMessages: boolean;
  onPromptSelect: (prompt: string) => void;
}

export function VoicePanel({
  status,
  waveformMode,
  analyserNode,
  isRecording,
  onToggleMic,
  micDisabled,
  conversationActive,
  hasMessages,
  onPromptSelect,
}: VoicePanelProps) {
  const showOnboarding = !hasMessages && status === "idle" && !conversationActive;

  return (
    <div className="voice-panel">
      <div className="voice-panel__inner">
        {/* You section */}
        <div className="voice-panel__side">
          <div className="voice-panel__circle">
            {showOnboarding && <div className="mic-cta-ring" />}
            <MicButton isRecording={isRecording} onClick={onToggleMic} disabled={micDisabled} />
          </div>
          <span className="voice-panel__label">You</span>
          <span className="voice-panel__sublabel">
            {isRecording ? "Listening..." : conversationActive ? "Say \u201cstop\u201d to end" : showOnboarding ? "Tap to start" : "Tap to talk"}
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

      {/* Prompt chips — shown in the voice panel when no messages yet */}
      {showOnboarding && (
        <div className="voice-panel__onboarding">
          <span className="voice-panel__or">or try one of these</span>
          <div className="voice-panel__prompts">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                className="prompt-chip"
                onClick={() => onPromptSelect(prompt.text)}
              >
                <span className="prompt-chip__emoji">{prompt.emoji}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
