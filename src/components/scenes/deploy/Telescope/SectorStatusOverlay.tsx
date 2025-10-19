"use client"

import { Target } from "lucide-react"
import React from "react"

export default function SectorStatusOverlay({
  sectorAnomaliesLength,
  deploymentType,
  loading,
}: {
  sectorAnomaliesLength: number
  deploymentType: "stellar" | "planetary" | null
  loading: boolean
}) {
  if (sectorAnomaliesLength === 0 && !loading) {
    return (
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-[#005066]/90 backdrop-blur-sm border border-[#78cce2]/30 rounded-lg px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 max-w-[90vw] sm:max-w-[280px] md:max-w-none">
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-[#78cce2]">
          <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
          <span className="text-[10px] sm:text-xs md:text-sm leading-tight">No {deploymentType === "stellar" ? "stellar objects" : "exoplanet candidates"} in this sector • Navigate to explore</span>
        </div>
      </div>
    )
  }
  return null
}
