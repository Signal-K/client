"use client";

import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CompactUpgradeCard } from "./CompactUpgradeCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { getSatelliteCount } from "@/src/utils/userUpgrades";

interface UpgradeData {
  // Telescope upgrades
  telescopeReceptors: {
    current: number; 
    max: number;
    available: boolean;
  };

  // Satellite upgrades
  satelliteCount: {
    current: number;
    max: number;
    available: boolean;
  };

  // Rover upgrades
  roverWaypoints: {
    current: number;
    max: number;
    available: boolean;
  };

  // AI4M mineral upgrade
  findMinerals: {
    unlocked: boolean;
    available: boolean;
  };

  // P-4 mineral upgrade
  p4FindMinerals: {
    unlocked: boolean;
    available: boolean;
  },

  // Extraction method upgrades
  roverExtraction: {
    unlocked: boolean;
    available: boolean;
  };

  satelliteExtraction: {
    unlocked: boolean;
    available: boolean;
  };

  // Data/measurement upgrades
  spectroscopy: {
    unlocked: boolean;
    available: boolean;
  };

  // Progress data
  asteroidClassifications: number;
  cloudClassifications: number;
  availableStardust: number;
}

export default function CompactResearchPanel() {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [upgradeData, setUpgradeData] = useState<UpgradeData>({
    telescopeReceptors: { current: 1, max: 2, available: false },
    satelliteCount: { current: 1, max: 2, available: false },
    roverWaypoints: { current: 4, max: 6, available: false },
    spectroscopy: { unlocked: false, available: false },
    findMinerals: { unlocked: false, available: false },
    p4FindMinerals: { unlocked: false, available: false },
    roverExtraction: { unlocked: false, available: false },
    satelliteExtraction: { unlocked: false, available: false },
    asteroidClassifications: 0,
    cloudClassifications: 0,
    availableStardust: 0,
  });

  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUpgradeData();
  }, [session]);

  const fetchUpgradeData = async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      // Get researched upgrades
      const { data: researched } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", session.user.id);

      // Get all classifications for stardust calculation
      const { data: allClassifications } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id);

      // Get specific classification counts
      const { data: asteroidClassifications } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .eq("classificationtype", "telescope-minorPlanet");

      const { data: cloudClassifications } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .eq("classificationtype", "cloud");

      // Calculate current upgrade levels
      const telescopeUpgrades = researched?.filter(r => r.tech_type === "probereceptors").length || 0;
      const satelliteUpgrades = researched?.filter(r => r.tech_type === "satellitecount").length || 0;
      const roverWaypointUpgrades = researched?.filter(r => r.tech_type === "roverwaypoints").length || 0;
      const spectroscopyUnlocked = researched?.some(r => r.tech_type === "spectroscopy") || false;
      const findMineralsUnlocked = researched?.some(r => r.tech_type === "findMinerals") || false;
      const p4MineralsUnlocked = researched?.some(r => r.tech_type === "p4Minerals") || false;
      const roverExtractionUnlocked = researched?.some(r => r.tech_type === "roverExtraction") || false;
      const satelliteExtractionUnlocked = researched?.some(r => r.tech_type === "satelliteExtraction") || false;

      // Use utility function for satellite count
      const currentSatelliteCount = await getSatelliteCount(supabase, session.user.id);

      // Calculate stardust with tiered pricing
      const basePoints = allClassifications?.length || 0;
      
      // Quantity upgrades cost 10 stardust each
      const quantityUpgrades = ['probereceptors', 'satellitecount', 'roverwaypoints'];
      
      // Calculate penalty: 10 for quantity upgrades, 2 for data/measurement upgrades
      const researchPenalty = (researched || []).reduce((total, r) => {
        const isQuantityUpgrade = quantityUpgrades.includes(r.tech_type);
        return total + (isQuantityUpgrade ? 10 : 2);
      }, 0);
      
      const availableStardust = Math.max(0, basePoints - researchPenalty);

      console.log('Stardust calculation:', {
        basePoints,
        totalResearched: researched?.length || 0,
        researchPenalty,
        availableStardust
      });

      setUpgradeData({
        telescopeReceptors: {
          current: 1 + telescopeUpgrades,
          max: 2,
          available: availableStardust >= 10 && telescopeUpgrades < 1,
        },
        satelliteCount: {
          current: currentSatelliteCount,
          max: 2,
          available: availableStardust >= 10 && satelliteUpgrades < 1,
        },
        roverWaypoints: {
          current: 4 + (roverWaypointUpgrades * 2),
          max: 6,
          available: availableStardust >= 10 && roverWaypointUpgrades < 1,
        },
        spectroscopy: {
          unlocked: spectroscopyUnlocked,
          available: availableStardust >= 2 && !spectroscopyUnlocked,
        },
        findMinerals: {
          unlocked: findMineralsUnlocked,
          available: availableStardust >= 2 && !findMineralsUnlocked,
        },
        p4FindMinerals: {
          unlocked: p4MineralsUnlocked,
          available: availableStardust >= 2 && !p4MineralsUnlocked,
        },
        roverExtraction: {
          unlocked: roverExtractionUnlocked,
          available: availableStardust >= 2 && !roverExtractionUnlocked && findMineralsUnlocked,
        },
        satelliteExtraction: {
          unlocked: satelliteExtractionUnlocked,
          available: availableStardust >= 2 && !satelliteExtractionUnlocked && p4MineralsUnlocked,
        },
        asteroidClassifications: asteroidClassifications?.length || 0,
        cloudClassifications: cloudClassifications?.length || 0,
        availableStardust,
      });
    } catch (error) {
      console.error("Error fetching upgrade data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (techType: string, cost: number) => {
    if (!session?.user || upgradeData.availableStardust < cost) return;

    try {
      await supabase.from("researched").insert([
        {
          user_id: session.user.id,
          tech_type: techType,
        },
      ]);
      
      // Refresh data
      await fetchUpgradeData();
    } catch (error) {
      console.error("Error upgrading:", error);
    }
  };

  const availableUpgrades = [
    // EQUIPMENT UPGRADES
    // Telescope upgrades (Equipment - 10 stardust)
    ...(upgradeData.telescopeReceptors.current < upgradeData.telescopeReceptors.max ? [{
      id: "telescope-receptors",
      title: "Telescope Receptors",
      description: "Extend your telescope's receptors to see deeper dips in lightcurves, revealing hidden anomalies. Increases anomaly detection by 2 per scan.",
      category: "telescope" as const,
      subcategory: "equipment" as const,
      current: upgradeData.telescopeReceptors.current,
      max: upgradeData.telescopeReceptors.max,
      cost: 10,
      available: upgradeData.telescopeReceptors.available,
      onUpgrade: () => handleUpgrade("probereceptors", 10),
    }] : []),
    
    // Satellite upgrades (Equipment - 10 stardust)
    ...(upgradeData.satelliteCount.current < upgradeData.satelliteCount.max ? [{
      id: "satellite-count",
      title: "Additional Satellite",
      description: "Deploy an additional weather satellite to your fleet for enhanced planetary coverage. Increases observation capacity across multiple worlds.",
      category: "satellite" as const,
      subcategory: "equipment" as const,
      current: upgradeData.satelliteCount.current,
      max: upgradeData.satelliteCount.max,
      cost: 10,
      available: upgradeData.satelliteCount.available,
      onUpgrade: () => handleUpgrade("satellitecount", 10),
    }] : []),
    
    // Rover upgrades (Equipment - 10 stardust)
    ...(upgradeData.roverWaypoints.current < upgradeData.roverWaypoints.max ? [{
      id: "rover-waypoints",
      title: "Rover Navigation System",
      description: "Upgrade your rover's navigation system to support 2 additional waypoints (total 6). Allows for more complex exploration routes and increased discovery potential.",
      category: "rover" as const,
      subcategory: "equipment" as const,
      current: upgradeData.roverWaypoints.current,
      max: upgradeData.roverWaypoints.max,
      cost: 10,
      available: upgradeData.roverWaypoints.available,
      onUpgrade: () => handleUpgrade("roverwaypoints", 10),
    }] : []),

    // PROJECT/DATA UPGRADES
    // Spectroscopy (Project/Data - 2 stardust)
    ...(!upgradeData.spectroscopy.unlocked ? [{
      id: "spectroscopy",
      title: "Spectroscopy Data",
      description: "Access detailed atmospheric composition data from telescope observations of planets. Unlock spectroscopic analysis for enhanced planetary characterization.",
      category: "telescope" as const,
      subcategory: "project" as const,
      cost: 2,
      available: upgradeData.spectroscopy.available,
      onUpgrade: () => handleUpgrade("spectroscopy", 2),
    }] : []),

    // MINING UPGRADES
    // AI4M Minerals (Mining - 2 stardust)
    ...(!upgradeData.findMinerals.unlocked ? [{
      id: "findMinerals",
      title: "Find Mineral Deposits",
      description: "Your rovers can now detect and locate mineral and soil deposits during AI4Mars terrain surveys. Enables future extraction of iron oxide, silicates, and other valuable resources.",
      category: "rover" as const,
      subcategory: "mining" as const,
      cost: 2,
      available: upgradeData.findMinerals.available,
      onUpgrade: () => handleUpgrade("findMinerals", 2),
    }] : []),

    // P4 + CoM Minerals (Mining - 2 stardust)
    ...(!upgradeData.p4FindMinerals.unlocked ? [{
      id: "p4Minerals",
      title: "Find Icy Deposits",
      description: "Your satellites can now identify and track water & CO2-ice sources through Planet Four and Cloudspotting missions. Combine sublimation data with cloud patterns for precise ice location.",
      category: "satellite" as const,
      subcategory: "mining" as const,
      cost: 2,
      available: upgradeData.p4FindMinerals.available,
      onUpgrade: () => handleUpgrade("p4Minerals", 2),
    }] : []),
    
    // Rover Extraction Method (Mining - 2 stardust)
    ...(!upgradeData.roverExtraction.unlocked ? [{
      id: "roverExtraction",
      title: "Rover Mineral Extraction",
      description: "Equip your rovers with drilling and excavation tools to extract mineral deposits from the Martian surface. Unlock active harvesting of iron ore, silicates, and other resources.",
      category: "rover" as const,
      subcategory: "mining" as const,
      cost: 2,
      available: upgradeData.roverExtraction.available,
      onUpgrade: () => handleUpgrade("roverExtraction", 2),
    }] : []),

    // Satellite Extraction Method (Mining - 2 stardust)
    ...(!upgradeData.satelliteExtraction.unlocked ? [{
      id: "satelliteExtraction",
      title: "Atmospheric Resource Collection",
      description: "Deploy atmospheric collectors and spectral analysis equipment to your satellites. Extract water ice, CO2 ice, and atmospheric vapours from exoplanets.",
      category: "satellite" as const,
      subcategory: "mining" as const,
      cost: 2,
      available: upgradeData.satelliteExtraction.available,
      onUpgrade: () => handleUpgrade("satelliteExtraction", 2),
    }] : []),
  ];

  const progressItems = [
    {
      id: "asteroid-progress",
      title: "Active Asteroids",
      description: "Find asteroids with thermal activity and comets after discovering 2 regular asteroids.",
      category: "telescope" as const,
      current: upgradeData.asteroidClassifications,
      max: 2,
      cost: 0,
      available: false,
      isLocked: upgradeData.asteroidClassifications < 2,
      requirementText: `${upgradeData.asteroidClassifications}/2 asteroid classifications`,
      onUpgrade: () => {},
    },
    {
      id: "gaseous-clouds",
      title: "Gaseous Cloudspotting",
      description: "Monitor gaseous planets with advanced radar systems after classifying weather on terrestrial planets.",
      category: "satellite" as const,
      current: upgradeData.cloudClassifications,
      max: 2,
      cost: 0,
      available: false,
      isLocked: upgradeData.cloudClassifications < 2,
      requirementText: `${upgradeData.cloudClassifications}/2 cloud classifications`,
      onUpgrade: () => {},
    },
  ];

  const researchedUpgrades = [
    // EQUIPMENT
    ...(upgradeData.telescopeReceptors.current >= upgradeData.telescopeReceptors.max ? [{
      id: "telescope-complete",
      title: "Telescope Receptors",
      description: "Your telescope's receptors are fully enhanced for maximum anomaly detection.",
      category: "telescope" as const,
      subcategory: "equipment" as const,
      current: upgradeData.telescopeReceptors.current,
      max: upgradeData.telescopeReceptors.max,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),
    
    ...(upgradeData.satelliteCount.current >= upgradeData.satelliteCount.max ? [{
      id: "satellite-complete",
      title: "Satellite Fleet",
      description: "Your satellite fleet is at maximum capacity for planetary observations.",
      category: "satellite" as const,
      subcategory: "equipment" as const,
      current: upgradeData.satelliteCount.current,
      max: upgradeData.satelliteCount.max,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),
    
    ...(upgradeData.roverWaypoints.current >= upgradeData.roverWaypoints.max ? [{
      id: "rover-waypoints-complete",
      title: "Rover Navigation System",
      description: "Your rover's navigation system is fully upgraded for maximum waypoint capacity.",
      category: "rover" as const,
      subcategory: "equipment" as const,
      current: upgradeData.roverWaypoints.current,
      max: upgradeData.roverWaypoints.max,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),
    
    // PROJECT/DATA
    ...(upgradeData.spectroscopy.unlocked ? [{
      id: "spectroscopy-complete",
      title: "Spectroscopy Data",
      description: "Spectroscopic analysis is now available for all planetary observations.",
      category: "telescope" as const,
      subcategory: "project" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),

    // MINING
    ...(upgradeData.findMinerals.unlocked ? [{
      id: "findMinerals-complete",
      title: "Find Mineral Deposits",
      description: "Your rovers can now detect mineral and soil deposits during terrain surveys.",
      category: "rover" as const,
      subcategory: "mining" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),

    ...(upgradeData.p4FindMinerals.unlocked ? [{
      id: "p4Minerals-complete",
      title: "Find Icy Deposits",
      description: "Your satellites can now track and locate water & CO2-ice sources.",
      category: "satellite" as const,
      subcategory: "mining" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),

    ...(upgradeData.roverExtraction.unlocked ? [{
      id: "roverExtraction-complete",
      title: "Rover Mineral Extraction",
      description: "Your rovers can actively extract and harvest mineral deposits from surfaces.",
      category: "rover" as const,
      subcategory: "mining" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),

    ...(upgradeData.satelliteExtraction.unlocked ? [{
      id: "satelliteExtraction-complete",
      title: "Atmospheric Resource Collection",
      description: "Your satellites can collect atmospheric resources from exoplanets.",
      category: "satellite" as const,
      subcategory: "mining" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),
  ];

  // Group upgrades by subcategory
  const groupBySubcategory = (upgrades: any[]) => {
    const grouped = {
      equipment: upgrades.filter(u => u.subcategory === "equipment"),
      project: upgrades.filter(u => u.subcategory === "project"),
      mining: upgrades.filter(u => u.subcategory === "mining"),
    };
    return grouped;
  };

  const availableGrouped = groupBySubcategory(availableUpgrades);
  const researchedGrouped = groupBySubcategory(researchedUpgrades);

  // Auto-switch to researched tab if nothing is available
  useEffect(() => {
    if (!loading && availableUpgrades.length === 0 && researchedUpgrades.length > 0) {
      setActiveTab("researched");
    }
  }, [loading, availableUpgrades.length, researchedUpgrades.length]);

  return (
    <div className="space-y-6">
      {/* Stardust Display */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold">Research Lab</h2>
          <p className="text-sm text-muted-foreground">Enhance your equipment with stardust</p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Quantity upgrades: 10⭐</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Data upgrades: 2⭐</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{upgradeData.availableStardust} ⭐</div>
          <p className="text-xs text-muted-foreground">Available Stardust</p>
        </div>
      </div>

      {/* Upgrade Tabs */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading upgrades...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available" className="flex items-center gap-2">
            Available
            {availableUpgrades.length > 0 && (
              <Badge variant="default" className="text-xs">
                {availableUpgrades.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="researched" className="flex items-center gap-2">
            Researched
            {researchedUpgrades.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {researchedUpgrades.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6 space-y-6">
          {availableUpgrades.length > 0 ? (
            <>
              {/* Equipment Section */}
              {availableGrouped.equipment.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Equipment Upgrades
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {availableGrouped.equipment.map((upgrade) => (
                      <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                    ))}
                  </div>
                </div>
              )}

              {/* Project/Data Section */}
              {availableGrouped.project.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Project & Data Unlocks
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {availableGrouped.project.map((upgrade) => (
                      <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                    ))}
                  </div>
                </div>
              )}

              {/* Mining Section */}
              {availableGrouped.mining.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Mining & Extraction
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {availableGrouped.mining.map((upgrade) => (
                      <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No upgrades available at the moment.</p>
              <p className="text-sm">Complete more classifications to earn stardust!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="researched" className="mt-6 space-y-6">
          {researchedUpgrades.length > 0 ? (
            <>
              {/* Equipment Section */}
              {researchedGrouped.equipment.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Equipment Upgrades
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {researchedGrouped.equipment.map((upgrade) => (
                      <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                    ))}
                  </div>
                </div>
              )}

              {/* Project/Data Section */}
              {researchedGrouped.project.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Project & Data Unlocks
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {researchedGrouped.project.map((upgrade) => (
                      <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                    ))}
                  </div>
                </div>
              )}

              {/* Mining Section */}
              {researchedGrouped.mining.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Mining & Extraction
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {researchedGrouped.mining.map((upgrade) => (
                      <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">No researched upgrades yet.</p>
              <p className="text-sm">Start researching to build your capabilities!</p>
            </div>
          )}
        </TabsContent>
        </Tabs>
      )}

      {/* Coming Soon Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-muted-foreground">Coming Soon</span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CompactUpgradeCard
            title="Deep Space Probe"
            description="Extend telescope range for observations beyond the solar system."
            category="telescope"
            cost={10}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          />
          <CompactUpgradeCard
            title="Advanced Radar System"
            description="Enhanced atmospheric scanning for satellite observations."
            category="satellite"
            cost={2}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          />
        </div>
      </div>
    </div>
  );
}