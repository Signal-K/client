"use client"

import type { Anomaly } from "@/types/Structures/telescope";

interface AnomalyComponentProps {
  anomaly: Anomaly
  onClick: (anomaly: Anomaly) => void
  isHighlighted?: boolean
};

export function AnomalyComponent({ anomaly, onClick, isHighlighted = false }: AnomalyComponentProps) {
  const baseClasses = "absolute cursor-pointer transition-all duration-300 hover:scale-125 hover:brightness-125"
  const size = anomaly.size || 1
  const baseSize = anomaly.type === "accretion_disc" ? 16 : anomaly.type === "sunspot" ? 12 : 9

  // Create shape-specific styles
  const getShapeStyles = () => {
    const commonStyles = {
      left: `${anomaly.x}%`,
      top: `${anomaly.y}%`,
      width: `${baseSize * size}px`,
      height: `${baseSize * size}px`,
      background: `radial-gradient(circle, ${anomaly.color}22 0%, ${anomaly.color} 40%, ${anomaly.color}CC 100%)`,
      boxShadow: isHighlighted
        ? `0 0 ${30 * size}px ${15 * size}px ${anomaly.color}88, 0 0 ${40 * size}px ${20 * size}px #ffffff44`
        : `0 0 ${20 * size * anomaly.glowIntensity}px ${10 * size * anomaly.glowIntensity}px ${anomaly.color}66`,
      filter: `brightness(${1 + anomaly.brightness}) saturate(1.3)`,
      animation: isHighlighted
        ? `pulse 0.8s ease-in-out infinite alternate`
        : `pulse ${anomaly.pulseSpeed}s ease-in-out infinite alternate`,
      zIndex: isHighlighted ? 50 : 10,
    }

    switch (anomaly.shape) {
      case "circle":
        return {
          ...commonStyles,
          borderRadius: "50%",
        }
      case "star":
        return {
          ...commonStyles,
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }
      case "diamond":
        return {
          ...commonStyles,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          transform: "rotate(45deg)",
        }
      case "hexagon":
        return {
          ...commonStyles,
          clipPath: "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
        }
      case "triangle":
        return {
          ...commonStyles,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }
      case "oval":
        return {
          ...commonStyles,
          borderRadius: "50%",
          width: `${baseSize * size * 1.5}px`,
          height: `${baseSize * size * 0.7}px`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }
      default:
        return {
          ...commonStyles,
          borderRadius: "50%",
        }
    }
  }

  return (
    <div
      key={anomaly.id}
      className={`${baseClasses} ${anomaly.classified ? "ring-2 ring-[#5E81AC]" : ""} ${isHighlighted ? "ring-4 ring-white" : ""}`}
      style={getShapeStyles()}
      onClick={() => onClick(anomaly)}
    >
      {anomaly.classified && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#5E81AC] rounded-full border-2 border-white" />
      )}
    </div>
  );
};