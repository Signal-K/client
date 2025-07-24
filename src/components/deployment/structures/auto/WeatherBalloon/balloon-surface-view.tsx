"use client";

import type React from "react";
import { useRef } from "react";
import type { WeatherAnomaly, Planet } from "@/types/Structures/WeatherBalloon";

import { ArrowLeft, Thermometer, Wind, Eye, Move, Gauge, Activity, Satellite, Radio } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface WeatherSurfaceViewProps {
  planet: Planet
  filteredAnomalies: WeatherAnomaly[]
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleAnomalyClick: (anomaly: WeatherAnomaly) => void
  currentRegionName: string
  focusedAnomaly?: WeatherAnomaly | null
  onBackToPlanets: () => void
}

export function WeatherSurfaceView({
  planet,
  filteredAnomalies,
  isDragging,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleAnomalyClick,
  currentRegionName,
  focusedAnomaly,
  onBackToPlanets,
}: WeatherSurfaceViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const getPlanetTheme = (planetId: string) => {
    switch (planetId) {
      case "earth":
        return {
          primary: "#4FC3F7",
          secondary: "#29B6F6",
          bg: "from-[#0277BD] via-[#0288D1] to-[#039BE5]",
          surface: "from-[#001a2e] via-[#002a3a] to-[#003a4a]",
          frame: "from-[#37474F] to-[#263238]",
          atmosphere: "#E3F2FD",
        }
      case "mars":
        return {
          primary: "#FF7043",
          secondary: "#FF5722",
          bg: "from-[#D84315] via-[#E64A19] to-[#FF3D00]",
          surface: "from-[#2a0a00] via-[#3a1500] to-[#4a2000]",
          frame: "from-[#5D4037] to-[#3E2723]",
          atmosphere: "#FFCCBC",
        }
      case "venus":
        return {
          primary: "#FFC107",
          secondary: "#FF9800",
          bg: "from-[#E65100] via-[#EF6C00] to-[#FF6F00]",
          surface: "from-[#2a1a00] via-[#3a2500] to-[#4a3000]",
          frame: "from-[#FF8F00] to-[#E65100]",
          atmosphere: "#FFF9C4",
        }
      default:
        return {
          primary: "#4FC3F7",
          secondary: "#29B6F6",
          bg: "from-[#0277BD] via-[#0288D1] to-[#039BE5]",
          surface: "from-[#001a2e] via-[#002a3a] to-[#003a4a]",
          frame: "from-[#37474F] to-[#263238]",
          atmosphere: "#E3F2FD",
        }
    }
  }

  const theme = getPlanetTheme(planet.id)

  return (
    <div className={`h-full bg-gradient-to-br ${theme.bg} p-4 flex items-center justify-center`}>
      {/* Main Observatory Frame */}
      <div
        className={`relative w-full h-full max-w-6xl max-h-[800px] bg-gradient-to-br ${theme.frame} rounded-2xl shadow-2xl border-2 border-[#455A64] p-4`}
      >
        {/* Top Control Panel */}
        <div className="absolute top-4 left-4 right-4 h-12 bg-gradient-to-r from-[#546E7A] to-[#455A64] rounded-xl border border-[#37474F] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBackToPlanets}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Planets
            </Button>
            <div className="w-3 h-3 bg-[#4CAF50] rounded-full border border-[#37474F] animate-pulse" />
            <div className="text-[#ECEFF4] font-bold text-sm">{planet.name.toUpperCase()} OBSERVATORY</div>
          </div>
          <div className="flex items-center gap-3 text-[#ECEFF4] text-xs">
            <div className="flex items-center gap-1">
              <Radio className="h-3 w-3" />
              <span>ACTIVE</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>MONITORING</span>
            </div>
          </div>
        </div>

        {/* Left Control Panel */}
        <div className="absolute left-4 top-20 bottom-16 w-24 bg-gradient-to-b from-[#455A64] to-[#37474F] rounded-xl border border-[#263238] p-3 space-y-3">
          <div className="h-12 bg-[#263238] rounded border border-[#37474F] flex items-center justify-center">
            <Thermometer className="h-4 w-4" style={{ color: theme.primary }} />
          </div>
          <div className="h-8 bg-[#263238] rounded border border-[#37474F] flex items-center justify-center">
            <div className="text-[#4CAF50] text-xs font-mono">TEMP</div>
          </div>
          <div className="space-y-1">
            <div
              className="w-6 h-6 rounded-full border border-[#263238] mx-auto"
              style={{ backgroundColor: theme.primary }}
            />
            <div
              className="w-4 h-4 rounded border border-[#263238] mx-auto"
              style={{ backgroundColor: theme.secondary }}
            />
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-[#263238] rounded border border-[#37474F]">
              <div className="h-full w-3/4 bg-[#4CAF50] rounded" />
            </div>
            <div className="h-1 bg-[#263238] rounded border border-[#37474F]">
              <div className="h-full w-1/2 bg-[#FFC107] rounded" />
            </div>
          </div>
        </div>

        {/* Right Control Panel */}
        <div className="absolute right-4 top-20 bottom-16 w-24 bg-gradient-to-b from-[#455A64] to-[#37474F] rounded-xl border border-[#263238] p-3 space-y-3">
          <div className="h-12 bg-[#263238] rounded border border-[#37474F] p-2">
            <div className="flex flex-col gap-1">
              <div className="text-[#03A9F4] text-xs font-mono">ATM</div>
              <div className="h-1 bg-[#03A9F4] rounded w-full" />
              <div className="text-[#FFC107] text-xs font-mono">HUM</div>
              <div className="h-1 bg-[#FFC107] rounded w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="w-full h-4 rounded border border-[#263238]" style={{ backgroundColor: theme.primary }} />
            <div className="w-full h-4 bg-[#F44336] rounded border border-[#263238]" />
            <div className="w-full h-4 bg-[#4CAF50] rounded border border-[#263238]" />
            <div className="w-full h-4 bg-[#FFC107] rounded border border-[#263238]" />
          </div>
          <div className="h-12 bg-[#263238] rounded border border-[#37474F] flex flex-col justify-center items-center">
            <Wind className="h-3 w-3 text-[#9C27B0] mb-1" />
            <div className="text-[#9C27B0] text-xs font-mono">WIND</div>
          </div>
        </div>

        {/* Bottom Control Strip */}
        <div className="absolute bottom-4 left-28 right-28 h-8 bg-gradient-to-r from-[#455A64] to-[#37474F] rounded-lg border border-[#263238] flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-[#03A9F4] text-xs font-mono">
            <Gauge className="h-3 w-3" />
            <span>REGION: {currentRegionName}</span>
          </div>
          <div className="w-px h-4 bg-[#37474F]" />
          <div className="flex items-center gap-1 text-[#4CAF50] text-xs font-mono">
            <Satellite className="h-3 w-3" />
            <span>ACTIVE</span>
          </div>
          <div className="w-px h-4 bg-[#37474F]" />
          <div className="flex items-center gap-1 text-[#FFC107] text-xs font-mono">
            <Eye className="h-3 w-3" />
            <span>{filteredAnomalies.length} PHENOMENA</span>
          </div>
        </div>

        {/* Main Weather Viewport */}
        <div className="absolute left-28 right-28 top-20 bottom-16 bg-gradient-to-br from-[#263238] to-[#37474F] rounded-xl border-2 border-[#455A64] p-1">
          <div
            ref={viewportRef}
            className="w-full h-full rounded-lg overflow-hidden cursor-move border border-[#607D8B] relative"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 50%),
                linear-gradient(135deg, ${theme.surface.replace("from-[", "").replace("] via-[", ", ").replace("] to-[", ", ").replace("]", "")})
              `,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Enhanced atmospheric effects */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 25 + 8}px`,
                    height: `${Math.random() * 15 + 5}px`,
                    background: `radial-gradient(ellipse, ${theme.atmosphere}40 0%, transparent 70%)`,
                    opacity: Math.random() * 0.4 + 0.1,
                    animation: `atmosphericDrift ${Math.random() * 12 + 6}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    borderRadius: "60% 40% 50% 70%",
                  }}
                />
              ))}
            </div>

            {/* Weather Anomalies */}
            {/* {filteredAnomalies.map((anomaly) => (
              <WeatherAnomalyComponent
                key={anomaly.id}
                anomaly={anomaly}
                onClick={handleAnomalyClick}
                isHighlighted={focusedAnomaly?.id === anomaly.id}
              />
            ))} */}

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-6 h-6 border border-white/20 rounded-full">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/20 transform -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 w-px h-full bg-white/20 transform -translate-x-1/2" />
              </div>
            </div>

            {/* Drag Indicator */}
            {isDragging && (
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1 pointer-events-none">
                <Move className="h-3 w-3" />
                <span>Navigating...</span>
              </div>
            )}

            {/* Focus Indicator */}
            {focusedAnomaly && (
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs pointer-events-none">
                <div className="font-bold">{focusedAnomaly.name}</div>
                <div className="text-xs opacity-90">Locked</div>
              </div>
            )}
          </div>
        </div>

        {/* Corner Details */}
        <div
          className="absolute top-4 left-4 w-6 h-6 rounded-full border border-[#263238]"
          style={{ backgroundColor: theme.primary }}
        />
        <div className="absolute top-4 right-4 w-4 h-4 bg-[#4CAF50] rounded border border-[#263238]" />
        <div className="absolute bottom-4 left-4 w-4 h-4 bg-[#FFC107] rounded border border-[#263238]" />
        <div
          className="absolute bottom-4 right-4 w-6 h-6 rounded-full border border-[#263238]"
          style={{ backgroundColor: theme.secondary }}
        />
      </div>

      {/* CSS for enhanced atmospheric animations */}
      <style jsx>{`
        @keyframes atmosphericDrift {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg) scaleX(1); }
          25% { transform: translateX(15px) translateY(-8px) rotate(2deg) scaleX(1.1); }
          50% { transform: translateX(-8px) translateY(12px) rotate(-1deg) scaleX(0.9); }
          75% { transform: translateX(20px) translateY(6px) rotate(3deg) scaleX(1.05); }
          100% { transform: translateX(0px) translateY(0px) rotate(0deg) scaleX(1); }
        }
      `}</style>
    </div>
  );
};