import React from "react";

export default function SatelliteDPad({
  planetAnomalies,
  focusedPlanetIdx,
  handleDPad,
}: {
  planetAnomalies: any[];
  focusedPlanetIdx: number;
  handleDPad: (dir: "up" | "down" | "left" | "right") => void;
}) {
  return (
    <div className="absolute left-6 bottom-6 z-30 flex flex-col items-center gap-2">
      <div className="bg-[#181e2a]/90 border border-[#78cce2]/30 rounded-2xl shadow-xl p-4 flex flex-col items-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-32 h-32 mb-2 relative">
          <div></div>
          <button
            aria-label="Move Up"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
            onClick={() => handleDPad("up")}
          >↑</button>
          <div></div>
          <button
            aria-label="Move Left"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
            onClick={() => handleDPad("left")}
          >←</button>
          <div className="bg-[#005066] rounded-full border-2 border-[#78cce2] w-10 h-10 flex flex-col items-center justify-center text-[10px] text-[#78cce2] font-mono">
            <div>{planetAnomalies.length > 0 ? `${focusedPlanetIdx + 1} / ${planetAnomalies.length}` : '--'}</div>
          </div>
          <button
            aria-label="Move Right"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
            onClick={() => handleDPad("right")}
          >→</button>
          <div></div>
          <button
            aria-label="Move Down"
            className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
            onClick={() => handleDPad("down")}
          >↓</button>
          <div></div>
        </div>
      </div>
    </div>
  );
}
