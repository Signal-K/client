// SVG components for tools with transparent colored designs

export function TelescopeComplexIcon({ hasVisual = false }: { hasVisual?: boolean }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Radio Telescope Dish */}
      <ellipse cx="32" cy="28" rx="18" ry="6" fill="#88C0D0" opacity="0.3" />
      <path d="M 14 28 Q 32 38 50 28" stroke="#88C0D0" strokeWidth="2" fill="none" />
      <circle cx="32" cy="28" r="3" fill="#5E81AC" />

      {/* Support Structure */}
      <line x1="32" y1="31" x2="32" y2="48" stroke="#81A1C1" strokeWidth="2" />
      <line x1="28" y1="48" x2="36" y2="48" stroke="#81A1C1" strokeWidth="3" />

      {/* Visual Telescope (if researched) */}
      {hasVisual && (
        <>
          <rect x="38" y="18" width="8" height="16" rx="1" fill="#8FBCBB" opacity="0.4" />
          <circle cx="42" cy="16" r="3" fill="#5E81AC" opacity="0.6" />
          <line x1="42" y1="34" x2="42" y2="48" stroke="#8FBCBB" strokeWidth="1.5" />
        </>
      )}
    </svg>
  )
}

export function SatelliteIcon({ count = 1 }: { count?: number }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Main Body */}
      <rect x="26" y="24" width="12" height="16" rx="2" fill="#5E81AC" opacity="0.4" />
      <rect x="28" y="26" width="8" height="4" fill="#88C0D0" opacity="0.6" />

      {/* Solar Panels */}
      <rect x="12" y="28" width="12" height="8" fill="#8FBCBB" opacity="0.3" />
      <rect x="40" y="28" width="12" height="8" fill="#8FBCBB" opacity="0.3" />

      {/* Panel Grid Lines */}
      <line x1="18" y1="28" x2="18" y2="36" stroke="#5E81AC" strokeWidth="0.5" />
      <line x1="46" y1="28" x2="46" y2="36" stroke="#5E81AC" strokeWidth="0.5" />

      {/* Antenna */}
      <line x1="32" y1="24" x2="32" y2="18" stroke="#81A1C1" strokeWidth="1.5" />
      <circle cx="32" cy="18" r="2" fill="#88C0D0" />

      {/* Count Badge */}
      {count > 1 && (
        <>
          <circle cx="48" cy="16" r="8" fill="#BF616A" opacity="0.9" />
          <text x="48" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
            {count}
          </text>
        </>
      )}
    </svg>
  )
}

export function RoverIcon({ level = 1 }: { level?: number }) {
  const wheelThickness = 1 + level * 0.5
  const wheelRadius = 6 + level * 0.5

  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Main Body */}
      <rect x="18" y="22" width="28" height="12" rx="2" fill="#81A1C1" opacity="0.4" />

      {/* Camera/Sensor Mast */}
      <line x1="32" y1="22" x2="32" y2="14" stroke="#5E81AC" strokeWidth="2" />
      <rect x="28" y="12" width="8" height="4" rx="1" fill="#88C0D0" opacity="0.6" />

      {/* Solar Panel */}
      <rect x="20" y="18" width="24" height="3" fill="#8FBCBB" opacity="0.3" />

      {/* Mechanical Arm */}
      <path d="M 18 28 L 12 32 L 10 34" stroke="#5E81AC" strokeWidth="1.5" fill="none" />
      <circle cx="10" cy="34" r="2" fill="#81A1C1" opacity="0.6" />

      {/* Wheels - thickness increases with level */}
      <circle cx="22" cy="38" r={wheelRadius} fill="none" stroke="#2E3440" strokeWidth={wheelThickness} />
      <circle cx="32" cy="38" r={wheelRadius} fill="none" stroke="#2E3440" strokeWidth={wheelThickness} />
      <circle cx="42" cy="38" r={wheelRadius} fill="none" stroke="#2E3440" strokeWidth={wheelThickness} />

      {/* Wheel Treads */}
      <circle cx="22" cy="38" r={wheelRadius - 2} fill="#434C5E" opacity="0.3" />
      <circle cx="32" cy="38" r={wheelRadius - 2} fill="#434C5E" opacity="0.3" />
      <circle cx="42" cy="38" r={wheelRadius - 2} fill="#434C5E" opacity="0.3" />

      {/* Level Badge */}
      {level > 1 && (
        <>
          <circle cx="50" cy="16" r="7" fill="#8FBCBB" opacity="0.9" />
          <text x="50" y="20" textAnchor="middle" fill="#2E3440" fontSize="10" fontWeight="bold">
            L{level}
          </text>
        </>
      )}
    </svg>
  )
}
