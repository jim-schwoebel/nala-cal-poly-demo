export type Status = "idle" | "listening" | "thinking" | "speaking";

interface StatusIndicatorProps {
  status: Status;
}

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  listening: "Listening...",
  thinking: "Thinking...",
  speaking: "Nala is speaking...",
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "idle") return null;

  return (
    <div className="status-indicator">
      <span>{STATUS_TEXT[status]}</span>
    </div>
  );
}
