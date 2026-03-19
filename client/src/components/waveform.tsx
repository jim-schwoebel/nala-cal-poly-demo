import { useEffect, useRef } from "react";

type WaveformMode = "idle" | "recording" | "thinking" | "speaking";

interface WaveformProps {
  mode: WaveformMode;
  analyserNode: AnalyserNode | null;
}

export function Waveform({ mode, analyserNode }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.3;

    let dataArray: Uint8Array | null = null;
    if (analyserNode) {
      dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    }

    function draw() {
      animationRef.current = requestAnimationFrame(draw);
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      let energy = 0;
      if (dataArray && analyserNode && mode === "recording") {
        analyserNode.getByteFrequencyData(dataArray);
        energy = dataArray.reduce((sum, v) => sum + v, 0) / (dataArray.length * 255);
      }

      const layers =
        mode === "recording"
          ? [
              { radius: baseRadius * (1.1 + energy * 0.6), alpha: 0.05, color: "99, 91, 255" },
              { radius: baseRadius * (0.9 + energy * 0.5), alpha: 0.08, color: "99, 91, 255" },
              { radius: baseRadius * (0.7 + energy * 0.35), alpha: 0.12, color: "122, 115, 255" },
            ]
          : mode === "thinking"
            ? [
                { radius: baseRadius * (0.95 + Math.sin(t * 2) * 0.1), alpha: 0.04, color: "99, 91, 255" },
                { radius: baseRadius * (0.75 + Math.sin(t * 2.5 + 1) * 0.08), alpha: 0.07, color: "99, 91, 255" },
                { radius: baseRadius * (0.55 + Math.sin(t * 3 + 2) * 0.06), alpha: 0.12, color: "122, 115, 255" },
              ]
            : mode === "speaking"
              ? [
                  { radius: baseRadius * (1.0 + Math.sin(t * 3) * 0.08), alpha: 0.04, color: "62, 207, 142" },
                  { radius: baseRadius * (0.8 + Math.sin(t * 4 + 1) * 0.07), alpha: 0.07, color: "62, 207, 142" },
                  { radius: baseRadius * (0.6 + Math.sin(t * 5 + 2) * 0.05), alpha: 0.12, color: "110, 231, 183" },
                ]
              : [
                  // idle — very subtle ambient breathing
                  { radius: baseRadius * (0.7 + Math.sin(t * 0.8) * 0.03), alpha: 0.03, color: "99, 91, 255" },
                  { radius: baseRadius * (0.5 + Math.sin(t * 1.0 + 1) * 0.02), alpha: 0.05, color: "99, 91, 255" },
                ];

      for (const layer of layers) {
        ctx.beginPath();
        const points = 96;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobble1 = Math.sin(angle * 3 + t * 1.5) * layer.radius * 0.06;
          const wobble2 = Math.sin(angle * 5 + t * 2.2) * layer.radius * 0.03;
          const wobble3 =
            mode === "recording" && dataArray
              ? (dataArray[i % dataArray.length] / 255) * layer.radius * 0.12
              : 0;
          const r = layer.radius + wobble1 + wobble2 + wobble3;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, layer.radius * 1.3);
        gradient.addColorStop(0, `rgba(${layer.color}, ${layer.alpha * 1.2})`);
        gradient.addColorStop(1, `rgba(${layer.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Floating particles (only when active)
      if (mode !== "idle") {
        const dotColor = mode === "speaking" ? "110, 231, 183" : "122, 115, 255";
        const particleCount = mode === "recording" ? 16 : 8;
        for (let i = 0; i < particleCount; i++) {
          const pAngle = (i / particleCount) * Math.PI * 2 + t * 0.25;
          const pDist = baseRadius * (0.7 + Math.sin(t * 1.2 + i) * 0.35);
          const px = cx + Math.cos(pAngle) * pDist;
          const py = cy + Math.sin(pAngle) * pDist;
          const pSize = 1.2 + Math.sin(t * 2 + i * 0.5) * 0.8;
          const pAlpha = 0.2 + Math.sin(t * 3 + i) * 0.15;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dotColor}, ${pAlpha})`;
          ctx.fill();
        }
      }
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [mode, analyserNode]);

  return (
    <div className="waveform-orb">
      <canvas ref={canvasRef} className="waveform-orb__canvas" />
    </div>
  );
}
