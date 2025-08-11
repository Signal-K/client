import React from "react";
import Image from "next/image";

interface SatelliteIconProps {
  tile: string;
  isUnlocked: boolean;
  isFlashing: boolean;
  currentTileIndex: number;
  satelliteTiles: string[];
}

const SatelliteIcon: React.FC<SatelliteIconProps> = ({
  tile,
  isUnlocked,
  isFlashing,
  currentTileIndex,
  satelliteTiles,
}) => (
  <>
    <Image
      src={satelliteTiles[currentTileIndex]}
      alt="Satellite"
      width={59}
      height={59}
      className="transition-opacity duration-200 transform rotate-[86deg]"
    />
    <div
      className={`absolute top-0 left-0 w-4 h-4 rounded-full animate-ping ${
        isUnlocked ? "bg-green-500" : "bg-red-500"
      }`}
      style={{ transform: "translate(-50%, -50%)" }}
    ></div>
  </>
);

export default SatelliteIcon;
