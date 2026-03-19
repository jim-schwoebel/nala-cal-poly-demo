import type { Status } from "./status-indicator";

interface NalaAvatarProps {
  status: Status;
}

export function NalaAvatar({ status }: NalaAvatarProps) {
  const ringClass =
    status === "listening"
      ? "avatar-ring--listening"
      : status === "thinking"
        ? "avatar-ring--thinking"
        : status === "speaking"
          ? "avatar-ring--speaking"
          : "";

  return (
    <div className="nala-avatar">
      <div className={`avatar-ring ${ringClass}`}>
        <svg
          viewBox="0 0 120 120"
          className="avatar-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="face-grad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fcd68d" />
              <stop offset="100%" stopColor="#e8a848" />
            </radialGradient>
            <radialGradient id="ear-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f5c16c" />
              <stop offset="100%" stopColor="#d4903a" />
            </radialGradient>
            <radialGradient id="inner-ear" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0a0b0" />
              <stop offset="100%" stopColor="#d88090" />
            </radialGradient>
            <radialGradient id="nose-grad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#6b4530" />
              <stop offset="100%" stopColor="#4a2e1c" />
            </radialGradient>
          </defs>

          {/* Mane / fur around face */}
          <ellipse cx="60" cy="62" rx="48" ry="46" fill="#c47a2a" />
          <ellipse cx="60" cy="58" rx="44" ry="42" fill="#d4903a" />

          {/* Fur tufts around mane */}
          <circle cx="22" cy="42" r="10" fill="#c47a2a" />
          <circle cx="98" cy="42" r="10" fill="#c47a2a" />
          <circle cx="16" cy="58" r="9" fill="#c47a2a" />
          <circle cx="104" cy="58" r="9" fill="#c47a2a" />
          <circle cx="30" cy="28" r="8" fill="#d4903a" />
          <circle cx="90" cy="28" r="8" fill="#d4903a" />
          <circle cx="44" cy="20" r="7" fill="#c47a2a" />
          <circle cx="76" cy="20" r="7" fill="#c47a2a" />
          <circle cx="60" cy="18" r="6" fill="#d4903a" />

          {/* Ears */}
          <ellipse cx="32" cy="32" rx="14" ry="16" fill="url(#ear-grad)" />
          <ellipse cx="88" cy="32" rx="14" ry="16" fill="url(#ear-grad)" />
          <ellipse cx="32" cy="34" rx="8" ry="10" fill="url(#inner-ear)" />
          <ellipse cx="88" cy="34" rx="8" ry="10" fill="url(#inner-ear)" />

          {/* Face */}
          <ellipse cx="60" cy="62" rx="34" ry="32" fill="url(#face-grad)" />

          {/* Lighter muzzle area */}
          <ellipse cx="60" cy="72" rx="20" ry="16" fill="#fce4a8" />

          {/* Eyes */}
          <ellipse cx="46" cy="56" rx="6" ry="6.5" fill="white" />
          <ellipse cx="74" cy="56" rx="6" ry="6.5" fill="white" />
          <ellipse cx="47" cy="56" rx="3.5" ry="4" fill="#3a2510" />
          <ellipse cx="75" cy="56" rx="3.5" ry="4" fill="#3a2510" />
          {/* Eye shine */}
          <circle cx="48.5" cy="54.5" r="1.5" fill="white" opacity="0.9" />
          <circle cx="76.5" cy="54.5" r="1.5" fill="white" opacity="0.9" />

          {/* Eyebrows - subtle */}
          <path d="M40 49 Q46 46 52 49" stroke="#b8783a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M68 49 Q74 46 80 49" stroke="#b8783a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx="60" cy="67" rx="5" ry="3.5" fill="url(#nose-grad)" />

          {/* Mouth */}
          <path d="M55 72 Q60 77 65 72" stroke="#8b5a30" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Whisker dots */}
          <circle cx="48" cy="69" r="0.8" fill="#b8783a" />
          <circle cx="44" cy="67" r="0.8" fill="#b8783a" />
          <circle cx="72" cy="69" r="0.8" fill="#b8783a" />
          <circle cx="76" cy="67" r="0.8" fill="#b8783a" />
        </svg>
      </div>
    </div>
  );
}
