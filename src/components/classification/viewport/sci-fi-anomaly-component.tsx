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

    if (title === "Stellar disk") {
      return (
        <div className="w-10 h-10 relative flex items-center justify-center">
          {/* SVG for accretion disk with brown to red-yellow gradient */}
          <svg width="40" height="40" viewBox="0 0 40 40" className="absolute">
            <defs>
              {/* Radial gradient from brown center to red-yellow outer */}
              <radialGradient id="accretionGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B4513" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#A0522D" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#CD853F" stopOpacity="0.7" />
                <stop offset="85%" stopColor="#DAA520" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.4" />
              </radialGradient>
              {/* Inner darker gradient for depth */}
              <radialGradient id="accretionInner" cx="50%" cy="50%" r="35%">
                <stop offset="0%" stopColor="#654321" stopOpacity="1" />
                <stop offset="50%" stopColor="#8B4513" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#A0522D" stopOpacity="0.6" />
              </radialGradient>
              {/* Bright center star */}
              <radialGradient id="centralStar" cx="50%" cy="50%" r="20%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="70%" stopColor="#FFE4B5" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#DEB887" stopOpacity="0.7" />
              </radialGradient>
            </defs>
            
            {/* Outer disk ring */}
            <ellipse cx="20" cy="20" rx="18" ry="6" fill="url(#accretionGradient)" 
                     opacity="0.8" transform="rotate(-15 20 20)" />
            
            {/* Middle disk ring */}
            <ellipse cx="20" cy="20" rx="14" ry="4.5" fill="url(#accretionInner)" 
                     opacity="0.9" transform="rotate(-15 20 20)" />
            
            {/* Inner bright ring */}
            <ellipse cx="20" cy="20" rx="9" ry="3" fill="url(#accretionGradient)" 
                     opacity="1" transform="rotate(-15 20 20)" />
            
            {/* Central star */}
            <circle cx="20" cy="20" r="3" fill="url(#centralStar)" />
            
            {/* Bright center point */}
            <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" opacity="0.9" />
          </svg>
          
          {/* Glow effect */}
          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#8B4513] opacity-20 blur-sm"></div>
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
          <div className="w-10 h-10 relative flex items-center justify-center">
            {/* SVG for accretion disk with brown to red-yellow gradient */}
            <svg width="40" height="40" viewBox="0 0 40 40" className="absolute">
              <defs>
                {/* Radial gradient from brown center to red-yellow outer */}
                <radialGradient id="accretionGradient2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B4513" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#A0522D" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#CD853F" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#DAA520" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0.4" />
                </radialGradient>
                {/* Inner darker gradient for depth */}
                <radialGradient id="accretionInner2" cx="50%" cy="50%" r="35%">
                  <stop offset="0%" stopColor="#654321" stopOpacity="1" />
                  <stop offset="50%" stopColor="#8B4513" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#A0522D" stopOpacity="0.6" />
                </radialGradient>
                {/* Bright center star */}
                <radialGradient id="centralStar2" cx="50%" cy="50%" r="20%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="70%" stopColor="#FFE4B5" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#DEB887" stopOpacity="0.7" />
                </radialGradient>
              </defs>
              
              {/* Outer disk ring */}
              <ellipse cx="20" cy="20" rx="18" ry="6" fill="url(#accretionGradient2)" 
                       opacity="0.8" transform="rotate(-15 20 20)" />
              
              {/* Middle disk ring */}
              <ellipse cx="20" cy="20" rx="14" ry="4.5" fill="url(#accretionInner2)" 
                       opacity="0.9" transform="rotate(-15 20 20)" />
              
              {/* Inner bright ring */}
              <ellipse cx="20" cy="20" rx="9" ry="3" fill="url(#accretionGradient2)" 
                       opacity="1" transform="rotate(-15 20 20)" />
              
              {/* Central star */}
              <circle cx="20" cy="20" r="3" fill="url(#centralStar2)" />
              
              {/* Bright center point */}
              <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" opacity="0.9" />
            </svg>
            
            {/* Glow effect */}
            <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#8B4513] opacity-20 blur-sm"></div>
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
            : title === "Stellar disk"
            ? "text-[#FFD700] bg-[#4a2c17]/80 border border-[#8B4513]/40"
            : "text-[#78cce2] bg-[#0a0a2a]/80"
        }`}>
          {title}
        </span>
      </div>
    )
  }

  return renderByStatus((title && title === 'Object of Interest') ? 'active' : undefined);
}
