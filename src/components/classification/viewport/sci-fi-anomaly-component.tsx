"use client"

import type { Anomaly } from "@/types/Structures/telescope"

interface SciFiAnomalyComponentProps {
  anomaly: Anomaly
  onClick: (anomaly: Anomaly) => void
  isHighlighted?: boolean
}

export function SciFiAnomalyComponent({ anomaly, onClick, isHighlighted = false }: SciFiAnomalyComponentProps) {
  // Choose icon based on anomaly type
  const getIcon = () => {
    switch (anomaly.type) {
      case "planet":
      case "exoplanet":
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#78cce2] to-[#2e3440] border-2 border-[#78cce2] flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 rounded-full bg-[#e4eff0] opacity-60 absolute left-1 top-1" />
          </div>
        )
      case "asteroid":
        return (
          <div className="w-7 h-7 bg-gradient-to-br from-[#f2c572] to-[#bfa76a] rounded-full border-2 border-[#f2c572] flex items-center justify-center shadow-md">
            <div className="w-2 h-2 bg-[#bfa76a] rounded-full absolute left-2 top-3 opacity-70" />
          </div>
        )
      case "sunspot":
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fca311] to-[#ffb703] border-2 border-[#fca311] flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-[#ffb703] rounded-full absolute right-2 bottom-2 opacity-80" />
          </div>
        )
      case "accretion_disc":
        return (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5e81ac] to-[#434c5e] border-2 border-[#5e81ac] flex items-center justify-center shadow-xl">
            <div className="w-5 h-2 bg-[#e4eff0] rounded-full absolute left-2 top-4 opacity-50" />
          </div>
        )
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#78cce2] to-[#2e3440] border-2 border-[#78cce2] flex items-center justify-center shadow-md" />
        )
    }
  }

  // Label for anomaly type/anomalySet
  const getLabel = () => {
  const anomalyType = (anomaly as any).anomalytype || anomaly.type;
  const anomalySet = (anomaly as any).anomalySet;
    if (anomalyType === "planet" || anomalySet === "telescope-tess") {
      return "Planet candidate";
    }
    if (anomalyType === "asteroid" || anomalyType === "telescopeMinor" || anomalySet === "telescope-minorPlanet" || anomalySet === "active-asteroids") {
      return "Asteroid candidate";
    }
    if (anomalyType === "sunspot" || anomalySet === "telescope-sunspot") {
      return "Sunspot";
    }
    if (anomalyType === "accretion_disc" || anomalySet === "disk-detective") {
      return "Disk candidate";
    }
    if (anomalyType === "cloud" || anomalySet === "cloudspotting") {
      return "Cloud anomaly";
    }
    return anomalyType ? anomalyType.charAt(0).toUpperCase() + anomalyType.slice(1) : "Anomaly";
  }

  return (
    <div
      key={anomaly.id}
      className={`absolute flex flex-col items-center`}
      style={{ left: `${anomaly.x}%`, top: `${anomaly.y}%`, zIndex: isHighlighted ? 50 : 10 }}
      onClick={() => onClick(anomaly)}
    >
      <div
        className={`transition-all duration-300 cursor-pointer ${isHighlighted ? "scale-125 ring-4 ring-white" : "hover:scale-110"}`}
      >
        {getIcon()}
      </div>
      <span className="mt-1 text-xs font-mono text-[#78cce2] bg-[#0a0a2a]/80 px-2 py-0.5 rounded shadow-lg">
        {getLabel()}
      </span>
    </div>
  )
}
