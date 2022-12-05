import type { Anomaly } from "@/types/Structures/telescope";

interface Props {
  sectorAnomalies: Anomaly[]
  currentSector: { x: number; y: number }
  selectedSector: { x: number; y: number } | null
};

export default function DeployTelescopeOverlay({
  sectorAnomalies,
  currentSector,
  selectedSector,
}: Props) {
  const isSelected = selectedSector &&
    selectedSector.x === currentSector.x &&
    selectedSector.y === currentSector.y

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute inset-4 lg:inset-8 border-4 lg:border-8 border-[#005066] rounded-full shadow-2xl shadow-[#002439]/50">
        <div className="absolute inset-2 lg:inset-4 border-2 lg:border-4 border-[#78cce2]/50 rounded-full">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#78cce2]/30 to-transparent transform -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#78cce2]/30 to-transparent transform -translate-x-1/2" />

          <div className="absolute top-2 lg:top-4 left-2 lg:left-4 w-4 lg:w-6 h-4 lg:h-6 border-l-2 border-t-2 border-[#78cce2]/60" />
          <div className="absolute top-2 lg:top-4 right-2 lg:right-4 w-4 lg:w-6 h-4 lg:h-6 border-r-2 border-t-2 border-[#78cce2]/60" />
          <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 w-4 lg:w-6 h-4 lg:h-6 border-l-2 border-b-2 border-[#78cce2]/60" />
          <div className="absolute bottom-2 lg:bottom-4 right-2 lg:right-4 w-4 lg:w-6 h-4 lg:h-6 border-r-2 border-b-2 border-[#78cce2]/60" />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 lg:w-8 h-6 lg:h-8 border-2 border-[#78cce2] rounded-full relative">
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#78cce2] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[#78cce2]/50" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-6 lg:top-12 left-6 lg:left-12 text-[#78cce2] text-xs">
        <div>TESS TARGETS: {sectorAnomalies.length}</div>
        <div>STATUS: {selectedSector ? "SELECTED" : "SCANNING"}</div>
      </div>

      {isSelected && (
        <div className="absolute inset-6 lg:inset-12 pointer-events-none">
          <div className="absolute inset-0 border-4 border-[#78cce2] rounded-full opacity-50 animate-pulse" />
          <div className="absolute top-4 left-4 bg-[#78cce2] text-[#002439] px-2 py-1 rounded text-xs font-bold">
            SECTOR SELECTED
          </div>
        </div>
      )}
    </div>
  )
};