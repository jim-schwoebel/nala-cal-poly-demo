import { useEffect, useRef } from "react";

type WaveformMode = "idle" | "recording" | "thinking";

interface WaveformProps {
  mode: WaveformMode;
  analyserNode: AnalyserNode | null;
}

export function Waveform({ mode, analyserNode }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (mode !== "recording" || !analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6366f1";

      const barWidth = canvas.width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillRect(
          i * barWidth,
          canvas.height - barHeight,
          barWidth - 1,
          barHeight
        );
      }
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [mode, analyserNode]);

  if (mode === "idle") return null;

  if (mode === "thinking") {
    return (
      <div className="waveform waveform--thinking">
        <div className="waveform__pulse" />
      </div>
    );
  }

  return (
    <div className="waveform waveform--recording">
      <canvas ref={canvasRef} width={300} height={60} />
    </div>
  );
}
