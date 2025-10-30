"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ActivityHeader from "../../scenes/deploy/ActivityHeader";
import { hasUpgrade } from "@/src/utils/userUpgrades";
import PlanetCompletionWidget from "@/src/components/discovery/planets/PlanetCompletionWidget";
import AllUpgradesWidget from "@/src/components/discovery/milestones/AllUpgradesWidget";
import ClassificationDiversityWidget from "@/src/components/discovery/milestones/ClassificationDiversityWidget";
import ResourceExtractionWidget from "@/src/components/discovery/milestones/ResourceExtractionWidget";
import { AchievementsModal } from "@/src/components/discovery/achievements/AchievementsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ChevronDown, ChevronUp, Info, Trophy } from "lucide-react";
import { useMilestones } from "@/src/hooks/useMilestones";

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
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const { milestones, loading: milestonesLoading } = useMilestones();

  // Debug logging
  useEffect(() => {
    console.log("ActivityHeaderSection - Milestones state:", {
      selectedMilestone,
      milestonesLoading,
      hasMilestones: !!milestones,
      milestones,
    });
  }, [selectedMilestone, milestonesLoading, milestones]);

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
            gravity,
            temperature
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
        const density = anomaly?.density;
        const temperature = anomaly?.temperature;
        
        if (!anomalyId || density == null) continue;

        // Determine planet type and requirements
        let requiresWater = false
        let planetType = "Unsurveyed"
        
        if (density < 2.5) {
          planetType = "Gaseous"
        } else {
          // Terrestrial planet
          if (temperature != null && temperature >= -15 && temperature <= 50) {
            planetType = "Habitable"
            requiresWater = true
          } else {
            planetType = "Terrestrial"
          }
        }

        // Check for clouds OR mineral deposits
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

        const cloudsOrDepositsFound = Boolean((clouds && clouds.length > 0) || (minerals && minerals.length > 0));

        // Check for water if required
        let waterFound = false
        if (requiresWater) {
          const { data: waterData } = await supabase
            .from("mineralDeposits")
            .select("id, mineralconfiguration")
            .eq("owner", session.user.id)
            .eq("anomaly", anomalyId)

          waterFound = Boolean(
            waterData && 
            waterData.some((deposit: any) => {
              const config = deposit.mineralconfiguration
              const type = config?.type?.toLowerCase() || ""
              return type.includes("water") || type.includes("ice") || type.includes("h2o")
            })
          )
        }

        // Planet is complete if type is confirmed and has clouds/deposits
        // For potentially habitable terrestrial, also needs water
        const isComplete = cloudsOrDepositsFound && (!requiresWater || waterFound)
        
        if (isComplete) {
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
      {/* Achievements Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowAchievementsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5fcbc3] to-[#2c4f64] text-white rounded-lg hover:from-[#4fb3a3] hover:to-[#1e3a4a] transition-all shadow-lg hover:shadow-xl"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium">Achievements</span>
        </button>
      </div>

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
                  <SelectItem 
                    value="all-upgrades"
                    className="text-xs text-[#e4f4f4] focus:bg-[#2c4f64]/50 focus:text-[#5fcbc3]"
                  >
                    All Upgrades
                  </SelectItem>
                  <SelectItem 
                    value="classification-diversity"
                    className="text-xs text-[#e4f4f4] focus:bg-[#2c4f64]/50 focus:text-[#5fcbc3]"
                  >
                    Classification Diversity
                  </SelectItem>
                  <SelectItem 
                    value="resource-extraction"
                    className="text-xs text-[#e4f4f4] focus:bg-[#2c4f64]/50 focus:text-[#5fcbc3]"
                  >
                    Resource Extraction
                  </SelectItem>
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
              {selectedMilestone === "planet-completion" && (
                <>
                  <span className="font-semibold text-[#5fcbc3]">{completedPlanets}</span>
                  <span className="mx-1">/</span>
                  <span>{planetCount}</span>
                  <span className="ml-1">completed</span>
                </>
              )}
              {selectedMilestone === "all-upgrades" && (
                milestonesLoading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : milestones ? (
                  <>
                    <span className="font-semibold text-[#5fcbc3]">{milestones.allUpgrades.unlocked}</span>
                    <span className="mx-1">/</span>
                    <span>{milestones.allUpgrades.total}</span>
                    <span className="ml-1">unlocked</span>
                  </>
                ) : null
              )}
              {selectedMilestone === "classification-diversity" && (
                milestonesLoading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : milestones ? (
                  <>
                    <span className="font-semibold text-[#5fcbc3]">{milestones.classificationDiversity.completed}</span>
                    <span className="mx-1">/</span>
                    <span>{milestones.classificationDiversity.total}</span>
                    <span className="ml-1">types done</span>
                  </>
                ) : null
              )}
              {selectedMilestone === "resource-extraction" && (
                milestonesLoading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : milestones ? (
                  <>
                    <span className="font-semibold text-[#5fcbc3]">{milestones.resourceExtraction.extracted}</span>
                    <span className="mx-1">/</span>
                    <span>{milestones.resourceExtraction.total}</span>
                    <span className="ml-1">extracted</span>
                  </>
                ) : null
              )}
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
                  <h5 className="text-xs font-semibold text-foreground mb-1.5">Planet Completion Requirements:</h5>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">1.</span>
                      <span><strong>Discover</strong> - Find the planet using your telescope</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">2.</span>
                      <span><strong>Survey</strong> - Deploy a satellite to determine density (Gaseous: &lt;2.5 g/cm³, Terrestrial: ≥2.5 g/cm³)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">3.</span>
                      <span><strong>Type Confirmed</strong> - Planet type automatically determined after survey</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#5fcbc3] mt-0.5">4.</span>
                      <span><strong>Find Clouds or Deposits</strong> - Classify clouds OR discover minerals (either one completes this step)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">5.</span>
                      <span><strong>Discover Water</strong> - <em>Only required for potentially habitable planets</em> (Terrestrial with temp -15°C to 50°C)</span>
                    </li>
                  </ul>
                  <div className="mt-2 p-2 bg-[#5fcbc3]/10 rounded text-xs">
                    <strong className="text-[#5fcbc3]">Completion Rules:</strong>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground">
                      <li>• Gaseous planets: Complete after finding clouds/deposits</li>
                      <li>• Terrestrial (non-habitable): Complete after finding clouds/deposits</li>
                      <li>• Habitable candidates: Must also discover liquid water</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Widget */}
          <div className="text-xs text-gray-500 mb-2">
            Debug: selectedMilestone="{selectedMilestone}", loading={milestonesLoading ? "true" : "false"}, hasMilestones={milestones ? "true" : "false"}
          </div>
          {selectedMilestone === "planet-completion" && <PlanetCompletionWidget />}
          {selectedMilestone === "all-upgrades" && (
            milestonesLoading ? (
              <div className="p-4 bg-card/30 rounded-lg border border-[#5fcbc3]/20">
                <p className="text-sm text-muted-foreground">Loading upgrades...</p>
              </div>
            ) : milestones ? (
              <AllUpgradesWidget data={milestones.allUpgrades} />
            ) : (
              <div className="p-4 bg-card/30 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400">No milestone data available</p>
              </div>
            )
          )}
          {selectedMilestone === "classification-diversity" && (
            milestonesLoading ? (
              <div className="p-4 bg-card/30 rounded-lg border border-[#5fcbc3]/20">
                <p className="text-sm text-muted-foreground">Loading classifications...</p>
              </div>
            ) : milestones ? (
              <ClassificationDiversityWidget data={milestones.classificationDiversity} />
            ) : (
              <div className="p-4 bg-card/30 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400">No milestone data available</p>
              </div>
            )
          )}
          {selectedMilestone === "resource-extraction" && (
            milestonesLoading ? (
              <div className="p-4 bg-card/30 rounded-lg border border-[#5fcbc3]/20">
                <p className="text-sm text-muted-foreground">Loading resources...</p>
              </div>
            ) : milestones ? (
              <ResourceExtractionWidget data={milestones.resourceExtraction} />
            ) : (
              <div className="p-4 bg-card/30 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400">No milestone data available</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
};
