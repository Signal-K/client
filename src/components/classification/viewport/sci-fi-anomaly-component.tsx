"use client"

import type { Anomaly } from "@/types/Structures/telescope"

interface SciFiAnomalyComponentProps {
  anomaly: Anomaly;
  title?: string;
  status?: 'classified' | 'active' | 'default';
  onClick: (anomaly: Anomaly) => void;
  isHighlighted?: boolean;
  inline?: boolean; // when true, don't absolutely position using anomaly.x/y (parent provides positioning)
};

export function SciFiAnomalyComponent({ anomaly, onClick, title, isHighlighted = false, status, inline = false }: SciFiAnomalyComponentProps) {
  // Choose icon based on anomaly type or title
  const getIcon = () => {
    // Check title for candidate types
    if (title === "Planet candidate") {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a8a8a] to-[#5a5a5a] border-2 border-[#78cce2] flex items-center justify-center shadow-lg relative">
          {/* Rocky surface texture */}
          <div className="w-3 h-3 rounded-full bg-[#6a6a6a] absolute left-1 top-1 opacity-70" />
          <div className="w-2 h-2 rounded-full bg-[#4a4a4a] absolute right-1 bottom-1 opacity-60" />
          <div className="w-1 h-1 rounded-full bg-[#3a3a3a] absolute left-2 bottom-2 opacity-80" />
        </div>
      )
    }
    
    if (title === "Asteroid candidate") {
      return (
        <div className="w-7 h-7 bg-gradient-to-br from-[#7a7a7a] to-[#4a4a4a] border-2 border-[#78cce2] flex items-center justify-center shadow-md relative" 
             style={{ borderRadius: '40% 60% 70% 30%' }}>
          {/* Irregular rocky texture */}
          <div className="w-2 h-2 bg-[#5a5a5a] absolute left-1 top-1 opacity-70" style={{ borderRadius: '60% 40%' }} />
          <div className="w-1 h-1 bg-[#3a3a3a] absolute right-1 bottom-1 opacity-80" />
          <div className="w-1 h-2 bg-[#6a6a6a] absolute left-2 bottom-1 opacity-60" style={{ borderRadius: '50% 80%' }} />
        </div>
      )
    }
    
    // Original logic for other types
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

  // If a status override was passed via props (through the render), provide different palettes/titles
  const renderByStatus = (s?: 'classified' | 'active' | 'default') => {
    const effectiveStatus = s ?? status;
  if (effectiveStatus === 'active') {
      return (
        <div
          className={`${inline ? 'relative' : 'absolute'} flex flex-col items-center`}
          style={inline ? { zIndex: isHighlighted ? 50 : 10 } : { left: `${anomaly.x}%`, top: `${anomaly.y}%`, zIndex: isHighlighted ? 50 : 10 }}
          onClick={() => onClick(anomaly)}
        >
          <div className={`transition-all duration-300 cursor-pointer ${isHighlighted ? "scale-125 ring-4 ring-white" : "hover:scale-110"}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#18dda1] to-[#0aa86f] border-2 border-[#18dda1] flex items-center justify-center shadow-lg" />
          </div>
          <span className="mt-1 text-xs font-mono text-[#18dda1] bg-[#03140f]/80 px-2 py-0.5 rounded shadow-lg">{title || 'Object of Interest'}</span>
        </div>
      )
    }
  if (effectiveStatus === 'classified') {
      return (
        <div
          className={`${inline ? 'relative' : 'absolute'} flex flex-col items-center`}
          style={inline ? { zIndex: isHighlighted ? 50 : 10 } : { left: `${anomaly.x}%`, top: `${anomaly.y}%`, zIndex: isHighlighted ? 50 : 10 }}
          onClick={() => onClick(anomaly)}
        >
          <div className={`transition-all duration-300 cursor-pointer ${isHighlighted ? "scale-125 ring-4 ring-white" : "hover:scale-110"}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4fb3ff] to-[#2e7bbf] border-2 border-[#4fb3ff] flex items-center justify-center shadow-lg" />
          </div>
          <span className="mt-1 text-xs font-mono text-[#4fb3ff] bg-[#071025]/80 px-2 py-0.5 rounded shadow-lg">{title || (Math.random() < 0.5 ? 'Mineral deposit' : 'Training data source')}</span>
        </div>
      )
    }
    return (
      <div
        key={anomaly.id}
        className={`${inline ? 'relative' : 'absolute'} flex flex-col items-center`}
        style={inline ? { zIndex: isHighlighted ? 50 : 10 } : { left: `${anomaly.x}%`, top: `${anomaly.y}%`, zIndex: isHighlighted ? 50 : 10 }}
        onClick={() => onClick(anomaly)}
      >
        <div
          className={`transition-all duration-300 cursor-pointer ${isHighlighted ? "scale-125 ring-4 ring-white" : "hover:scale-110"}`}
        >
          {getIcon()}
        </div>
        <span className={`mt-1 text-xs font-mono px-2 py-0.5 rounded shadow-lg ${
          title === "Planet candidate" || title === "Asteroid candidate" 
            ? "text-[#a8a8a8] bg-[#2a2a2a]/80" 
            : "text-[#78cce2] bg-[#0a0a2a]/80"
        }`}>
          {title}
        </span>
      </div>
    )
  }

  return renderByStatus((title && title === 'Object of Interest') ? 'active' : undefined);
}
