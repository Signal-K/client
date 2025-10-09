"use client";

import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CompactUpgradeCard } from "./CompactUpgradeCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
    asteroidClassifications: 0,
    cloudClassifications: 0,
    availableStardust: 0,
  });

  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    fetchUpgradeData();
  }, [session]);

  const fetchUpgradeData = async () => {
    if (!session?.user) return;

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

      // Calculate stardust
      const basePoints = allClassifications?.length || 0;
      
      // Only count purchased upgrades that cost stardust (not automatic unlocks)
      const paidUpgrades = researched?.filter(r => 
        ['probereceptors', 'satellitecount', 'probecount', 'proberange', 'rovercount', 'roverwaypoints'].includes(r.tech_type)
      ) || [];
      
      const researchPenalty = paidUpgrades.length * 10;
      const availableStardust = Math.max(0, basePoints - researchPenalty);

      console.log('Stardust calculation:', {
        basePoints,
        totalResearched: researched?.length || 0,
        paidUpgrades: paidUpgrades.length,
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
          current: 1 + satelliteUpgrades,
          max: 2,
          available: availableStardust >= 10 && satelliteUpgrades < 1,
        },
        roverWaypoints: {
          current: 4 + (roverWaypointUpgrades * 2),
          max: 6,
          available: availableStardust >= 10 && roverWaypointUpgrades < 1,
        },
        asteroidClassifications: asteroidClassifications?.length || 0,
        cloudClassifications: cloudClassifications?.length || 0,
        availableStardust,
      });
    } catch (error) {
      console.error("Error fetching upgrade data:", error);
    }
  };

  const handleUpgrade = async (techType: string) => {
    if (!session?.user || upgradeData.availableStardust < 10) return;

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
    // Telescope upgrades
    ...(upgradeData.telescopeReceptors.current < upgradeData.telescopeReceptors.max ? [{
      id: "telescope-receptors",
      title: "Telescope Receptors",
      description: "Extend your telescope's receptors to see deeper dips in lightcurves, revealing hidden anomalies. Increases anomaly detection by 2 per scan.",
      category: "telescope" as const,
      current: upgradeData.telescopeReceptors.current,
      max: upgradeData.telescopeReceptors.max,
      cost: 10,
      available: upgradeData.telescopeReceptors.available,
      onUpgrade: () => handleUpgrade("probereceptors"),
    }] : []),
    
    // Satellite upgrades
    ...(upgradeData.satelliteCount.current < upgradeData.satelliteCount.max ? [{
      id: "satellite-count",
      title: "Additional Satellite",
      description: "Deploy an additional weather satellite to your fleet for enhanced planetary coverage. Increases observation capacity across multiple worlds.",
      category: "satellite" as const,
      current: upgradeData.satelliteCount.current,
      max: upgradeData.satelliteCount.max,
      cost: 10,
      available: upgradeData.satelliteCount.available,
      onUpgrade: () => handleUpgrade("satellitecount"),
    }] : []),
    
    // Rover upgrades
    ...(upgradeData.roverWaypoints.current < upgradeData.roverWaypoints.max ? [{
      id: "rover-waypoints",
      title: "Rover Navigation Upgrade",
      description: "Upgrade your rover's navigation system to support 2 additional waypoints (total 6). Allows for more complex exploration routes and increased discovery potential.",
      category: "rover" as const,
      current: upgradeData.roverWaypoints.current,
      max: upgradeData.roverWaypoints.max,
      cost: 10,
      available: upgradeData.roverWaypoints.available,
      onUpgrade: () => handleUpgrade("roverwaypoints"),
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
  ];

  return (
    <div className="space-y-6">
      {/* Stardust Display */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold">Research Lab</h2>
          <p className="text-sm text-muted-foreground">Enhance your equipment with stardust</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{upgradeData.availableStardust} ⭐</div>
          <p className="text-xs text-muted-foreground">Available Stardust</p>
        </div>
      </div>

      {/* Upgrade Tabs */}
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

      {/* Coming Soon Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CompactUpgradeCard
            title="Spectroscopy Data"
            description="Access detailed atmospheric composition data from satellite observations."
            category="satellite"
            cost={20}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          />
          <CompactUpgradeCard
            title="Deep Space Probe"
            description="Extend telescope range for observations beyond the solar system."
            category="telescope"
            cost={25}
            available={false}
            isLocked={true}
            requirementText="Coming in future update"
            onUpgrade={() => {}}
          />
          <CompactUpgradeCard
            title="Rover Battery Extension"
            description="Increase rover battery life for longer exploration missions."
            category="rover"
            cost={15}
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