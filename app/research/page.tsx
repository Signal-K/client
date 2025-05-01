"use client";

import { useState } from "react";
import GameNavbar from "@/components/Layout/Tes";
import AstronomyResearch from "@/components/Research/AstronomyItems";
import MeteorologyResearch from "@/components/Research/MeteorologyItems";
import BiologyResearch from "@/components/Research/BiologyItems";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CapacityKey =
  | "probeCount"
  | "probeDistance"
  | "stationCount"
  | "balloonCount"
  | "cameraCount"
  | "stationSize";

type UserCapacities = Record<CapacityKey, number>;

export default function TechTreeResearchPage() {
  const [availablePoints, setAvailablePoints] = useState(0);
  const [userCapacities, setUserCapacities] = useState<UserCapacities>({
    probeCount: 1,
    probeDistance: 1,
    stationCount: 0,
    balloonCount: 0,
    cameraCount: 1,
    stationSize: 0,
  });

  const getUpgradeCost = (currentLevel: number): number => {
    return (currentLevel + 1) * 2;
  };

  const handleUpgrade = (capacity: CapacityKey, currentLevel: number) => {
    const cost = getUpgradeCost(currentLevel);
    if (availablePoints >= cost) {
      setAvailablePoints((prev) => prev - cost);
      setUserCapacities((prev) => ({
        ...prev,
        [capacity]: prev[capacity] + 1,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1929] flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <GameNavbar />
      </div>

      <div className="flex-1 pt-20 text-[#c5d5e6] font-mono">
        <header className="bg-[#0a1929] border-b border-[#1e3a5f] py-12 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#4cc9f0] tracking-wider">RESEARCH LAB</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#0f2942] px-4 py-2 rounded border border-[#1e3a5f]">
                <span className="text-[#4cc9f0]">STARDUST:</span>
                <span className="font-bold text-[#f72585] text-xl">{availablePoints}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          {/* <TotalPoints onPointsUpdate={(total) => setAvailablePoints(total)} /> */}

          <div className="relative">
            <AstronomyResearch />
            <MeteorologyResearch />
            <BiologyResearch />
          </div>
          <Link href='/'><Button
                className="text-white border-[#1e3a5f]"
            >
                Home
            </Button></Link>
        </main>
      </div>
    </div>
  );
};