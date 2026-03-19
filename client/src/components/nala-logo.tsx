interface NalaLogoProps {
  size?: "sm" | "md" | "lg";
}

export function NalaLogo({ size = "md" }: NalaLogoProps) {
  const dims = { sm: 28, md: 36, lg: 56 }[size];
  const fontSize = { sm: "0.9375rem", md: "1.125rem", lg: "1.75rem" }[size];

  return (
    <div className="nala-logo" style={{ gap: size === "lg" ? 12 : 8 }}>
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nala-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#nala-grad)" />
        {/* Sound wave icon */}
        <path
          d="M14 20a6 6 0 0 1 6-6M14 20a6 6 0 0 0 6 6M10 20a10 10 0 0 1 10-10M10 20a10 10 0 0 0 10 10"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="24" cy="20" r="2.5" fill="white" />
      </svg>
      <span className="nala-logo__text" style={{ fontSize }}>nala</span>
    </div>
  );
}
