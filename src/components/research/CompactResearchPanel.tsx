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
    // Telescope upgrades (Quantity - 10 stardust)
    ...(upgradeData.telescopeReceptors.current < upgradeData.telescopeReceptors.max ? [{
      id: "telescope-receptors",
      title: "Telescope Receptors",
      description: "Extend your telescope's receptors to see deeper dips in lightcurves, revealing hidden anomalies. Increases anomaly detection by 2 per scan. (Quantity Upgrade)",
      category: "telescope" as const,
      current: upgradeData.telescopeReceptors.current,
      max: upgradeData.telescopeReceptors.max,
      cost: 10,
      available: upgradeData.telescopeReceptors.available,
      onUpgrade: () => handleUpgrade("probereceptors", 10),
    }] : []),
    
    // Satellite upgrades (Quantity - 10 stardust)
    ...(upgradeData.satelliteCount.current < upgradeData.satelliteCount.max ? [{
      id: "satellite-count",
      title: "Additional Satellite",
      description: "Deploy an additional weather satellite to your fleet for enhanced planetary coverage. Increases observation capacity across multiple worlds. (Quantity Upgrade)",
      category: "satellite" as const,
      current: upgradeData.satelliteCount.current,
      max: upgradeData.satelliteCount.max,
      cost: 10,
      available: upgradeData.satelliteCount.available,
      onUpgrade: () => handleUpgrade("satellitecount", 10),
    }] : []),
    
    // Rover upgrades (Quantity - 10 stardust)
    ...(upgradeData.roverWaypoints.current < upgradeData.roverWaypoints.max ? [{
      id: "rover-waypoints",
      title: "Rover Navigation Upgrade",
      description: "Upgrade your rover's navigation system to support 2 additional waypoints (total 6). Allows for more complex exploration routes and increased discovery potential. (Quantity Upgrade)",
      category: "rover" as const,
      current: upgradeData.roverWaypoints.current,
      max: upgradeData.roverWaypoints.max,
      cost: 10,
      available: upgradeData.roverWaypoints.available,
      onUpgrade: () => handleUpgrade("roverwaypoints", 10),
    }] : []),

    // AI4M Minerals
    ...(!upgradeData.findMinerals.unlocked ? [{
      id: "findMinerals",
      title: "Find Mineral Deposits",
      description: "Your rovers and satellites can find mineral and soil deposits, which can be extracted and manipulated in future to produce resources and farms",
      category: "rover" as const,
      cost: 2,
      available: upgradeData.findMinerals.available,
      onUpgrade: () => handleUpgrade("findMinerals", 2),
    }] : []),

    // P4 + CoM Minerals
    ...(!upgradeData.p4FindMinerals.unlocked ? [{
      id: "p4Minerals",
      title: "Find Icy Deposits",
      description: "Your satellites can already track sublimation behaviour on your exoplanets, now you can combine your knowledge of clouds and ice-spiders to find water & CO2-ice sources for future extraction",
      category: "satellite" as const,
      cost: 2,
      available: upgradeData.p4FindMinerals.available,
      onUpgrade: () => handleUpgrade("p4Minerals", 2),
    }] : []),
    
    // Rover Extraction Method
    ...(!upgradeData.roverExtraction.unlocked ? [{
      id: "roverExtraction",
      title: "Rover Mineral Extraction",
      description: "Equip your rovers with drilling and excavation tools to extract mineral deposits from the Martian surface. Unlock the ability to harvest iron ore, silicates, and other valuable resources discovered during AI4Mars surveys.",
      category: "rover" as const,
      cost: 2,
      available: upgradeData.roverExtraction.available,
      onUpgrade: () => handleUpgrade("roverExtraction", 2),
    }] : []),

    // Satellite Extraction Method
    ...(!upgradeData.satelliteExtraction.unlocked ? [{
      id: "satelliteExtraction",
      title: "Atmospheric Resource Collection",
      description: "Deploy atmospheric collectors and spectral analysis equipment to your satellites. Extract water ice, CO2 ice, and atmospheric vapours from exoplanets discovered through P4 and cloudspotting missions.",
      category: "satellite" as const,
      cost: 2,
      available: upgradeData.satelliteExtraction.available,
      onUpgrade: () => handleUpgrade("satelliteExtraction", 2),
    }] : []),
    
    // Spectroscopy (Data/Measurement - 2 stardust)
    ...(!upgradeData.spectroscopy.unlocked ? [{
      id: "spectroscopy",
      title: "Spectroscopy Data",
      description: "Access detailed atmospheric composition data from telescope observations of planets. Unlock spectroscopic analysis for enhanced planetary characterization. (Data Upgrade)",
      category: "telescope" as const,
      cost: 2,
      available: upgradeData.spectroscopy.available,
      onUpgrade: () => handleUpgrade("spectroscopy", 2),
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

  const completedUpgrades = [
    ...(upgradeData.telescopeReceptors.current >= upgradeData.telescopeReceptors.max ? [{
      id: "telescope-complete",
      title: "Telescope Receptors",
      description: "Your telescope's receptors are fully enhanced for maximum anomaly detection.",
      category: "telescope" as const,
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
      current: upgradeData.roverWaypoints.current,
      max: upgradeData.roverWaypoints.max,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),
    
    ...(upgradeData.spectroscopy.unlocked ? [{
      id: "spectroscopy-complete",
      title: "Spectroscopy Data",
      description: "Spectroscopic analysis is now available for all planetary observations.",
      category: "telescope" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),

    ...(upgradeData.findMinerals.unlocked ? [{
      id: "findMinerals-complete",
      title: "Find Mineral Deposits",
      description: "Your rovers and satellites can now find mineral and soil deposits for future extraction.",
      category: "rover" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),

    ...(upgradeData.p4FindMinerals.unlocked ? [{
      id: "p4Minerals-complete",
      title: "Find Icy Deposits",
      description: "Your satellites can now track and locate water & CO2-ice sources for future extraction.",
      category: "satellite" as const,
      cost: 0,
      available: false,
      onUpgrade: () => {},
    }] : []),
  ];

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="flex items-center gap-2">
            Available
            {availableUpgrades.length > 0 && (
              <Badge variant="default" className="text-xs">
                {availableUpgrades.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="completed">Complete</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          {availableUpgrades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableUpgrades.map((upgrade) => (
                <CompactUpgradeCard key={upgrade.id} {...upgrade} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upgrades available at the moment.</p>
              <p className="text-sm">Complete more classifications to earn stardust!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressItems.map((item) => (
              <CompactUpgradeCard key={item.id} {...item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedUpgrades.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedUpgrades.map((upgrade) => (
                <CompactUpgradeCard key={upgrade.id} {...upgrade} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed upgrades yet.</p>
              <p className="text-sm">Start upgrading to see your progress here!</p>
            </div>
          )}
        </TabsContent>
        </Tabs>
      )}

      {/* Coming Soon Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CompactUpgradeCard
            title="Deep Space Probe"
            description="Extend telescope range for observations beyond the solar system. (Quantity Upgrade)"
            category="telescope"
            cost={10}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          />
          <CompactUpgradeCard
            title="Mineral deposit extraction"
            description="Collect water, silicates & other minerals that you discover"
            category="rover"
            cost={2}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          />
          {/* <CompactUpgradeCard
            title="Rover Battery Extension"
            description="Increase rover battery life for longer exploration missions. (Data Upgrade)"
            category="rover"
            cost={2}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          /> */}
          <CompactUpgradeCard
            title="Advanced Radar System"
            description="Enhanced atmospheric scanning for satellite observations. (Data Upgrade)"
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