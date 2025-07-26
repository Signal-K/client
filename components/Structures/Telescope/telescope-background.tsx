"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { generateSectorName, generateStars, filterAnomaliesBySector } from "@/src/features/telescope/utils/sector-utils"
import { useDatabaseOperations } from "./blocks/viewport/db-ops"
import { AnomalyComponent } from "../Viewport/anomaly-component"

interface TelescopeBackgroundProps {
  sectorX?: number
  sectorY?: number
  showAllAnomalies?: boolean
  isDarkTheme?: boolean
  onAnomalyClick?: (anomaly: Anomaly) => void
}

export function TelescopeBackground({
  sectorX = 0,
  sectorY = 0,
  showAllAnomalies = false,
  isDarkTheme = true,
  onAnomalyClick,
}: TelescopeBackgroundProps) {
  const session = useSession()
  const viewportRef = useRef<HTMLDivElement>(null)
  const { fetchAnomalies } = useDatabaseOperations()
  
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [loading, setLoading] = useState(true)

  // Handle anomaly click
  const handleAnomalyClick = (anomaly: Anomaly) => {
    if (onAnomalyClick) {
      onAnomalyClick(anomaly)
    }
  }

  // Load data on mount
  useEffect(() => {
    console.log("TelescopeBackground: Mount effect, session:", !!session)
    
    // Load data directly without the callback to avoid dependency issues
    const loadDataDirectly = async () => {
      console.log("TelescopeBackground: Starting loadData")
      setLoading(true)
      try {
        console.log("TelescopeBackground: Calling fetchAnomalies")
        const fetchedAnomalies = await fetchAnomalies()
        console.log("TelescopeBackground: Fetched anomalies:", fetchedAnomalies.length)
        setAnomalies(fetchedAnomalies)
        
        // Generate stars immediately after getting anomalies
        const sectorStars = generateStars(sectorX, sectorY)
        setStars(sectorStars)
        
        // Filter anomalies immediately
        if (showAllAnomalies) {
          setFilteredAnomalies(fetchedAnomalies.slice(0, 50))
        } else {
          const sectorAnomalies = filterAnomaliesBySector(fetchedAnomalies, sectorX, sectorY)
          setFilteredAnomalies(sectorAnomalies.slice(0, 20))
        }
        
      } catch (error) {
        console.error("TelescopeBackground: Error loading anomalies:", error)
        // Even on error, generate stars so something shows
        const sectorStars = generateStars(sectorX, sectorY)
        setStars(sectorStars)
      } finally {
        console.log("TelescopeBackground: Setting loading to false")
        setLoading(false)
      }
    }
    
    loadDataDirectly()
  }, [sectorX, sectorY, showAllAnomalies]) // Include props that affect the data

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${
        isDarkTheme 
          ? 'bg-gradient-to-b from-[#000000] to-[#0a0a1a]' 
          : 'bg-gradient-to-b from-[#87CEEB] to-[#4682B4]'
      }`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-2 ${
            isDarkTheme ? 'border-[#78cce2]' : 'border-white'
          } border-t-transparent rounded-full animate-spin mx-auto mb-2`}></div>
          <div className={`${
            isDarkTheme ? 'text-[#78cce2]' : 'text-white'
          } text-sm font-mono`}>LOADING...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Debug info */}
      <div className={`absolute top-2 right-2 ${
        isDarkTheme ? 'text-white' : 'text-slate-800'
      } text-xs z-50`}>
        Stars: {stars.length} | Anomalies: {filteredAnomalies.length}
      </div>
      
      {/* Space Background */}
      <div
        ref={viewportRef}
        className="w-full h-full relative"
        style={{
          background: isDarkTheme ? `
            radial-gradient(ellipse at 30% 40%, #0a0a1a 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, #000510 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, #050510 0%, transparent 70%),
            linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000510 100%)
          ` : `
            radial-gradient(ellipse at 30% 40%, #87CEEB 0%, transparent 70%),
            radial-gradient(ellipse at 70% 60%, #4682B4 0%, transparent 70%),
            radial-gradient(ellipse at 20% 80%, #5F9EA0 0%, transparent 70%),
            linear-gradient(135deg, #87CEEB 0%, #4682B4 50%, #2F4F4F 100%)
          `,
        }}
      >
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
              backgroundColor: isDarkTheme ? star.color : '#ffffff',
              opacity: isDarkTheme ? star.opacity * 0.8 : star.opacity * 0.6,
              animation: `twinkle ${star.twinkleSpeed}s ease-in-out infinite alternate`,
              boxShadow: isDarkTheme 
                ? `0 0 ${star.size}px ${star.color}` 
                : `0 0 ${star.size}px #ffffff88`,
            }}
          />
        ))}

        {/* Subtle nebula effects */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: isDarkTheme ? `
              radial-gradient(ellipse 300px 150px at 20% 30%, #a8d8ea22 0%, transparent 70%),
              radial-gradient(ellipse 200px 100px at 80% 70%, #ffb3d922 0%, transparent 70%),
              radial-gradient(ellipse 150px 200px at 60% 20%, #b8e6b822 0%, transparent 70%)
            ` : `
              radial-gradient(ellipse 300px 150px at 20% 30%, #ffffff33 0%, transparent 70%),
              radial-gradient(ellipse 200px 100px at 80% 70%, #e6f3ff33 0%, transparent 70%),
              radial-gradient(ellipse 150px 200px at 60% 20%, #f0f8ff33 0%, transparent 70%)
            `,
          }}
        />

        {/* Anomalies */}
        {filteredAnomalies.map((anomaly) => (
          <AnomalyComponent
            key={anomaly.id}
            anomaly={anomaly}
            onClick={handleAnomalyClick}
            isHighlighted={false}
          />
        ))}

        {/* Info overlay */}
        {!showAllAnomalies && (
          <div className={`absolute top-4 left-4 ${
            isDarkTheme 
              ? 'bg-[#002439]/90 text-[#78cce2] border-[#78cce2]/30' 
              : 'bg-white/90 text-slate-800 border-slate-400/50'
          } px-3 py-2 rounded-lg text-xs font-mono border backdrop-blur-sm`}>
            <div>SECTOR: {generateSectorName(sectorX, sectorY)}</div>
            <div>ANOMALIES: {filteredAnomalies.length}</div>
          </div>
        )}

        {showAllAnomalies && (
          <div className={`absolute top-4 left-4 ${
            isDarkTheme 
              ? 'bg-[#002439]/90 text-[#78cce2] border-[#78cce2]/30' 
              : 'bg-white/90 text-slate-800 border-slate-400/50'
          } px-3 py-2 rounded-lg text-xs font-mono border backdrop-blur-sm`}>
            <div>OVERVIEW MODE</div>
            <div>SHOWING: {filteredAnomalies.length} OF {anomalies.length}</div>
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
  )
}
