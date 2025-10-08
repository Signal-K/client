"use client";

import { useState, useEffect } from "react";
import { Telescope } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "@/src/components/research/TechSection";
import { StatCard } from "@/src/components/research/StatCard";
import { UpgradeItem } from "@/src/components/research/UpgradeItem";
import { LockedItem } from "@/src/components/research/LockedItem";

export default function AstronomyResearch() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [availablePoints, setAvailablePoints] = useState(0);
  const [asteroidClassificationsCount, setAsteroidClassificationsCount] = useState(0);
  const [receptorCount, setReceptorCount] = useState(1);

  const getUpgradeCost = (currentLevel: number): number => {
    return 10; // Fixed cost of 10 stardust per upgrade
  };

  const handleUpgrade = async (capacity: string, currentLevel: number) => {
    const cost = getUpgradeCost(currentLevel);
    if (availablePoints >= cost && currentLevel < 2) {
      setAvailablePoints((prev) => prev - cost);

      if (capacity === "receptors") {
        setReceptorCount((prev) => prev + 1);
      }

      if (session?.user) {
        const techType = capacity === "receptors" ? "probereceptors" : "";
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

      const { data: classifications, error: classificationsError } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .eq("classificationtype", "telescope-minorPlanet");

      if (classificationsError) throw classificationsError;

      setAsteroidClassificationsCount(classifications.length);

      // Calculate stardust balance - only count paid upgrades
      const { data: allClassifications } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id);

      const basePoints = allClassifications?.length || 0;
      
      // Only count purchased upgrades that cost stardust (not automatic unlocks)
      const paidUpgrades = researched?.filter(r => 
        ['probereceptors', 'satellitecount', 'probecount', 'proberange', 'rovercount'].includes(r.tech_type)
      ) || [];
      
      const researchPenalty = paidUpgrades.length * 10;
      const totalPoints = Math.max(0, basePoints - researchPenalty);
      setAvailablePoints(totalPoints);

      // Count receptor upgrades
      let receptorCount = 1;
      researched?.forEach(item => {
        if (item.tech_type === "probereceptors") receptorCount += 1;
      });

      setReceptorCount(Math.min(receptorCount, 2)); // Max 2 upgrades for now
    } catch (err) {
      console.error("Error fetching research data:", err);
    }
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
              current={0}
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
              current={0}
              max={1}
              cost={0}
              onUpgrade={() => {}}
              disabled={true}
              color="#4361ee"
            />
            <UpgradeItem
              title="Active Asteroids"
              description="After finding two regular asteroids, you can start looking for asteroids with thermal activity as well as comets!"
              current={asteroidClassificationsCount}
              max={2}
              cost={0}
              onUpgrade={() => {}}
              disabled={asteroidClassificationsCount < 2}
              color="#4cc9f0"
            />
          </div>

          {/* Telescope Tech Section */}
          <div>
            <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
              TELESCOPE TECH
            </h3>
            <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-200 italic">
                "Your observatory has approved a new module upgrade for enhanced deep-space observations."
              </p>
            </div>
            <UpgradeItem
              title="Extend Telescope Receptors"
              description="Extending your telescope's receptors allows you to see deeper dips in lightcurves, revealing previously hidden anomalies. This enhancement increases your anomaly detection count per scan by 2, helping you discover more celestial phenomena during each observation session."
              current={receptorCount}
              max={2}
              cost={getUpgradeCost(receptorCount)}
              onUpgrade={() => handleUpgrade("receptors", receptorCount)}
              disabled={availablePoints < getUpgradeCost(receptorCount) || receptorCount >= 2}
              color="#4361ee"
            />
          </div>
        </div>
      </TechSection>
    </>
  );
};