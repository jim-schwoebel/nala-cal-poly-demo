interface NalaLogoProps {
  size?: "sm" | "md" | "lg";
}

export function NalaLogo({ size = "md" }: NalaLogoProps) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  const fontSize = { sm: "0.9375rem", md: "1.125rem", lg: "1.5rem" }[size];

  return (
    <div className="nala-logo" style={{ gap: size === "lg" ? 10 : 8 }}>
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nala-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7a73ff" />
            <stop offset="1" stopColor="#635bff" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#nala-bg)" />

        {/* Lion ears */}
        <ellipse cx="14" cy="14" rx="6" ry="7" fill="rgba(255,255,255,0.25)" />
        <ellipse cx="34" cy="14" rx="6" ry="7" fill="rgba(255,255,255,0.25)" />
        <ellipse cx="14" cy="15" rx="3.5" ry="4" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="34" cy="15" rx="3.5" ry="4" fill="rgba(255,255,255,0.15)" />

        {/* Lion face */}
        <circle cx="24" cy="24" r="13" fill="rgba(255,255,255,0.9)" />

        {/* Eyes */}
        <circle cx="20" cy="22" r="2" fill="#635bff" />
        <circle cx="28" cy="22" r="2" fill="#635bff" />
        <circle cx="20.7" cy="21.3" r="0.7" fill="white" />
        <circle cx="28.7" cy="21.3" r="0.7" fill="white" />

        {/* Nose */}
        <ellipse cx="24" cy="26" rx="2" ry="1.3" fill="#635bff" />

        {/* Audio waves coming from mouth */}
        <path d="M28 30a3 3 0 0 1 0-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M31 31.5a5.5 5.5 0 0 0 0-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M34 33a8 8 0 0 0 0-10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="nala-logo__text" style={{ fontSize }}>nala</span>
    </div>
  );
}
