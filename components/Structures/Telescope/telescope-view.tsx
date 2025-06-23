"use client"

import type React from "react"
import { useRef } from "react"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { AnomalyComponent } from "./anomaly-component"
import { Move, Zap, Radio, Gauge, Activity, Cpu, HardDrive, Wifi } from "lucide-react"

interface TelescopeViewProps {
  stars: Star[]
  filteredAnomalies: Anomaly[]
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleAnomalyClick: (anomaly: Anomaly) => void
  currentSectorName: string
  focusedAnomaly?: Anomaly | null
};

export function TelescopeView({
  stars,
  filteredAnomalies,
  isDragging,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleAnomalyClick,
  currentSectorName,
  focusedAnomaly,
}: TelescopeViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="h-screen bg-gradient-to-br from-[#BF616A] via-[#D08770] to-[#EBCB8B] p-6 flex items-center justify-center">
      {/* Main Device Frame */}
      <div className="relative w-full h-full max-w-7xl max-h-[900px] bg-gradient-to-br from-[#BF616A] to-[#D08770] rounded-3xl shadow-2xl border-4 border-[#2E3440] p-6">
        {/* Top Control Panel */}
        <div className="absolute top-6 left-6 right-6 h-16 bg-gradient-to-r from-[#D08770] to-[#BF616A] rounded-2xl border-2 border-[#2E3440] flex items-center justify-between px-6">
          {/* Left Side - Status Lights */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-[#A3BE8C] rounded-full border-2 border-[#2E3440] animate-pulse" />
            <div className="w-4 h-4 bg-[#EBCB8B] rounded-full border-2 border-[#2E3440]" />
            <div className="w-4 h-4 bg-[#BF616A] rounded-full border-2 border-[#2E3440]" />
            <div className="text-[#2E3440] font-bold text-sm">TELESCOPE</div>
          </div>

          {/* Right Side - System Info */}
          <div className="flex items-center gap-4 text-[#2E3440] text-sm font-mono">
            <div className="flex items-center gap-1">
              <Radio className="h-4 w-4" />
              <span>ONLINE</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>STABLE</span>
            </div>
          </div>
        </div>

        {/* Left Control Panel */}
        <div className="absolute left-6 top-28 bottom-6 w-32 bg-gradient-to-b from-[#434C5E] to-[#3B4252] rounded-2xl border-2 border-[#2E3440] p-4 space-y-4 hidden sm:block">
          {/* Mini Screens */}
          <div className="h-16 bg-[#2E3440] rounded-lg border border-[#4C566A] flex items-center justify-center">
            <Gauge className="h-6 w-6 text-[#88C0D0]" />
          </div>

          <div className="h-12 bg-[#2E3440] rounded-lg border border-[#4C566A] flex items-center justify-center">
            <div className="text-[#A3BE8C] text-xs font-mono">SCAN</div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-2">
            <div className="w-8 h-8 bg-[#5E81AC] rounded-full border-2 border-[#2E3440] mx-auto" />
            <div className="w-6 h-6 bg-[#EBCB8B] rounded border border-[#2E3440] mx-auto" />
            <div className="w-6 h-6 bg-[#A3BE8C] rounded border border-[#2E3440] mx-auto" />
          </div>

          {/* Status Bars */}
          <div className="space-y-2">
            <div className="h-2 bg-[#2E3440] rounded border border-[#4C566A]">
              <div className="h-full w-3/4 bg-[#A3BE8C] rounded" />
            </div>
            <div className="h-2 bg-[#2E3440] rounded border border-[#4C566A]">
              <div className="h-full w-1/2 bg-[#EBCB8B] rounded" />
            </div>
          </div>
        </div>

        {/* Right Control Panel */}
        <div className="absolute right-6 top-28 bottom-6 w-32 bg-gradient-to-b from-[#434C5E] to-[#3B4252] rounded-2xl border-2 border-[#2E3440] p-4 space-y-4 hidden sm:block">
          {/* System Monitors */}
          <div className="h-20 bg-[#2E3440] rounded-lg border border-[#4C566A] p-2">
            <div className="flex flex-col gap-1">
              <div className="text-[#88C0D0] text-xs font-mono">PWR</div>
              <div className="h-1 bg-[#88C0D0] rounded w-full" />
              <div className="text-[#EBCB8B] text-xs font-mono">SIG</div>
              <div className="h-1 bg-[#EBCB8B] rounded w-2/3" />
            </div>
          </div>

          {/* More Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div className="w-full h-6 bg-[#5E81AC] rounded border border-[#2E3440]" />
            <div className="w-full h-6 bg-[#BF616A] rounded border border-[#2E3440]" />
            <div className="w-full h-6 bg-[#A3BE8C] rounded border border-[#2E3440]" />
            <div className="w-full h-6 bg-[#EBCB8B] rounded border border-[#2E3440]" />
          </div>

          {/* Data Display */}
          <div className="h-16 bg-[#2E3440] rounded-lg border border-[#4C566A] flex flex-col justify-center items-center">
            <Cpu className="h-4 w-4 text-[#B48EAD] mb-1" />
            <div className="text-[#B48EAD] text-xs font-mono">DATA</div>
          </div>
        </div>

        {/* Bottom Control Strip */}
        <div className="absolute bottom-6 left-40 right-40 h-12 bg-gradient-to-r from-[#434C5E] to-[#3B4252] rounded-xl border-2 border-[#2E3440] flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[#88C0D0] text-sm font-mono">
            <HardDrive className="h-4 w-4" />
            <span>SECTOR: {currentSectorName}</span>
          </div>
          <div className="w-px h-6 bg-[#4C566A]" />
          <div className="flex items-center gap-2 text-[#A3BE8C] text-sm font-mono">
            <Wifi className="h-4 w-4" />
            <span>TELESCOPE ACTIVE</span>
          </div>
          <div className="w-px h-6 bg-[#4C566A]" />
          <div className="flex items-center gap-2 text-[#EBCB8B] text-sm font-mono">
            <Zap className="h-4 w-4" />
            <span>{filteredAnomalies.length} TARGETS</span>
          </div>
        </div>

        {/* Main Telescope Viewport */}
        <div className="
  absolute 
  left-4 right-4 top-16 bottom-4 
  sm:left-40 sm:right-40 sm:top-28 sm:bottom-24
  bg-gradient-to-br from-[#2E3440] to-[#3B4252] 
  rounded-2xl border-4 border-[#4C566A] p-2
">
          <div
            ref={viewportRef}
            className="w-full h-full rounded-xl overflow-hidden cursor-move border-2 border-[#5E81AC] relative"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, #0a001a 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, #00050f 0%, transparent 50%),
                radial-gradient(ellipse at 40% 80%, #0f000f 0%, transparent 50%),
                radial-gradient(ellipse at 60% 20%, #000f00 0%, transparent 50%),
                linear-gradient(135deg, #050510 0%, #0a0a20 25%, #0f0a20 50%, #0a1020 75%, #050a10 100%)
              `,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Stars */}
            {stars.map((star, index) => (
              <div
                key={index}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  opacity: star.opacity,
                  animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite alternate`,
                  boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
                }}
              />
            ))}

            {/* Nebula Effects */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: `
                  radial-gradient(ellipse 400px 200px at 25% 25%, #ff006622 0%, transparent 50%),
                  radial-gradient(ellipse 300px 150px at 75% 75%, #00ff6622 0%, transparent 50%),
                  radial-gradient(ellipse 200px 300px at 50% 10%, #6600ff22 0%, transparent 50%),
                  radial-gradient(ellipse 250px 100px at 10% 90%, #ffff0022 0%, transparent 50%)
                `,
              }}
            />

            {/* Anomalies */}
            {filteredAnomalies.map((anomaly) => (
              <AnomalyComponent
                key={anomaly.id}
                anomaly={anomaly}
                onClick={handleAnomalyClick}
                isHighlighted={focusedAnomaly?.id === anomaly.id}
              />
            ))}

            {/* Enhanced Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-12 h-12 border border-cyan-400/30 rounded-full">
                <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-400/30 transform -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 w-px h-full bg-cyan-400/30 transform -translate-x-1/2" />
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400/50 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Drag Indicator */}
            {isDragging && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 pointer-events-none border border-cyan-400/50">
                <Move className="h-3 w-3" />
                <span>Navigating...</span>
              </div>
            )}

            {/* Focus Indicator */}
            {focusedAnomaly && (
              <div className="absolute top-4 right-4 bg-[#5E81AC]/80 text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
                <div className="font-bold">{focusedAnomaly.name}</div>
                <div className="text-xs opacity-90">Target Locked</div>
              </div>
            )}
          </div>
        </div>

        {/* Corner Details */}
        <div className="absolute top-6 left-6 w-8 h-8 bg-[#88C0D0] rounded-full border-2 border-[#2E3440]" />
        <div className="absolute top-6 right-6 w-6 h-6 bg-[#A3BE8C] rounded border border-[#2E3440]" />
        <div className="absolute bottom-6 left-6 w-6 h-6 bg-[#EBCB8B] rounded border border-[#2E3440]" />
        <div className="absolute bottom-6 right-6 w-8 h-8 bg-[#B48EAD] rounded-full border-2 border-[#2E3440]" />
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0% {
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};