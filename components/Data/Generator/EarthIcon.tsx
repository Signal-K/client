import React, { useMemo } from 'react'

interface GenerativeEarthIconProps {
  size?: number
  seed?: number
}

export function GenerativeEarthIcon({ size = 24, seed = 1 }: GenerativeEarthIconProps) {
  const continents = useMemo(() => {
    const rng = mulberry32(seed)
    return Array.from({ length: 5 }, () => ({
      cx: rng() * size,
      cy: rng() * size,
      rx: rng() * (size / 4) + size / 8,
      ry: rng() * (size / 4) + size / 8,
    }))
  }, [size, seed])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#4A90E2" />
      {continents.map((continent, index) => (
        <ellipse
          key={index}
          cx={continent.cx}
          cy={continent.cy}
          rx={continent.rx}
          ry={continent.ry}
          fill="#68BB59"
        />
      ))}
    </svg>
  )
}

// Simple random number generator
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  };
};