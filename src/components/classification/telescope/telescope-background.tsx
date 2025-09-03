"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { generateSectorName, generateStars, filterAnomaliesBySector } from "@/src/components/classification/telescope/utils/sector-utils"
import { useDatabaseOperations } from "./blocks/viewport/db-ops"
import { AnomalyComponent } from "../viewport/anomaly-component"
import { AnomalyDetailDialog } from "../viewport/anomaly-detail-dialogue"

interface TelescopeBackgroundProps {
  sectorX?: number
  sectorY?: number
  showAllAnomalies?: boolean
  isDarkTheme?: boolean
  onAnomalyClick?: (anomaly: Anomaly) => void
  variant?:
    | "default"
    | "stars-only"
    | "reduced-density"
    | "leo"
    | "inner-solar"
    | "outer-solar"
    | "interstellar"
    | "nebula"
};

const generateEnvironmentStars = ( sectorX: number, sectorY: number, variant: string ): Star[] => {
  const baseStars = generateStars(sectorX, sectorY);

  let filteredStars = baseStars
  if (variant === "reduced-density") {
    filteredStars = baseStars.filter((_, index) => index % 4 === 0);
  };

  switch ( variant ) {
    case "leo":
      // Low Earth Orbit: Fewer stars due to atmospheric scattering, brighter stars are more visible
      return filteredStars
        .filter((_, index) => index % 3 === 0)
        .map(( star) => ({
          ...star,
          opacity: star.opacity * 0.6,
          color: star.size > 2 ? "#e6f3ff" : "#b3d9ff",
          size: star.size * 0.8,
        }))

  case "inner-solar":
    // Moderate stars, warmer colours from solar radiation
    return filteredStars
      .filter((_, index) => index % 2 === 0)
      .map((star) => ({
        ...star,
        color: star.size > 2 ? "#fff5e6" : "#ffe6cc",
        opacity: star.opacity * 0.8,
        size: star.size * 1.1,
      }))
  case "outer-solar":
    // Outer solar system: More stars, cooler colors
    return filteredStars.map((star) => ({
      ...star,
      color: star.size > 2 ? "#e6f0ff" : "#cce6ff", // Cooler, bluer tint
      opacity: star.opacity * 0.9,
      size: star.size * 0.9,
    }))

    case "interstellar":
      // Interstellar: Maximum stars, very cold colors
      return [
        ...filteredStars,
        ...filteredStars.map((star) => ({
          ...star,
          x: (star.x + 50) % 100,
          y: (star.y + 50) % 100,
          size: star.size * 0.7,
        })),
      ].map((star) => ({
        ...star,
        color: star.size > 2 ? "#f0f8ff" : "#e0f0ff", // Very cold, icy colors
        opacity: star.opacity * 1.1,
        twinkleSpeed: star.twinkleSpeed * 1.5, // More twinkling in deep space
      }))

    case "nebula":
      // Nebula: Fewer but brighter stars, some colored by nebula gas
      return filteredStars
        .filter((_, index) => index % 4 === 0) // Reduce by 75%
        .map((star) => ({
          ...star,
          size: star.size * 1.5,
          opacity: star.opacity * 1.2,
          color:
            Math.random() > 0.7
              ? ["#ff6b9d", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"][Math.floor(Math.random() * 5)]
              : star.color,
        }))

    default:
      return filteredStars
  };
};

export function TelescopeBackground({
  sectorX = 0,
  sectorY = 0,
  showAllAnomalies = false,
  isDarkTheme = true,
  onAnomalyClick,
  variant = "default",
}: TelescopeBackgroundProps) {
  const session = useSession()
  const viewportRef = useRef<HTMLDivElement>(null)
  const { fetchAnomalies } = useDatabaseOperations()
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)

  // Handle anomaly click
  const handleAnomalyClick = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly)
    if (onAnomalyClick) {
      onAnomalyClick(anomaly)
    }
  }

  // Close anomaly info panel
  const handleCloseAnomalyInfo = () => {
    setSelectedAnomaly(null)
  }

  // Get environment-specific background styles
  const getBackgroundStyle = () => {
    switch (variant) {
      case "leo":
        return {
          background: `
            radial-gradient(ellipse at 50% 100%, #1a4d66 0%, transparent 60%),
            radial-gradient(ellipse at 30% 80%, #0d3d52 0%, transparent 50%),
            linear-gradient(180deg, #000814 0%, #1a4d66 40%, #2d5f7a 100%)
          `,
        }

      case "inner-solar":
        return {
          background: `
            radial-gradient(ellipse at 70% 30%, #4d3319 0%, transparent 70%),
            radial-gradient(ellipse at 20% 60%, #331f0d 0%, transparent 60%),
            linear-gradient(135deg, #1a0f08 0%, #4d3319 50%, #664426 100%)
          `,
        }

      case "outer-solar":
        return {
          background: `
            radial-gradient(ellipse at 40% 20%, #0d1a33 0%, transparent 70%),
            radial-gradient(ellipse at 80% 70%, #051122 0%, transparent 60%),
            linear-gradient(135deg, #020408 0%, #0d1a33 50%, #1a2d4d 100%)
          `,
        }

      case "interstellar":
        return {
          background: `
            radial-gradient(ellipse at 60% 40%, #0a0a1a 0%, transparent 80%),
            radial-gradient(ellipse at 20% 80%, #050510 0%, transparent 70%),
            radial-gradient(ellipse at 90% 10%, #0f0f2a 0%, transparent 60%),
            linear-gradient(135deg, #000000 0%, #0a0a1a 30%, #050510 70%, #000000 100%)
          `,
        }

      case "nebula":
        return {
          background: `
            radial-gradient(ellipse at 30% 40%, #4a1a4a 0%, transparent 60%),
            radial-gradient(ellipse at 70% 20%, #1a4a4a 0%, transparent 70%),
            radial-gradient(ellipse at 50% 80%, #4a4a1a 0%, transparent 50%),
            linear-gradient(135deg, #1a0a1a 0%, #2a1a2a 50%, #1a2a2a 100%)
          `,
        }

      default:
        // Original background styles
        return {
          background:
            variant === "stars-only" && isDarkTheme
              ? `
            radial-gradient(ellipse at 30% 40%, #0a0a2a 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, #050520 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, #0a0a30 0%, transparent 70%),
            linear-gradient(135deg, #050520 0%, #0a0a2a 50%, #0f0f35 100%)
          `
              : isDarkTheme
                ? `
            radial-gradient(ellipse at 30% 40%, #0a0a1a 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, #000510 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, #050510 0%, transparent 70%),
            linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000510 100%)
          `
                : `
            radial-gradient(ellipse at 30% 40%, #ffffff 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, #f0f0f0 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, #e0e0e0 0%, transparent 70%),
            linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #e0e0e0 100%)
          `,
        }
    }
  }

  // Get environment-specific nebula effects
  const getNebulaEffects = () => {
    switch (variant) {
      case "leo":
        return {
          background: `
            radial-gradient(ellipse 400px 200px at 50% 90%, #4d9fff22 0%, transparent 70%),
            radial-gradient(ellipse 300px 150px at 20% 70%, #66b3ff22 0%, transparent 60%)
          `,
        }

      case "inner-solar":
        return {
          background: `
            radial-gradient(ellipse 350px 180px at 70% 30%, #ffcc6622 0%, transparent 70%),
            radial-gradient(ellipse 250px 120px at 30% 60%, #ff994422 0%, transparent 60%),
            radial-gradient(ellipse 200px 100px at 80% 80%, #ffb36622 0%, transparent 50%)
          `,
        }

      case "outer-solar":
        return {
          background: `
            radial-gradient(ellipse 300px 150px at 40% 20%, #6699ff22 0%, transparent 70%),
            radial-gradient(ellipse 200px 100px at 80% 70%, #4d80ff22 0%, transparent 60%),
            radial-gradient(ellipse 150px 200px at 20% 80%, #80b3ff22 0%, transparent 50%)
          `,
        }

      case "interstellar":
        return {
          background: `
            radial-gradient(ellipse 500px 250px at 60% 40%, #b3b3ff11 0%, transparent 80%),
            radial-gradient(ellipse 300px 150px at 20% 80%, #ccccff11 0%, transparent 70%),
            radial-gradient(ellipse 200px 300px at 90% 10%, #e6e6ff11 0%, transparent 60%)
          `,
        }

      case "nebula":
        return {
          background: `
            radial-gradient(ellipse 400px 200px at 30% 40%, #ff6b9d44 0%, transparent 60%),
            radial-gradient(ellipse 300px 300px at 70% 20%, #4ecdc444 0%, transparent 70%),
            radial-gradient(ellipse 250px 150px at 50% 80%, #45b7d144 0%, transparent 50%),
            radial-gradient(ellipse 200px 200px at 80% 60%, #96ceb444 0%, transparent 60%),
            radial-gradient(ellipse 350px 180px at 20% 20%, #feca5744 0%, transparent 70%)
          `,
        }

      default:
        // Original nebula effects
        return {
          background:
            variant === "stars-only" && isDarkTheme
              ? `
            radial-gradient(ellipse 300px 150px at 20% 30%, #4a4aea22 0%, transparent 70%),
            radial-gradient(ellipse 200px 100px at 80% 70%, #3a3ad922 0%, transparent 70%),
            radial-gradient(ellipse 150px 200px at 60% 20%, #5a5aeb22 0%, transparent 70%)
          `
              : isDarkTheme
                ? `
            radial-gradient(ellipse 300px 150px at 20% 30%, #a8d8ea22 0%, transparent 70%),
            radial-gradient(ellipse 200px 100px at 80% 70%, #ffb3d922 0%, transparent 70%),
            radial-gradient(ellipse 150px 200px at 60% 20%, #b8e6b822 0%, transparent 70%)
          `
                : `
            radial-gradient(ellipse 300px 150px at 20% 30%, #ffffff33 0%, transparent 70%),
            radial-gradient(ellipse 200px 100px at 80% 70%, #e6f3ff33 0%, transparent 70%),
            radial-gradient(ellipse 150px 200px at 60% 20%, #f0f8ff33 0%, transparent 70%)
          `,
        }
    }
  }

  // Get environment name for display
  const getEnvironmentName = () => {
    switch (variant) {
      case "leo":
        return "LOW EARTH ORBIT"
      case "inner-solar":
        return "INNER SOLAR SYSTEM"
      case "outer-solar":
        return "OUTER SOLAR SYSTEM"
      case "interstellar":
        return "INTERSTELLAR SPACE"
      case "nebula":
        return "NEBULA REGION"
      case "stars-only":
        return "STARFIELD MODE"
      case "reduced-density":
        return "REDUCED DENSITY"
      default:
        return "DEEP SPACE"
    }
  }

  // Load data on mount
  useEffect(() => {
    // Load data directly without the callback to avoid dependency issues
    const loadDataDirectly = async () => {
      setLoading(true)
      try {
        const fetchedAnomalies = await fetchAnomalies()
        setAnomalies(fetchedAnomalies)

        // Generate environment-specific stars
        const environmentStars = generateEnvironmentStars(sectorX, sectorY, variant)
        setStars(environmentStars)

        // Filter anomalies immediately based on variant
        if (variant === "stars-only") {
          // Show no anomalies for stars-only variant
          setFilteredAnomalies([])
        } else if (showAllAnomalies) {
          const maxAnomalies =
            variant === "reduced-density" ? 12 : variant === "leo" ? 8 : variant === "nebula" ? 15 : 50
          setFilteredAnomalies(fetchedAnomalies.slice(0, maxAnomalies))
        } else {
          const sectorAnomalies = filterAnomaliesBySector(fetchedAnomalies, sectorX, sectorY)
          const maxAnomalies = variant === "reduced-density" ? 5 : variant === "leo" ? 3 : variant === "nebula" ? 8 : 20
          setFilteredAnomalies(sectorAnomalies.slice(0, maxAnomalies))
        }
      } catch (error) {
        console.error("TelescopeBackground: Error loading anomalies:", error)
        // Even on error, generate stars so something shows
        const environmentStars = generateEnvironmentStars(sectorX, sectorY, variant)
        setStars(environmentStars)
      } finally {
        setLoading(false)
      }
    }

    loadDataDirectly()
  }, [sectorX, sectorY, showAllAnomalies, variant]) // Include variant in dependencies

  if (loading) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${isDarkTheme ? "bg-gradient-to-b from-[#000000] to-[#0a0a1a]" : "bg-gradient-to-b from-[#87CEEB] to-[#4682B4]"}`}
      >
        <div className="text-center">
          <div
            className={`w-8 h-8 border-2 ${isDarkTheme ? "border-[#78cce2]" : "border-white"} border-t-transparent rounded-full animate-spin mx-auto mb-2`}
          ></div>
          <div className={`${isDarkTheme ? "text-[#78cce2]" : "text-white"} text-sm font-mono`}>LOADING...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Debug info */}
      {/* <div className={`absolute top-2 right-2 ${isDarkTheme ? "text-white" : "text-slate-800"} text-xs z-50`}>
        {variant === "stars-only"
          ? `Stars: ${stars.length} | Mode: Stars Only`
          : variant === "reduced-density"
            ? `Stars: ${stars.length} | Anomalies: ${filteredAnomalies.length} | Mode: Reduced`
            : `Stars: ${stars.length} | Anomalies: ${filteredAnomalies.length} | ${getEnvironmentName()}`}
      </div> */}

      {/* Space Background */}
      <div ref={viewportRef} className="w-full h-full relative" style={getBackgroundStyle()}>
        {/* Stars */}
        {stars.map((star, index) => (
          <div
            key={index}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${Math.max(star.size * 0.5, 1)}px`,
              height: `${Math.max(star.size * 0.5, 1)}px`,
              backgroundColor: isDarkTheme ? star.color : "#ffffff",
              opacity: isDarkTheme ? star.opacity * 0.8 : star.opacity * 0.6,
              animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite alternate`,
              boxShadow: isDarkTheme ? `0 0 ${star.size}px ${star.color}` : `0 0 ${star.size}px #ffffff88`,
            }}
          />
        ))}

        {/* Environment-specific nebula effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            ...getNebulaEffects(),
            opacity: variant === "nebula" ? 0.6 : variant === "leo" ? 0.3 : 0.1,
          }}
        />

        {/* Additional atmospheric effects for LEO */}
        {variant === "leo" && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `
                linear-gradient(0deg, #4d9fff44 0%, transparent 30%),
                radial-gradient(ellipse at 50% 100%, #66b3ff33 0%, transparent 40%)
              `,
            }}
          />
        )}

        {/* Cosmic dust for interstellar */}
        {variant === "interstellar" && (
          <div className="absolute inset-0 pointer-events-none opacity-5">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-px bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `drift ${10 + Math.random() * 20}s linear infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Anomalies - only show if not stars-only variant */}
        {/* {variant !== "stars-only" &&
          filteredAnomalies.map((anomaly) => (
            <AnomalyComponent
              key={anomaly.id}
              anomaly={anomaly}
              onClick={handleAnomalyClick}
              isHighlighted={selectedAnomaly?.id === anomaly.id}
            />
          ))}

        Info overlay - only show if not stars-only variant
        {variant !== "stars-only" && !showAllAnomalies && (
          <div
            className={`absolute top-4 left-4 ${isDarkTheme ? "bg-[#002439]/90 text-[#78cce2] border-[#78cce2]/30" : "bg-white/90 text-slate-800 border-slate-400/50"} px-3 py-2 rounded-lg text-xs font-mono border backdrop-blur-sm`}
          >
            <div>SECTOR: {generateSectorName(sectorX, sectorY)}</div>
            <div>ANOMALIES: {filteredAnomalies.length}</div>
            {(variant === "reduced-density" ||
              ["leo", "inner-solar", "outer-solar", "interstellar", "nebula"].includes(variant)) && (
              <div>MODE: {getEnvironmentName()}</div>
            )}
          </div>
        )}

        {variant !== "stars-only" && showAllAnomalies && (
          <div
            className={`absolute top-4 left-4 ${isDarkTheme ? "bg-[#002439]/90 text-[#78cce2] border-[#78cce2]/30" : "bg-white/90 text-slate-800 border-slate-400/50"} px-3 py-2 rounded-lg text-xs font-mono border backdrop-blur-sm`}
          >
            <div>OVERVIEW MODE</div>
            <div>
              SHOWING: {filteredAnomalies.length} OF {anomalies.length}
            </div>
            {(variant === "reduced-density" ||
              ["leo", "inner-solar", "outer-solar", "interstellar", "nebula"].includes(variant)) && (
              <div>MODE: {getEnvironmentName()}</div>
            )}
          </div>
        )} */}

        {/* Stars-only mode info overlay */}
        {/* {variant === "stars-only" && (
          <div
            className={`absolute top-4 left-4 ${isDarkTheme ? "bg-[#002439]/90 text-[#78cce2] border-[#78cce2]/30" : "bg-white/90 text-slate-800 border-slate-400/50"} px-3 py-2 rounded-lg text-xs font-mono border backdrop-blur-sm`}
          >
            <div>STARFIELD MODE</div>
            <div>SECTOR: {generateSectorName(sectorX, sectorY)}</div>
          </div>
        )} */}
      </div>

      {/* Anomaly Info Panel
      {selectedAnomaly && (
        <AnomalyDetailDialog anomaly={selectedAnomaly} onClose={handleCloseAnomalyInfo} isDarkTheme={isDarkTheme} />
      )} */}

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
        
        @keyframes drift {
          0% {
            transform: translateX(-10px) translateY(-10px);
          }
          100% {
            transform: translateX(10px) translateY(10px);
          }
        }
      `}</style>
    </div>
  )
};