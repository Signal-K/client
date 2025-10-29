"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ActivityHeader from "../../scenes/deploy/ActivityHeader";
import { hasUpgrade } from "@/src/utils/userUpgrades";
import PlanetCompletionWidget from "@/src/components/discovery/planets/PlanetCompletionWidget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

interface ActivityHeaderSectionProps {
  classificationsCount: number;
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
}

export default function ActivityHeaderSection({
  classificationsCount,
  landmarksExpanded,
  onToggleLandmarks,
}: ActivityHeaderSectionProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [upgradeStatus, setUpgradeStatus] = useState<{
    hasTelescopeUpgrade: boolean;
    hasSatelliteUpgrade: boolean;
    bothUpgradesUnlocked: boolean;
  }>({
    hasTelescopeUpgrade: false,
    hasSatelliteUpgrade: false,
    bothUpgradesUnlocked: false,
  });

  const [selectedMilestone, setSelectedMilestone] = useState<string>("planet-completion");
  const [planetCount, setPlanetCount] = useState<number>(0);
  const [completedPlanets, setCompletedPlanets] = useState<number>(0);
  const [showMilestoneInfo, setShowMilestoneInfo] = useState<boolean>(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUpgradeStatus = async () => {
      const hasTelescopeUpgrade = await hasUpgrade(supabase, session.user.id, "probereceptors");
      const hasSatelliteUpgrade = await hasUpgrade(supabase, session.user.id, "satellitecount");
      const bothUpgradesUnlocked = hasTelescopeUpgrade && hasSatelliteUpgrade;

      setUpgradeStatus({
        hasTelescopeUpgrade,
        hasSatelliteUpgrade,
        bothUpgradesUnlocked,
      });
    };

    fetchUpgradeStatus();
  }, [session, supabase]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPlanetStats = async () => {
      // Fetch all user's planet classifications
      const { data: planets } = await supabase
        .from("classifications")
        .select(`
          id,
          anomaly:anomalies (
            id,
            radius,
            density,
            mass,
            gravity
          )
        `)
        .eq("author", session.user.id)
        .eq("classificationtype", "planet");

      if (!planets) return;

      setPlanetCount(planets.length);

      // Count fully completed planets (100% completion)
      let completed = 0;
      for (const planet of planets) {
        const anomaly = Array.isArray(planet.anomaly) ? planet.anomaly[0] : planet.anomaly;
        const anomalyId = anomaly?.id;
        if (!anomalyId) continue;

        // Check all completion steps
        const surveyed = Boolean(
          anomaly?.radius ||
          anomaly?.density ||
          anomaly?.mass ||
          anomaly?.gravity
        );

        const { data: clouds } = await supabase
          .from("classifications")
          .select("id")
          .eq("author", session.user.id)
          .in("classificationtype", ["satellite-planetFour", "cloud"])
          .eq("classificationConfiguration->>parentPlanetLocation", String(anomalyId))
          .limit(1);

        const { data: minerals } = await supabase
          .from("mineralDeposits")
          .select("id")
          .eq("owner", session.user.id)
          .eq("anomaly", anomalyId)
          .limit(1);

        const cloudsFound = Boolean(clouds && clouds.length > 0);
        const mineralsFound = Boolean(minerals && minerals.length > 0);
        const waterFound = false; // Not implemented yet

        // All 5 steps: discovered (true), surveyed, clouds, minerals, water
        if (surveyed && cloudsFound && mineralsFound && waterFound) {
          completed++;
        }
      }

      setCompletedPlanets(completed);
    };

    fetchPlanetStats();
  }, [session, supabase]);

  const getUpgradeMessage = () => {
    if (upgradeStatus.bothUpgradesUnlocked) {
      return {
        title: "All Upgrades Complete!",
        description: "Your telescope and satellite systems are fully enhanced. New projects are now available in the research lab.",
      };
    } else if (upgradeStatus.hasTelescopeUpgrade && !upgradeStatus.hasSatelliteUpgrade) {
      return {
        title: "Satellite Upgrade Available",
        description: "Add an additional satellite to your fleet for enhanced planetary coverage. Cost: 10 Stardust.",
      };
    } else if (!upgradeStatus.hasTelescopeUpgrade && upgradeStatus.hasSatelliteUpgrade) {
      return {
        title: "Telescope Upgrade Available",
        description: "Extend your telescope's receptors to increase anomaly detection per scan. Cost: 10 Stardust.",
      };
    } else {
      return {
        title: "Telescope Upgrade",
        description: "Increase anomalies per deployment by 2. Cost: 10 Stardust.",
      };
    }
  };

  const upgradeMessage = getUpgradeMessage();

  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <ActivityHeader
        scrolled={true}
        landmarksExpanded={landmarksExpanded}
        onToggleLandmarks={onToggleLandmarks}
      />
      <p className="text-lg pt-3">Welcome to Star Sailors</p>

      {/* Dynamic Upgrade Section */}
      <div className="mt-4 p-3 rounded-lg border bg-card">
        <h4 className="text-sm font-medium text-foreground">{upgradeMessage.title}</h4>
        <p className="text-xs text-muted-foreground">
          {upgradeMessage.description}
        </p>
      </div>

      {/* Planet Completion Tracker */}
      {upgradeStatus.bothUpgradesUnlocked && classificationsCount > 0 && (
        <div className="mt-4 space-y-2">
          {/* Milestone Selector Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Select value={selectedMilestone} onValueChange={setSelectedMilestone}>
                <SelectTrigger className="h-8 w-auto text-xs bg-card/50 border-[#5fcbc3]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2a3a] border-[#2c4f64]">
                  <SelectItem 
                    value="planet-completion"
                    className="text-xs text-[#e4f4f4] focus:bg-[#2c4f64]/50 focus:text-[#5fcbc3]"
                  >
                    Planet Completion
                  </SelectItem>
                  {/* Future milestones can be added here */}
                </SelectContent>
              </Select>
              
              <button
                onClick={() => setShowMilestoneInfo(!showMilestoneInfo)}
                className="p-1 hover:bg-[#2c4f64]/30 rounded transition-colors"
                title="About milestones"
              >
                {showMilestoneInfo ? (
                  <ChevronUp className="h-3 w-3 text-[#5fcbc3]" />
                ) : (
                  <Info className="h-3 w-3 text-[#5fcbc3]" />
                )}
              </button>
            </div>
            
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-semibold text-[#5fcbc3]">{completedPlanets}</span>
              <span className="mx-1">/</span>
              <span>{planetCount}</span>
              <span className="ml-1">completed</span>
            </div>
          </div>

          {/* Milestone Info - Expandable */}
          {showMilestoneInfo && (
            <div className="p-3 rounded-lg bg-card/30 border border-[#5fcbc3]/20 space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-[#5fcbc3] mb-1">About Milestones</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track your exploration achievements and focus on specific goals. Select a milestone above to see your progress and which steps remain to complete it.
                </p>
              </div>
              
              {selectedMilestone === "planet-completion" && (
                <div className="pt-2 border-t border-[#5fcbc3]/10">
                  <h5 className="text-xs font-semibold text-foreground mb-1.5">Planet Completion Steps:</h5>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">1.</span>
                      <span><strong>Discover</strong> - Find the planet using your telescope</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">2.</span>
                      <span><strong>Survey</strong> - Deploy a satellite to gather planetary stats (radius, density, mass, gravity)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">3.</span>
                      <span><strong>Find Clouds</strong> - Classify atmospheric cloud formations on the planet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">4.</span>
                      <span><strong>Locate Minerals</strong> - Discover mineral deposits using your rover or satellite</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">5.</span>
                      <span><strong>Discover Water</strong> - Find water sources on the planet (coming soon)</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Widget */}
          {selectedMilestone === "planet-completion" && <PlanetCompletionWidget />}
        </div>
      )}
    </div>
  );
};
