interface NalaLogoProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function NalaLogo({ size = "md", onClick }: NalaLogoProps) {
  const dims = { sm: 30, md: 38, lg: 50 }[size];
  const fontSize = { sm: "0.9375rem", md: "1.125rem", lg: "1.5rem" }[size];

  return (
    <div
      className={`nala-logo ${onClick ? "nala-logo--clickable" : ""}`}
      style={{ gap: size === "lg" ? 10 : 8 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`nala-bg-${size}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7a73ff" />
            <stop offset="1" stopColor="#635bff" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill={`url(#nala-bg-${size})`} />

        {/* Lion face — positioned left to make room for waves */}
        {/* Ears */}
        <ellipse cx="12" cy="13" rx="5" ry="6" fill="rgba(255,255,255,0.3)" />
        <ellipse cx="26" cy="13" rx="5" ry="6" fill="rgba(255,255,255,0.3)" />

        {/* Head */}
        <circle cx="19" cy="23" r="11" fill="rgba(255,255,255,0.92)" />

        {/* Eyes */}
        <circle cx="16" cy="21" r="1.8" fill="#635bff" />
        <circle cx="22" cy="21" r="1.8" fill="#635bff" />
        <circle cx="16.5" cy="20.4" r="0.6" fill="white" />
        <circle cx="22.5" cy="20.4" r="0.6" fill="white" />

        {/* Nose */}
        <ellipse cx="19" cy="25" rx="1.8" ry="1.2" fill="#635bff" />

        {/* Smile */}
        <path d="M16.5 27.5 Q19 29.5 21.5 27.5" stroke="#635bff" strokeWidth="0.8" fill="none" strokeLinecap="round" />

        {/* Audio waves — on the purple background, right side */}
        <path d="M32 19a4 4 0 0 1 0 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M36 16a8 8 0 0 1 0 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M40 13a12 12 0 0 1 0 20" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="nala-logo__text" style={{ fontSize }}>nala</span>
    </div>
  );
}
