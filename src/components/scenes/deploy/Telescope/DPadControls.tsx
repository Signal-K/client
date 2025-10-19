"use client"

import React from "react"

export default function DPadControls({
  currentSector,
  onMove,
}: {
  currentSector: { x: number; y: number }
  onMove: (dir: "up" | "down" | "left" | "right") => void
}) {
  return (
    <div className="fixed bottom-2 sm:bottom-4 md:bottom-12 right-1 sm:right-2 md:right-12 z-40 flex flex-col items-center">
      <div className="bg-[#002439]/90 border border-[#78cce2]/30 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 flex flex-col items-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2 md:gap-4 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 mb-2 relative">
          <div></div>
          <button
            aria-label="Move Up"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
            onClick={() => onMove("up")}
          >↑</button>
          <div></div>
          <button
            aria-label="Move Left"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
            onClick={() => onMove("left")}
          >←</button>
          <div className="bg-[#005066] rounded-full border border-[#78cce2] sm:border-2 w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 flex items-center justify-center text-[10px] sm:text-sm md:text-xl text-[#78cce2] font-mono">{currentSector.x},{currentSector.y}</div>
          <button
            aria-label="Move Right"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
            onClick={() => onMove("right")}
          >→</button>
          <div></div>
          <button
            aria-label="Move Down"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
            onClick={() => onMove("down")}
          >↓</button>
          <div></div>
        </div>
      </div>
    </div>
  )
}
