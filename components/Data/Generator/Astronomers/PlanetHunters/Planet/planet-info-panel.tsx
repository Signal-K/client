"use client";

import { Html } from "@react-three/drei";
import type { SurfacePointInfo } from "./planet-main";
import type { PlanetStats } from "@/lib/planet-physics";

interface PlanetInfoPanelProps {
  pointInfo: SurfacePointInfo;
  planetStats: PlanetStats;
};

export function PlanetInfoPanel({ pointInfo, planetStats }: PlanetInfoPanelProps) {
  const formatCoordinate = (value: number) => value.toFixed(3);

  return (
    <Html position={[0, 0, 0]} style={{ position: "absolute", right: "20px", top: "20px", pointerEvents: "none" }}>
      <div className="w-64 bg-black/90 text-green-400 p-4 font-mono text-xs border border-green-500/30 rounded-md">
        <h3 className="text-sm font-bold mb-2 border-b border-green-500/30 pb-1">SURFACE SCAN</h3>

        <div className="grid grid-cols-2 gap-y-1 gap-x-2">
          <span className="text-green-500/70">COORDINATES:</span>
          <span>
            X: {formatCoordinate(pointInfo.normalizedPosition.x)}
            <br />
            Y: {formatCoordinate(pointInfo.normalizedPosition.y)}
            <br />
            Z: {formatCoordinate(pointInfo.normalizedPosition.z)}
          </span>

          <span className="text-green-500/70">ELEVATION:</span>
          <span>{(pointInfo.height * 100).toFixed(1)} units</span>

          <span className="text-green-500/70">TERRAIN:</span>
          <span>{pointInfo.terrainType}</span>

          <span className="text-green-500/70">TEMPERATURE:</span>
          <span>
            {pointInfo.temperature.toFixed(1)} K<br />({(pointInfo.temperature - 273.15).toFixed(1)}°C)
          </span>

          <span className="text-green-500/70">REL TO FREEZE:</span>
          <span className={pointInfo.relativeToWaterTemp < 0 ? "text-blue-400" : "text-red-400"}>
            {pointInfo.relativeToWaterTemp > 0 ? "+" : ""}
            {pointInfo.relativeToWaterTemp.toFixed(1)} K
          </span>
        </div>

        <div className="mt-2 pt-1 border-t border-green-500/30 text-center text-green-500/50">
          Click elsewhere to scan another location
        </div>
      </div>
    </Html>
  );
};