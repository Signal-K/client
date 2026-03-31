"use client";

import { useState, useEffect, useMemo } from "react";
import { CompactUpgradeCard } from "./CompactUpgradeCard";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { UPGRADES_CONFIG, ResearchUpgrade } from "../config/upgrades-config";

interface ResearchSummary {
  availableStardust: number;
  counts: { asteroid: number; cloud: number; planet: number };
  upgrades: {
    telescopeReceptors: number;
    satelliteCount: number;
    roverWaypoints: number;
    spectroscopyUnlocked: boolean;
    findMineralsUnlocked: boolean;
    p4MineralsUnlocked: boolean;
    roverExtractionUnlocked: boolean;
    satelliteExtractionUnlocked: boolean;
    ngtsAccessUnlocked: boolean;
  };
}

export default function CompactResearchPanel() {
  const [data, setData] = useState<ResearchSummary | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUpgradeData();
  }, []);

  const fetchUpgradeData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gameplay/research/summary");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch research summary");
      }
      setData(payload);
    } catch (error) {
      console.error("Error fetching upgrade data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (techType: string, cost: number) => {
    if (!data || data.availableStardust < cost) return;

    try {
      const response = await fetch("/api/gameplay/research/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techType }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to unlock upgrade");
      }
      await fetchUpgradeData();
    } catch (error) {
      console.error("Error upgrading:", error);
    }
  };

  const { availableUpgrades, researchedUpgrades } = useMemo(() => {
    if (!data) return { availableUpgrades: [], researchedUpgrades: [] };

    const available: any[] = [];
    const researched: any[] = [];

    UPGRADES_CONFIG.forEach((config) => {
      const requirement = config.getRequirement ? config.getRequirement(data) : { isLocked: false };
      const current = config.getCurrent ? config.getCurrent(data.upgrades) : (config.isUnlocked?.(data.upgrades) ? 1 : 0);
      const max = config.max ?? 1;
      const isCompleted = current >= max;

      const baseProps = {
        ...config,
        current,
        max,
        available: data.availableStardust >= config.cost && !requirement.isLocked && !isCompleted,
        onUpgrade: () => handleUpgrade(config.techType, config.cost),
        isLocked: requirement.isLocked,
        requirementText: requirement.text,
      };

      if (isCompleted) {
        researched.push(baseProps);
      } else {
        available.push(baseProps);
      }
    });

    return { availableUpgrades: available, researchedUpgrades: researched };
  }, [data]);

  const progressItems = useMemo(() => {
    if (!data) return [];
    return [
      {
        id: "asteroid-progress",
        title: "Active Asteroids",
        description: "Find asteroids with thermal activity and comets after discovering 2 regular asteroids.",
        category: "telescope" as const,
        current: data.counts.asteroid,
        max: 2,
        cost: 0,
        available: false,
        isLocked: data.counts.asteroid < 2,
        requirementText: `${data.counts.asteroid}/2 asteroid classifications`,
        onUpgrade: () => {},
      },
      {
        id: "gaseous-clouds",
        title: "Gaseous Cloudspotting",
        description: "Monitor gaseous planets with advanced radar systems after classifying weather on terrestrial planets.",
        category: "satellite" as const,
        current: data.counts.cloud,
        max: 2,
        cost: 0,
        available: false,
        isLocked: data.counts.cloud < 2,
        requirementText: `${data.counts.cloud}/2 cloud classifications`,
        onUpgrade: () => {},
      },
    ];
  }, [data]);

  const groupBySubcategory = (upgrades: any[]) => ({
    equipment: upgrades.filter(u => u.subcategory === "equipment"),
    project: upgrades.filter(u => u.subcategory === "project"),
    mining: upgrades.filter(u => u.subcategory === "mining"),
  });

  const availableGrouped = groupBySubcategory(availableUpgrades);
  const researchedGrouped = groupBySubcategory(researchedUpgrades);

  useEffect(() => {
    if (!loading && availableUpgrades.length === 0 && researchedUpgrades.length > 0) {
      setActiveTab("researched");
    }
  }, [loading, availableUpgrades.length, researchedUpgrades.length]);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading upgrades...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-card rounded-lg border">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Research Lab</h2>
          <p className="text-sm text-muted-foreground">Enhance your equipment with stardust</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
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
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold">{data?.availableStardust ?? 0} ⭐</div>
          <p className="text-xs text-muted-foreground">Available Stardust</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 p-1">
          <TabsTrigger value="available" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-1.5 sm:py-2 px-2">
            Available
            {availableUpgrades.length > 0 && <Badge variant="default" className="text-xs">{availableUpgrades.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="researched" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-1.5 sm:py-2 px-2">
            Researched
            {researchedUpgrades.length > 0 && <Badge variant="secondary" className="text-xs">{researchedUpgrades.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {["available", "researched"].map((tab) => {
          const grouped = tab === "available" ? availableGrouped : researchedGrouped;
          const totalCount = tab === "available" ? availableUpgrades.length : researchedUpgrades.length;
          
          return (
            <TabsContent key={tab} value={tab} className="mt-6 space-y-6">
              {totalCount > 0 ? (
                <>
                  {[
                    { key: "equipment", label: "Equipment Upgrades", color: "bg-blue-500" },
                    { key: "project", label: "Project & Data Unlocks", color: "bg-purple-500" },
                    { key: "mining", label: "Mining & Extraction", color: "bg-amber-500" }
                  ].map((section) => (
                    grouped[section.key as keyof typeof grouped].length > 0 && (
                      <div key={section.key}>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${section.color}`}></span>
                          {section.label}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                          {grouped[section.key as keyof typeof grouped].map((upgrade: any) => (
                            <CompactUpgradeCard key={upgrade.id} {...upgrade} />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {tab === "available" && progressItems.length > 0 && (
                     <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                          Mission Progress
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                          {progressItems.map((item) => (
                            <CompactUpgradeCard key={item.id} {...item} />
                          ))}
                        </div>
                      </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">{tab === "available" ? "No upgrades available." : "No researched upgrades yet."}</p>
                  <p className="text-sm">{tab === "available" ? "Complete more classifications to earn stardust!" : "Start researching to build your capabilities!"}</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

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
