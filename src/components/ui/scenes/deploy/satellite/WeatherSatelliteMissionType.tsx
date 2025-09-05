import React from "react";

interface WeatherSatelliteMissionTypeProps {
  entries: any[];
  className?: string;
}

export default function WeatherSatelliteMissionType({ entries, className = "" }: WeatherSatelliteMissionTypeProps) {
  if (!entries || entries.length === 0) return null;

  if (entries.length === 1) {
    return (
      <div className={`px-3 py-2 rounded bg-[#00304a]/80 border border-[#78cce2]/30 text-[#78cce2] text-xs font-semibold text-center ${className}`}>
        Mission: <span className="text-[#f2c572]">Planet Investigation</span> <span className="text-[#e4eff0]">(scanning planetary properties)</span>
      </div>
    );
  }

  return (
    <div className={`px-3 py-2 rounded bg-[#00304a]/80 border border-[#78cce2]/30 text-[#78cce2] text-xs font-semibold text-center ${className}`}>
      Mission: <span className="text-[#f2c572]">Weather Investigation</span> <span className="text-[#e4eff0]">(searching for clouds and weather events)</span>
    </div>
  );
}
