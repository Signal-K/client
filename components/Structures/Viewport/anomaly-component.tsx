"use client"

import type { Anomaly } from "@/types/Structures/telescope"

interface AnomalyComponentProps {
  anomaly: Anomaly;
  onClick: (anomaly: Anomaly) => void;
  isHighlighted?: boolean;
};

export function AnomalyComponent({ anomaly, onClick, isHighlighted = false }: AnomalyComponentProps) {
  const baseClasses = "absolute cursor-pointer transition-all duration-300 hover:scale-110"
  const size = anomaly.size || 1
  const baseSize = anomaly.type === "accretion_disc" ? 16 : anomaly.type === "sunspot" ? 12 : 8

  const isMinorPlanet = anomaly.type === "asteroid"
  const color = isMinorPlanet ? "#ffcc66" : anomaly.color

  const getShapeStyles = () => {
    const commonStyles = {
      left: `${anomaly.x}%`,
      top: `${anomaly.y}%`,
      width: `${baseSize * size}px`,
      height: `${baseSize * size}px`,
      background: `radial-gradient(circle, ${color}CC 0%, ${color}88 60%, ${color}44 100%)`,
      boxShadow: isHighlighted
        ? `
          0 0 ${30 * size}px ${15 * size}px ${color}66, 
          0 0 ${50 * size}px ${25 * size}px ${color}33,
          0 0 ${70 * size}px ${35 * size}px rgba(168,216,234,0.2)
        `
        : `
          0 0 ${20 * size * anomaly.glowIntensity}px ${10 * size * anomaly.glowIntensity}px ${color}44,
          0 0 ${30 * size * anomaly.glowIntensity}px ${15 * size * anomaly.glowIntensity}px ${color}22
        `,
      filter: `brightness(${1 + anomaly.brightness * 0.5}) saturate(1.2)`,
      animation: isHighlighted
        ? `pulse 0.8s ease-in-out infinite alternate`
        : `pulse ${anomaly.pulseSpeed}s ease-in-out infinite alternate`,
      zIndex: isHighlighted ? 50 : 10,
      transform: "translate(-50%, -50%)",
    }

    // Special override for minor planets
    if (isMinorPlanet) {
      return {
        ...commonStyles,
        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        border: `1px dashed ${color}AA`,
      }
    }

    switch (anomaly.shape) {
      case "circle":
        return {
          ...commonStyles,
          borderRadius: "50%",
          border: `1px solid ${color}88`,
        }
      case "star":
        return {
          ...commonStyles,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          border: `1px solid ${color}88`,
        }
      case "diamond":
        return {
          ...commonStyles,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          border: `1px solid ${color}88`,
        }
      case "hexagon":
        return {
          ...commonStyles,
          clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
          border: `1px solid ${color}88`,
        }
      case "triangle":
        return {
          ...commonStyles,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          border: `1px solid ${color}88`,
        }
      case "oval":
        return {
          ...commonStyles,
          borderRadius: "50%",
          width: `${baseSize * size * 1.4}px`,
          height: `${baseSize * size * 0.7}px`,
          border: `1px solid ${color}88`,
          transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
        }
      default:
        return {
          ...commonStyles,
          borderRadius: "50%",
          border: `1px solid ${color}88`,
        }
    }
  }

  return (
    <>
      <div
        className={`${baseClasses} ${anomaly.classified ? "ring-2 ring-[#a8d8ea]/40" : ""} ${isHighlighted ? "ring-2 ring-[#e8f4f8]/60" : ""}`}
        style={getShapeStyles()}
        onClick={() => onClick(anomaly)}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-1 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle, ${color}AA 0%, ${color}44 50%, transparent 80%)`,
            animation: `innerGlow ${anomaly.pulseSpeed * 0.8}s ease-in-out infinite alternate`,
          }}
        />

        {/* Classification indicator */}
        {anomaly.classified && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#b8e6b8] rounded-full border border-[#1a1a2e] shadow-lg">
            <div className="absolute inset-0.5 bg-[#1a1a2e] rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-[#b8e6b8] rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        @keyframes innerGlow {
          0% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          100% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </>
  )
};