export function IslamicPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 8-pointed star girih tile pattern */}
          <pattern id="girih" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <g
              fill="none"
              stroke="rgba(212,165,32,0.07)"
              strokeWidth="0.6"
            >
              {/* Outer square frame */}
              <rect x="0" y="0" width="120" height="120" />
              {/* Rotated square (diamond) */}
              <polygon points="60,4 116,60 60,116 4,60" />
              {/* Inner octagon */}
              <polygon points="60,22 82,38 98,60 82,82 60,98 38,82 22,60 38,38" />
              {/* Cross lines */}
              <line x1="60" y1="0" x2="60" y2="120" />
              <line x1="0" y1="60" x2="120" y2="60" />
              {/* Diagonal cross */}
              <line x1="0" y1="0" x2="120" y2="120" />
              <line x1="120" y1="0" x2="0" y2="120" />
              {/* Inner star spokes */}
              <line x1="60" y1="22" x2="60" y2="4" />
              <line x1="98" y1="60" x2="116" y2="60" />
              <line x1="60" y1="98" x2="60" y2="116" />
              <line x1="22" y1="60" x2="4" y2="60" />
              <line x1="82" y1="38" x2="96" y2="24" />
              <line x1="82" y1="82" x2="96" y2="96" />
              <line x1="38" y1="82" x2="24" y2="96" />
              <line x1="38" y1="38" x2="24" y2="24" />
              {/* Inner square rotated */}
              <rect x="42" y="42" width="36" height="36" transform="rotate(45 60 60)" />
              {/* Center dot */}
              <circle cx="60" cy="60" r="3" />
              {/* Corner quarter stars */}
              <circle cx="0" cy="0" r="8" />
              <circle cx="120" cy="0" r="8" />
              <circle cx="0" cy="120" r="8" />
              <circle cx="120" cy="120" r="8" />
            </g>
          </pattern>

          {/* Subtle vignette gradient overlay */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#060b15" stopOpacity="0" />
            <stop offset="100%" stopColor="#060b15" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#girih)" />
        <rect width="100%" height="100%" fill="url(#vignette)" />
      </svg>
    </div>
  );
}
