export default function BadgeIcon({ badgeKey, unlocked = false, size = 80 }) {
  const accentHex = "#6C63FF";
  const ringColor = unlocked ? accentHex : "var(--border-base)";
  const iconColor = unlocked ? "#ffffff" : "var(--text-disabled)";
  const bgColor   = unlocked ? "#0e0c1f" : "var(--bg-input)";
  const filterId  = `badge-glow-${badgeKey}`;

  const icons = {

    first_blood: (
      <>
        <polyline
          points="24,41 34,52 56,27"
          stroke={iconColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {unlocked && (
          <>
            <circle cx="59" cy="22" r="3"   fill={accentHex} opacity="0.9" />
            <circle cx="64" cy="31" r="1.8" fill={accentHex} opacity="0.55" />
            <circle cx="19" cy="32" r="2.2" fill={accentHex} opacity="0.45" />
            <circle cx="17" cy="43" r="1.3" fill={accentHex} opacity="0.3" />
          </>
        )}
      </>
    ),

    on_a_roll: (
      <>
        <path
          d="M40 17 C43 23 49 30 49 38 C49 44.6 45.1 49.5 40 49.5 C34.9 49.5 31 44.6 31 38 C31 30 37 23 40 17 Z"
          fill={iconColor}
        />
        <path
          d="M40 30 C41.5 33 43.5 36.5 43.5 39.5 C43.5 42.5 42 44.5 40 44.5 C38 44.5 36.5 42.5 36.5 39.5 C36.5 36.5 38.5 33 40 30 Z"
          fill={bgColor}
        />
      </>
    ),

    unstoppable: (
      <>
        <path
          d="M24 25 L56 25 L56 42 C56 51 48 57 40 61 C32 57 24 51 24 42 Z"
          fill="none"
          stroke={iconColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M40 30 C41.5 33.5 45 37 45 41 C45 44.5 42.8 47 40 47 C37.2 47 35 44.5 35 41 C35 37 38.5 33.5 40 30 Z"
          fill={iconColor}
        />
        <path
          d="M40 36 C41 38 42.5 39.5 42.5 41.5 C42.5 43 41.4 44.5 40 44.5 C38.6 44.5 37.5 43 37.5 41.5 C37.5 39.5 39 38 40 36 Z"
          fill={bgColor}
        />
      </>
    ),

    century: (
      <polygon
        points="40,20 44.7,33.5 59,33.8 47.6,42.5 51.8,56.2 40,48 28.2,56.2 32.4,42.5 21,33.8 35.3,33.5"
        fill={iconColor}
      />
    ),

    xp_hunter: (
      <path
        d="M46 17 L33 41 L43 41 L34 63 L55 35 L45 35 Z"
        fill={iconColor}
      />
    ),

    speed_demon: (
      <>
        <path
          d="M40 18 C44 22 47 28 47 36 L47 46 L33 46 L33 36 C33 28 36 22 40 18 Z"
          fill={iconColor}
        />
        <path d="M33 38 L26 47 L33 47 Z" fill={iconColor} />
        <path d="M47 38 L54 47 L47 47 Z" fill={iconColor} />
        <path
          d="M36 46 L34 55 L40 51 L46 55 L44 46 Z"
          fill={unlocked ? "#F59E0B" : "var(--text-disabled)"}
        />
        <circle
          cx="40" cy="31" r="5"
          fill={bgColor}
          stroke={unlocked ? accentHex : "var(--border-base)"}
          strokeWidth="1.5"
        />
      </>
    ),

    centurion: (
      <>
        <path
          d="M20 56 L20 46 L26 50 L33 30 L37 38 L40 24 L43 38 L47 30 L54 50 L60 46 L60 56 Z"
          fill={iconColor}
        />
        <rect x="20" y="51" width="40" height="6" rx="1.5" fill={iconColor} />
        {unlocked && (
          <>
            <circle cx="30" cy="54" r="2.2" fill={accentHex} />
            <circle cx="40" cy="54" r="2.2" fill={accentHex} />
            <circle cx="50" cy="54" r="2.2" fill={accentHex} />
          </>
        )}
      </>
    ),

  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: unlocked ? 1 : 0.5, display: "block" }}
    >
      {unlocked && (
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {unlocked && (
        <circle cx="40" cy="40" r="38.5" fill="none" stroke={accentHex} strokeWidth="1" opacity="0.25" />
      )}

      <circle cx="40" cy="40" r="36" fill={bgColor} stroke={ringColor} strokeWidth="2.5" />

      {unlocked && (
        <circle
          cx="40" cy="40" r="31.5"
          fill="none"
          stroke={accentHex}
          strokeWidth="0.75"
          strokeDasharray="3.5 3"
          opacity="0.35"
        />
      )}

      {icons[badgeKey] ?? null}
    </svg>
  );
}