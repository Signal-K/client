"use client"

import React from "react"

export default function MissionInfoPanel({
  deploymentType,
  tessAnomalies,
}: {
  deploymentType: "stellar" | "planetary" | null
  tessAnomalies: Array<any>
}) {
  return (
    <div className="fixed bottom-2 sm:bottom-4 md:bottom-8 left-1 sm:left-2 md:left-8 z-40 p-1.5 sm:p-2 md:p-3 rounded bg-[#00304a]/80 border border-[#78cce2]/20 text-[#e4eff0] text-[10px] sm:text-xs font-mono w-[180px] sm:w-[240px] md:min-w-[260px] md:max-w-[340px] shadow-lg max-h-[30vh] overflow-y-auto">
      <span className="font-bold text-[#78cce2] block mb-1">Mission:</span>
      {deploymentType === "stellar" ? (
        <>
          <ul className="list-disc ml-3 sm:ml-4 md:ml-5 mt-0.5 sm:mt-1 space-y-0.5">
            <li className="text-[#ff6b6b] leading-tight">Stellar Objects</li>
            <li className="text-[10px] sm:text-xs leading-tight">Circumstellar disks</li>
            <li className="text-[10px] sm:text-xs leading-tight">Variable stars</li>
            <li className="text-[10px] sm:text-xs leading-tight hidden sm:list-item">Protoplanetary structures</li>
          </ul>
          <div className="mt-1 sm:mt-2 text-[#ff6b6b] text-[10px] sm:text-xs leading-tight">
            <span className="font-semibold">🔬</span> Advanced stellar analysis
          </div>
        </>
      ) : (
        <>
          <ul className="list-disc ml-3 sm:ml-4 md:ml-5 mt-0.5 sm:mt-1 space-y-0.5">
            <li className="text-[10px] sm:text-xs leading-tight">Planets (TESS)</li>
            <li className="text-[10px] sm:text-xs leading-tight">Asteroids</li>
            {tessAnomalies.some(a => a.anomalySet === 'active-asteroids') && (
              <li className="text-[10px] sm:text-xs leading-tight hidden sm:list-item">Active Asteroids</li>
            )}
          </ul>
          <div className="mt-1 sm:mt-2 text-[#78cce2] text-[10px] sm:text-xs leading-tight">
            <span className="font-semibold">🎯</span> Comprehensive discovery
          </div>
        </>
      )}
    </div>
  )
}
