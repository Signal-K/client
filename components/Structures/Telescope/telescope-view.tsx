"use client"

import type React from "react"
import { useRef } from "react"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { AnomalyComponent } from "../Viewport/anomaly-component"
import { Move } from "lucide-react"

interface TelescopeViewProps {
  stars?: Star[]
  filteredAnomalies?: Anomaly[]
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleAnomalyClick: (anomaly: Anomaly) => void
  currentSectorName: string
  focusedAnomaly?: Anomaly | null
  anomalies?: Anomaly[]
}

export function TelescopeView({
  stars = [],
  filteredAnomalies = [],
  isDragging,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleAnomalyClick,
  currentSectorName,
  focusedAnomaly = null,
  anomalies = [],
}: TelescopeViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="h-full relative">
      {/* Main Viewport - Clean space view like the reference image */}
      <div
        ref={viewportRef}
        className="w-full h-full cursor-move relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, #0a0a1a 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, #000510 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, #050510 0%, transparent 70%),
            linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000510 100%)
          `,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Stars - smaller and more subtle */}
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${Math.max(star.size * 0.5, 1)}px`,
              height: `${Math.max(star.size * 0.5, 1)}px`,
              backgroundColor: star.color,
              opacity: star.opacity * 0.8,
              animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite alternate`,
              boxShadow: `0 0 ${star.size}px ${star.color}`,
            }}
          />
        ))}

        {/* Subtle nebula effects */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `
              radial-gradient(ellipse 300px 150px at 20% 30%, #a8d8ea22 0%, transparent 70%),
              radial-gradient(ellipse 200px 100px at 80% 70%, #ffb3d922 0%, transparent 70%),
              radial-gradient(ellipse 150px 200px at 60% 20%, #b8e6b822 0%, transparent 70%)
            `,
          }}
        />

        {/* Simple crosshair in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-8 h-8 border border-[#a8d8ea]/40 rounded-full relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-[#a8d8ea]/30 transform -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 w-px h-full bg-[#a8d8ea]/30 transform -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#a8d8ea]/60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Anomalies */}
        {filteredAnomalies.map((anomaly) => (
          <AnomalyComponent
            key={anomaly.id}
            anomaly={anomaly}
            onClick={handleAnomalyClick}
            isHighlighted={focusedAnomaly?.id === anomaly.id}
          />
        ))}

        {/* Dragging Indicator */}
        {isDragging && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#16213e]/90 text-[#a8d8ea] px-4 py-2 rounded-full text-sm flex items-center gap-2 pointer-events-none border border-[#a8d8ea]/30 backdrop-blur-sm">
            <Move className="h-4 w-4" />
            <span className="font-mono">NAVIGATING...</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0% {
            opacity: 0.4;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};