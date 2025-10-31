"use client";

import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import ImboxViewport from "@/src/components/classification/viewport/imbox";
import PlanetCompletionWidget from "@/src/components/discovery/planets/PlanetCompletionWidget";
import AllUpgradesWidget from "@/src/components/discovery/milestones/AllUpgradesWidget";
import ClassificationDiversityWidget from "@/src/components/discovery/milestones/ClassificationDiversityWidget";
import ResourceExtractionWidget from "@/src/components/discovery/milestones/ResourceExtractionWidget";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ChevronUp, Info, Telescope, Satellite, Car } from "lucide-react";
import { useMilestones } from "@/src/hooks/useMilestones";
import { hasUpgrade } from "@/src/utils/userUpgrades";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import FeedbackTeaser from "@/src/components/viewports/FeedbackTeaser";
import ProjectSelectionViewport from "@/src/components/onboarding/ProjectSelectionViewport";

interface ClassificationProgress {
  totalClassifications: number;
  classificationTypes: string[];
  toolsUsed: {
    telescope: number;
    satellite: number;
    rover: number;
  };
}

export default function UpdatesTab() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { isDark } = UseDarkMode();
  
  const [selectedMilestone, setSelectedMilestone] = useState<string>("planet-completion");
  const [planetCount, setPlanetCount] = useState<number>(0);
  const [completedPlanets, setCompletedPlanets] = useState<number>(0);
  const [showMilestoneInfo, setShowMilestoneInfo] = useState<boolean>(false);
  const [classificationsCount, setClassificationsCount] = useState<number>(0);
  const [bothUpgradesUnlocked, setBothUpgradesUnlocked] = useState<boolean>(false);
  const [upgradeStatus, setUpgradeStatus] = useState<{
    hasTelescopeUpgrade: boolean;
    hasSatelliteUpgrade: boolean;
    bothUpgradesUnlocked: boolean;
  }>({
    hasTelescopeUpgrade: false,
    hasSatelliteUpgrade: false,
    bothUpgradesUnlocked: false,
  });
  const { milestones, loading: milestonesLoading } = useMilestones();
  
  const [progress, setProgress] = useState<ClassificationProgress>({
    totalClassifications: 0,
    classificationTypes: [],
    toolsUsed: {
      telescope: 0,
      satellite: 0,
      rover: 0
    }
  });

  // Fetch classifications and upgrade status
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      // Get classifications
      const { data: classifications } = await supabase
        .from('classifications')
        .select('classificationtype')
        .eq('author', session.user.id);

      const types = Array.from(new Set(classifications?.map(c => c.classificationtype).filter(Boolean))) as string[];
      
      // Count tools used
      const toolCounts = types.reduce((acc, type) => {
        if (['planet', 'telescope-minorPlanet', 'sunspot', 'active-asteroid'].includes(type)) {
          acc.telescope++;
        } else if (['balloon-marsCloudShapes', 'cloud', 'lidar-jovianVortexHunter', 'satellite-planetFour'].includes(type)) {
          acc.satellite++;
        } else if (['automaton-aiForMars'].includes(type)) {
          acc.rover++;
        }
        return acc;
      }, { telescope: 0, satellite: 0, rover: 0 });

      setProgress({
        totalClassifications: classifications?.length || 0,
        classificationTypes: types,
        toolsUsed: toolCounts
      });
      
      setClassificationsCount(classifications?.length || 0);

      // Check upgrade status
      const hasTelescopeUpgrade = await hasUpgrade(supabase, session.user.id, "probereceptors");
      const hasSatelliteUpgrade = await hasUpgrade(supabase, session.user.id, "satellitecount");
      const bothUnlocked = hasTelescopeUpgrade && hasSatelliteUpgrade;
      
      setBothUpgradesUnlocked(bothUnlocked);
      setUpgradeStatus({
        hasTelescopeUpgrade,
        hasSatelliteUpgrade,
        bothUpgradesUnlocked: bothUnlocked,
      });
    };

    fetchData();
  }, [session, supabase]);

  // Fetch planet stats
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPlanetStats = async () => {
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

      let completed = 0;
      for (const planet of planets) {
        const anomaly = Array.isArray(planet.anomaly) ? planet.anomaly[0] : planet.anomaly;
        const anomalyId = anomaly?.id;
        const density = anomaly?.density;
        const temperature = anomaly?.temperature;
        
        if (!anomalyId || density == null) continue;

        let requiresWater = false;
        
        if (density >= 2.5) {
          if (temperature != null && temperature >= -15 && temperature <= 50) {
            requiresWater = true;
          }
        }

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

        let waterFound = false;
        if (requiresWater) {
          const { data: waterData } = await supabase
            .from("mineralDeposits")
            .select("id, mineralconfiguration")
            .eq("owner", session.user.id)
            .eq("anomaly", anomalyId);

          waterFound = Boolean(
            waterData && 
            waterData.some((deposit: any) => {
              const config = deposit.mineralconfiguration;
              const type = config?.type?.toLowerCase() || "";
              return type.includes("water") || type.includes("ice") || type.includes("h2o");
            })
          );
        }

        const isComplete = cloudsOrDepositsFound && (!requiresWater || waterFound);
        
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
  
  const shouldShowGettingStarted = progress.totalClassifications < 4 && progress.classificationTypes.length < 2;

  const tools = [
    {
      name: 'Telescope',
      icon: <Telescope className="w-6 h-6" />,
      count: progress.toolsUsed.telescope,
      description: 'Discover exoplanets, track asteroids, and monitor solar activity',
      link: '/structures/telescope',
      color: 'text-blue-400'
    },
    {
      name: 'Satellite',
      icon: <Satellite className="w-6 h-6" />,
      count: progress.toolsUsed.satellite,
      description: 'Study planetary atmospheres and weather patterns',
      link: '/viewports/satellite',
      color: 'text-purple-400'
    },
    {
      name: 'Rover',
      icon: <Car className="w-6 h-6" />,
      count: progress.toolsUsed.rover,
      description: 'Analyze surface features and terrain on distant worlds',
      link: '/viewports/roover',
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Teaser */}
      <FeedbackTeaser />

      {/* Inbox Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white">Inbox & Notifications</h3>
        <ImboxViewport />
      </div>

      {/* Getting Started Section - Only show for new users */}
      {shouldShowGettingStarted && (
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-100'}`}>Getting Started</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-200'}`}>
                Deploy virtual structures to collect real astronomical data, then classify your discoveries to contribute to ongoing research. 
                Each classification helps scientists understand our universe better.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#78cce2]">{progress.totalClassifications}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>Classifications Made</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className={`border rounded-lg p-4 backdrop-blur-sm hover:bg-black/40 transition-colors ${
                  isDark 
                    ? 'bg-black/30 border-[#3B4252]' 
                    : 'bg-black/50 border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${tool.color}`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-100'}`}>{tool.name}</h3>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>
                      {tool.count > 0 ? `${tool.count} project${tool.count !== 1 ? 's' : ''} completed` : 'Not started'}
                    </div>
                  </div>
                </div>
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-200'}`}>{tool.description}</p>
                <Button
                  onClick={() => router.push(tool.link)}
                  variant={tool.count > 0 ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  {tool.count > 0 ? 'Continue Research' : 'Start Here'}
                </Button>
              </div>
            ))}
          </div>

          <div className={`flex items-center justify-between rounded-lg p-4 ${
            isDark 
              ? 'bg-black/20 border border-[#78cce2]/30' 
              : 'bg-black/40 border border-[#78cce2]/50'
          }`}>
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-100'}`}>Next Milestone</h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-200'}`}>
                Complete {4 - progress.totalClassifications} more classification{4 - progress.totalClassifications !== 1 ? 's' : ''} 
                {progress.classificationTypes.length < 2 && ` and try ${2 - progress.classificationTypes.length} different project type${2 - progress.classificationTypes.length !== 1 ? 's' : ''}`}
                to unlock advanced features
              </p>
            </div>
            <div className="flex gap-2">
              <div className="text-center">
                <div className="text-xl font-bold text-[#78cce2]">{progress.totalClassifications}/4</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>Classifications</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#78cce2]">{progress.classificationTypes.length}/2</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>Project Types</div>
              </div>
            </div>
          </div>

          {/* Project Selection for New Users */}
          {progress.totalClassifications === 0 && (
            <div className="mt-6">
              <ProjectSelectionViewport
                classificationsCount={progress.totalClassifications}
                showWelcomeMessage={true}
                onProjectSelect={(projectId) => {
                  console.log("Selected project:", projectId);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Upgrade Status Section */}
      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-4">
        <h3 className="text-lg font-semibold mb-3 text-white">Upgrade Status</h3>
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-sm font-medium text-foreground">{upgradeMessage.title}</h4>
          <p className="text-xs text-muted-foreground">
            {upgradeMessage.description}
          </p>
        </div>
      </div>

      {/* Milestones Section - Only show if both upgrades unlocked and has classifications */}
      {bothUpgradesUnlocked && classificationsCount > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Milestone Progress</h3>
          
          <div className="space-y-2 bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-4">
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
        </div>
      )}
    </div>
  );
}
