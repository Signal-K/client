"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface RoverBackgroundProps {
  sectorX?: number
  sectorY?: number
  variant?:
    | "default"
    | "martian-surface"
    | "rust-basin"
    | "polar-ice"
    | "canyon"
    | "dune"
    | "crater"
}

// Generate sector name for display
const generateSectorName = (x: number, y: number) => `SECTOR ${x},${y}`

// Generate topographic overlays for Martian terrain
const getMartianBackgroundStyle = (variant: string) => {
  switch (variant) {
    case "martian-surface":
      // Mars topography: provide a warm base gradient; an SVG overlay will draw contours and texture
      return {
        background: `linear-gradient(180deg, #9f4a2a 0%, #bf5b2b 30%, #e08b52 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        // slight warm tone and contrast
        filter: "contrast(1.03) saturate(1.05)",
      };
    case "rust-basin":
      return {
        background: `
          radial-gradient(ellipse at 50% 60%, #a85c2a 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, #c97a3a 0%, transparent 70%),
          linear-gradient(120deg, #a85c2a 0%, #e8b07a 100%)
        `,
      }
    case "polar-ice":
      return {
        background: `
          radial-gradient(ellipse at 80% 20%, #e8e8e8 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, #b0c4de 0%, transparent 70%),
          linear-gradient(120deg, #e8e8e8 0%, #b0c4de 100%)
        `,
      }
    case "canyon":
      return {
        background: `
          radial-gradient(ellipse at 40% 60%, #a85c2a 0%, transparent 60%),
          radial-gradient(ellipse at 60% 30%, #c97a3a 0%, transparent 70%),
          linear-gradient(120deg, #a85c2a 0%, #c97a3a 100%)
        `,
      }
    case "dune":
      return {
        background: `
          radial-gradient(ellipse at 50% 50%, #e8b07a 0%, transparent 60%),
          radial-gradient(ellipse at 70% 70%, #c97a3a 0%, transparent 70%),
          linear-gradient(120deg, #e8b07a 0%, #c97a3a 100%)
        `,
      }
    case "crater":
      return {
        background: `
          radial-gradient(ellipse at 50% 50%, #a85c2a 0%, transparent 60%),
          radial-gradient(ellipse at 50% 50%, #e8b07a 0%, transparent 80%),
          linear-gradient(120deg, #a85c2a 0%, #e8b07a 100%)
        `,
      }
    default:
      return {
        background: `
          radial-gradient(ellipse at 60% 40%, #c97a3a 0%, transparent 70%),
          radial-gradient(ellipse at 30% 70%, #e8b07a 0%, transparent 60%),
          linear-gradient(135deg, #e8b07a 0%, #c97a3a 100%)
        `,
      }
  }
}

// Get environment name for display
const getEnvironmentName = (variant: string) => {
  switch (variant) {
    case "martian-surface":
      return "MARTIAN SURFACE"
    case "rust-basin":
      return "RUST BASIN"
    case "polar-ice":
      return "POLAR ICE CAP"
    case "canyon":
      return "CANYON REGION"
    case "dune":
      return "DUNE FIELD"
    case "crater":
      return "CRATER ZONE"
    default:
      return "MARTIAN TERRAIN"
  }
}

export function RoverBackground({
  sectorX = 0,
  sectorY = 0,
  variant = "martian-surface",
}: RoverBackgroundProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [sectorX, sectorY, variant])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#a85c2a] to-[#e8b07a]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e8b07a] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-[#e8b07a] text-sm font-mono">LOADING...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Debug info */}
      <div className="absolute top-2 right-2 text-white text-xs z-50">
        {`Mode: ${getEnvironmentName(variant)} | Sector: ${generateSectorName(sectorX, sectorY)}`}
      </div>

      {/* Martian Background */}
  <div ref={viewportRef} className="w-full h-full relative viewport-grain" style={getMartianBackgroundStyle(variant)}>
        {/* Crater overlays for extra realism */}
        {variant === "martian-surface" && (
          <>
            {/* SVG topographic overlay: gradients + contour lines + subtle noise */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 rover-topo-svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="marsGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a64b2b" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#c85a2e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#e79a63" stopOpacity="1" />
                </linearGradient>

                <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
                  <feColorMatrix type="saturate" values="0" />
                  <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
                </filter>

                <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="24" result="blur" />
                  <feOffset dx="0" dy="12" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.25" />
                  </feComponentTransfer>
                </filter>
              </defs>

              {/* base rect with gradient */}
              <rect x="0" y="0" width="1200" height="800" fill="url(#marsGrad)" />

              {/* soft lighting vignette */}
              <ellipse cx="600" cy="200" rx="600" ry="460" fill="#000" opacity="0.08" />

              {/* layered contour lines (path strokes emulate topo) */}
              <g stroke="#5a1f12" strokeWidth="2" fill="none" opacity="0.85" transform="translate(-40,20)">
                <path d="M40 600 C160 520, 320 540, 440 460 S720 300, 900 340" strokeOpacity="0.28" />
                <path d="M20 520 C140 440, 300 460, 420 380 S700 220, 880 260" strokeOpacity="0.22" />
                <path d="M0 440 C120 360, 280 380, 400 300 S680 140, 860 180" strokeOpacity="0.18" />
                <path d="M60 680 C200 600, 360 620, 480 540 S760 380, 940 420" strokeOpacity="0.16" />
                <path d="M120 740 C260 660, 420 680, 540 600 S820 440, 1000 480" strokeOpacity="0.12" />
              </g>

              {/* subtle highlight ridges using thin strokes */}
              <g stroke="#f2c4a0" strokeWidth="1" fill="none" opacity="0.45" transform="translate(-20,10)">
                <path d="M60 600 C180 520, 340 540, 460 460 S740 300, 920 340" strokeOpacity="0.14" />
                <path d="M30 480 C150 400, 310 420, 430 340 S710 180, 890 220" strokeOpacity="0.10" />
              </g>

              {/* inner crater shapes */}
              <g fill="#000" opacity="0.06">
                <ellipse cx="340" cy="480" rx="58" ry="58" />
                <ellipse cx="880" cy="640" rx="48" ry="48" />
                <ellipse cx="100" cy="100" rx="44" ry="44" />
              </g>

              {/* noise layer applied as blend using CSS later */}
              <rect x="0" y="0" width="1200" height="800" fill="#fff" opacity="0" filter="url(#grain)" />
            </svg>
            <div
              className="absolute rounded-full"
              style={{
                left: "28%", top: "58%", width: "120px", height: "120px",
                background: "radial-gradient(circle, #2e6dbb 0%, #3ecf8e 40%, transparent 70%)",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: "68%", top: "78%", width: "100px", height: "100px",
                background: "radial-gradient(circle, #e86a17 0%, #a82e2e 60%, transparent 80%)",
                opacity: 0.4,
                pointerEvents: "none",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: "8%", top: "8%", width: "90px", height: "90px",
                background: "radial-gradient(circle, #e8e8e8 0%, transparent 80%)",
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                left: "88%", top: "8%", width: "90px", height: "90px",
                background: "radial-gradient(circle, #e8e8e8 0%, transparent 80%)",
                opacity: 0.3,
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </div>

      <style jsx>{`
        .rover-topo-svg {
          mix-blend-mode: multiply;
          opacity: 0.95;
          filter: saturate(1.02) contrast(1.02);
        }

        /* subtle grain pseudo element for the viewport */
        .viewport-grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/noise-2.svg');
          background-repeat: repeat;
          opacity: 0.06;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Add subtle topographic lines or dust if desired */
      `}</style>
    </div>
  )
}
