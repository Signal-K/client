"use client";

import { ArrowRight, Lock, Telescope, Cloud, Leaf } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/Research/StatCard";
import { TechSection } from "@/components/Research/TechSection";
import { UpgradeItem } from "@/components/Research/UpgradeItem";
import { LockedItem } from "@/components/Research/LockedItem";
import GameNavbar from "@/components/Layout/Tes";

type CapacityKey =
  | "probeCount"
  | "probeDistance"
  | "stationCount"
  | "balloonCount"
  | "cameraCount"
  | "stationSize";

type UserCapacities = Record<CapacityKey, number>;

export default function TechTreeResearchPage() {
  const [availablePoints, setAvailablePoints] = useState(10);
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
    <div className="min-h-screen bg-[#0a1929] ">
      <GameNavbar />
    <div className="text-[#c5d5e6] font-mono">
      <header className="sticky top-0 z-10 bg-[#0a1929] border-b border-[#1e3a5f] my-12 py-12 p-4">
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard title="PROBE COUNT" value={userCapacities.probeCount} max={3} color="#4361ee" />
          <StatCard title="PROBE DISTANCE" value={userCapacities.probeDistance * 1000} color="#4cc9f0" />
          <StatCard title="CAMERA COUNT" value={userCapacities.cameraCount} max={3} color="#3a0ca3" />
        </div>

        <div className="relative">
          <div className="absolute inset-0 z-0">
            <div className="absolute left-[50%] top-[120px] w-[2px] h-[100px] bg-[#1e3a5f]"></div>
            <div className="absolute left-[50%] top-[340px] w-[2px] h-[100px] bg-[#1e3a5f]"></div>
          </div>

          <TechSection
            title="ASTRONOMY"
            icon={<Telescope />}
            color="#4361ee"
            glowColor="rgba(67, 97, 238, 0.5)"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                  AVAILABLE UPGRADES
                </h3>
                <UpgradeItem
                  title="Probe Count ++"
                  description="Increase your probe count to explore more terrariums simultaneously"
                  current={userCapacities.probeCount}
                  max={3}
                  cost={getUpgradeCost(userCapacities.probeCount)}
                  onUpgrade={() => handleUpgrade("probeCount", userCapacities.probeCount)}
                  disabled={
                    userCapacities.probeCount >= 3 ||
                    availablePoints < getUpgradeCost(userCapacities.probeCount)
                  }
                  color="#4361ee"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#8badc9] mb-4 border-b border-[#1e3a5f] pb-2">
                  UNAVAILABLE UPGRADES
                </h3>
                <LockedItem
                  title="Probe Distance ++"
                  description="Increase the range of your probes (currently 1,000 LY)"
                />
              </div>
            </div>
          </TechSection>

          <TechSection
            title="METEOROLOGY"
            icon={<Cloud />}
            color="#4cc9f0"
            glowColor="rgba(76, 201, 240, 0.5)"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                  AVAILABLE UPGRADES
                </h3>
                <UpgradeItem
                  title="Balloon Count ++"
                  description="Add weather balloons to monitor atmospheric conditions"
                  current={userCapacities.balloonCount}
                  max={3}
                  cost={getUpgradeCost(userCapacities.balloonCount)}
                  onUpgrade={() => handleUpgrade("balloonCount", userCapacities.balloonCount)}
                  disabled={
                    userCapacities.balloonCount >= 3 ||
                    availablePoints < getUpgradeCost(userCapacities.balloonCount)
                  }
                  color="#4cc9f0"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#8badc9] mb-4 border-b border-[#1e3a5f] pb-2">
                  UNAVAILABLE UPGRADES
                </h3>
                <LockedItem
                  title="Weather Balloons on Settlements"
                  description="Deploy weather monitoring on your settlements"
                />
              </div>
            </div>
          </TechSection>

          <TechSection
            title="BIOLOGY"
            icon={<Leaf />}
            color="#7209b7"
            glowColor="rgba(114, 9, 183, 0.5)"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                  AVAILABLE UPGRADES
                </h3>
                <div className="space-y-4">
                  <UpgradeItem
                    title="Camera Count ++"
                    description="Increase observation capabilities"
                    current={userCapacities.cameraCount}
                    max={3}
                    cost={getUpgradeCost(userCapacities.cameraCount)}
                    onUpgrade={() => handleUpgrade("cameraCount", userCapacities.cameraCount)}
                    disabled={
                      userCapacities.cameraCount >= 3 ||
                      availablePoints < getUpgradeCost(userCapacities.cameraCount)
                    }
                    color="#7209b7"
                  />

                  <div className="bg-[#0a1929] border border-[#1e3a5f] p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Station Count</p>
                        <p className="text-[#8badc9] mt-1 text-sm">
                          View available biodome stations
                        </p>
                      </div>
                      <Button
                        className="bg-[#7209b7] hover:bg-opacity-90 text-white border-[#1e3a5f]"
                        style={{ boxShadow: "0 0 10px rgba(114, 9, 183, 0.3)" }}
                      >
                        SHOW AVAILABLE
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#8badc9] mb-4 border-b border-[#1e3a5f] pb-2">
                  UNAVAILABLE UPGRADES
                </h3>
                <LockedItem
                  title="Station Size ++"
                  description="Expand the size of your research stations"
                />
              </div>
            </div>
          </TechSection>
        </div>
      </main>
    </div>
    </div>
  );
};