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
      // Mars topography: blue/green low, yellow/orange mid, red high, craters, polar caps
      return {
        background: `
          /* Elevation gradient */
          linear-gradient(135deg, #2e6dbb 0%, #3ecf8e 15%, #f7e967 35%, #f7b267 55%, #e86a17 75%, #a82e2e 100%),
          /* Crater overlays */
          radial-gradient(circle 120px at 30% 60%, #2e6dbb 0%, #3ecf8e 40%, transparent 70%),
          radial-gradient(circle 80px at 60% 40%, #f7e967 0%, #f7b267 60%, transparent 80%),
          radial-gradient(circle 100px at 70% 80%, #e86a17 0%, #a82e2e 60%, transparent 80%),
          /* Polar caps */
          radial-gradient(circle 90px at 10% 10%, #e8e8e8 0%, transparent 80%),
          radial-gradient(circle 90px at 90% 10%, #e8e8e8 0%, transparent 80%),
          /* Subtle topographic lines */
          repeating-linear-gradient(120deg, #e8b07a22 0px, #f7e96722 20px, #e86a1722 40px)
        `,
      }
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
      <div ref={viewportRef} className="w-full h-full relative" style={getMartianBackgroundStyle(variant)}>
        {/* Crater overlays for extra realism */}
        {variant === "martian-surface" && (
          <>
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
        /* Add subtle topographic lines or dust if desired */
      `}</style>
    </div>
  )
}
