"use client";

import { useState, useEffect } from "react";
import { Telescope } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "@/src/components/research/TechSection";
import { StatCard } from "@/src/components/research/StatCard";
import { UpgradeItem } from "@/src/components/research/UpgradeItem";
import { LockedItem } from "@/src/components/research/LockedItem";

type CapacityKey = "probeCount" | "probeDistance";
type UserCapacities = Record<CapacityKey, number>;

export default function AstronomyResearch() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [availablePoints, setAvailablePoints] = useState(10);
  const [userCapacities, setUserCapacities] = useState<UserCapacities>({
    probeCount: 1,
    probeDistance: 1,
  });
  const [probeRangeDescription, setProbeRangeDescription] = useState("Unknown");

  const getUpgradeCost = (currentLevel: number): number => {
    return (currentLevel + 1) * 2;
  };

  const handleUpgrade = async (capacity: CapacityKey, currentLevel: number) => {
    const cost = getUpgradeCost(currentLevel);
    if (availablePoints >= cost) {
      setAvailablePoints((prev) => prev - cost);
      setUserCapacities((prev) => ({
        ...prev,
        [capacity]: prev[capacity] + 1,
      }));

      if (session?.user) {
        const techType = capacity === "probeCount" ? "probecount" : "proberange";
        await supabase.from("researched").insert([
          {
            user_id: session.user.id,
            tech_type: techType,
          },
        ]);
        fetchResearchData(); // Re-fetch after upgrade
      };
    };
  };

  useEffect(() => {
    fetchResearchData();
  }, [session]);

  const fetchResearchData = async () => {
    if (!session?.user) return;

    try {
      const { data: researched, error } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", session.user.id);

      if (error) throw error;

      let probeCount = 1;
      let probeDistance = 1;

      researched?.forEach(item => {
        if (item.tech_type === "probecount") probeCount += 1;
        if (item.tech_type === "proberange") probeDistance += 1;
      });

      setUserCapacities({ probeCount, probeDistance });

      const response = await fetch(`/api/gameplay/research/upgrades?techType=proberange&count=${probeDistance}`);
      const data = await response.json();
      setProbeRangeDescription(data.description);
    } catch (err) {
      console.error("Error fetching research data:", err);
    };
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* <StatCard title="PROBE COUNT" value={userCapacities.probeCount} max={3} color="#4361ee" />
        <StatCard
  title="PROBE DISTANCE"
  value={userCapacities.probeDistance}
  max={5} 
  description={probeRangeDescription}
  color="#4cc9f0"
/> */}

      </div>

      <TechSection
        title="ASTRONOMY"
        icon={<Telescope />}
        color="#4361ee"
        glowColor="rgba(67, 97, 238, 0.5)"
      >
        <div className="space-y-6">
          {/* Planet Hunters Section */}
          <div>
            <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
              PLANET HUNTERS
            </h3>
            <UpgradeItem
              title="Planet Hunters"
              description="Already unlocked. Contribute to planetary discovery projects."
              current={1}
              max={1}
              cost={0}
              onUpgrade={() => {}}
              disabled={true}
              color="#4361ee"
            />
            <LockedItem
              title="More Data"
              description="Coming soon. Unlock additional planetary data."
            />
          </div>

          {/* Asteroid Hunters Section */}
          <div>
            <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
              ASTEROID HUNTERS
            </h3>
            <UpgradeItem
              title="Asteroid Hunters"
              description="Already unlocked. Contribute to asteroid discovery projects."
              current={1}
              max={1}
              cost={0}
              onUpgrade={() => {}}
              disabled={true}
              color="#4361ee"
            />
            <LockedItem
              title="Active Asteroids"
              description="Requires 2 or more entries in the classifications table with a classification type of 'telescope-minorPlanet'."
            />
          </div>

          {/* Telescope Tech Section */}
          <div>
            <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
              TELESCOPE TECH
            </h3>
            <UpgradeItem
              title="Increase Receptors"
              description="Add more anomalies per scan."
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
        </div>
      </TechSection>
    </>
  );
};