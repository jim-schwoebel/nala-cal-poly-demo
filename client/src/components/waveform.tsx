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
    if (mode === "idle" || !canvasRef.current) return;

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
    const baseRadius = Math.min(w, h) * 0.25;

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

      // Number of layers and their properties depend on mode
      const layers =
        mode === "recording"
          ? [
              { radius: baseRadius * (1 + energy * 0.8), alpha: 0.08, color: "99, 102, 241" },
              { radius: baseRadius * (0.85 + energy * 0.6), alpha: 0.12, color: "99, 102, 241" },
              { radius: baseRadius * (0.7 + energy * 0.4), alpha: 0.2, color: "129, 140, 248" },
              { radius: baseRadius * (0.5 + energy * 0.3), alpha: 0.6, color: "129, 140, 248" },
            ]
          : mode === "thinking"
            ? [
                { radius: baseRadius * (0.9 + Math.sin(t * 2) * 0.15), alpha: 0.06, color: "99, 102, 241" },
                { radius: baseRadius * (0.7 + Math.sin(t * 2.5 + 1) * 0.1), alpha: 0.1, color: "99, 102, 241" },
                { radius: baseRadius * (0.5 + Math.sin(t * 3 + 2) * 0.08), alpha: 0.2, color: "129, 140, 248" },
                { radius: baseRadius * (0.3 + Math.sin(t * 3.5 + 3) * 0.05), alpha: 0.5, color: "165, 180, 252" },
              ]
            : [
                // speaking
                { radius: baseRadius * (0.95 + Math.sin(t * 4) * 0.12), alpha: 0.06, color: "52, 211, 153" },
                { radius: baseRadius * (0.75 + Math.sin(t * 5 + 1) * 0.1), alpha: 0.1, color: "52, 211, 153" },
                { radius: baseRadius * (0.55 + Math.sin(t * 6 + 2) * 0.08), alpha: 0.25, color: "110, 231, 183" },
                { radius: baseRadius * (0.35 + Math.sin(t * 7 + 3) * 0.05), alpha: 0.5, color: "167, 243, 208" },
              ];

      // Draw organic blob layers
      for (const layer of layers) {
        ctx.beginPath();
        const points = 128;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          // Create organic wobble
          const wobble1 = Math.sin(angle * 3 + t * 2) * layer.radius * 0.08;
          const wobble2 = Math.sin(angle * 5 + t * 3) * layer.radius * 0.04;
          const wobble3 =
            mode === "recording" && dataArray
              ? (dataArray[i % dataArray.length] / 255) * layer.radius * 0.15
              : 0;
          const r = layer.radius + wobble1 + wobble2 + wobble3;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Radial gradient fill
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, layer.radius * 1.2);
        gradient.addColorStop(0, `rgba(${layer.color}, ${layer.alpha * 1.5})`);
        gradient.addColorStop(1, `rgba(${layer.color}, ${layer.alpha * 0.2})`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Center glow dot
      const dotColor =
        mode === "speaking" ? "110, 231, 183" : "129, 140, 248";
      const dotGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.15);
      dotGlow.addColorStop(0, `rgba(${dotColor}, 0.9)`);
      dotGlow.addColorStop(1, `rgba(${dotColor}, 0)`);
      ctx.fillStyle = dotGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Floating particles
      const particleCount = mode === "recording" ? 20 : 10;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = (i / particleCount) * Math.PI * 2 + t * 0.3;
        const pDist = baseRadius * (0.8 + Math.sin(t * 1.5 + i) * 0.4);
        const px = cx + Math.cos(pAngle) * pDist;
        const py = cy + Math.sin(pAngle) * pDist;
        const pSize = 1.5 + Math.sin(t * 2 + i * 0.5) * 1;
        const pAlpha = 0.3 + Math.sin(t * 3 + i) * 0.2;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, ${pAlpha})`;
        ctx.fill();
      }
    }

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [mode, analyserNode]);

  if (mode === "idle") return null;

  return (
    <div className="waveform-orb">
      <canvas ref={canvasRef} className="waveform-orb__canvas" />
    </div>
  );
}
