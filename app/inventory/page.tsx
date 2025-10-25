"use client";

import React, { useEffect, useState } from "react";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { usePageData } from "@/hooks/usePageData";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import { Button } from "@/src/components/ui/button";
import { ArrowRight, Wrench } from "lucide-react";
import ToolCard from "@/src/components/deployment/missions/structures/tool-card";
import { RoverIcon, SatelliteIcon, TelescopeComplexIcon } from "@/src/components/deployment/missions/structures/tool-icons";
import { Card } from "@/src/components/ui/card";
import {
  MineralExtraction,
  type MineralConfiguration,
} from "@/src/components/deployment/extraction/mineral-extraction";
import { fetchUserUpgrades } from "@/src/utils/userUpgrades";

interface MineralDeposit {
  id: number;
  mineral: MineralConfiguration;
  location: string;
  roverName?: string;
  projectType: "P4" | "cloudspotting" | "JVH" | "AI4M";
  discoveryId?: number;
}

export default function UserInventoryPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const router = useRouter();

  const { isDark, toggleDarkMode } = UseDarkMode();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);

  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([]);
  const [mineralsLoading, setMineralsLoading] = useState(true);
  // Researched upgrades / derived values
  const [telescopeUpgrade, setTelescopeUpgrade] = useState<boolean>(false);
  const [satelliteCount, setSatelliteCount] = useState<number>(1);
  const [roverLevel, setRoverLevel] = useState<number>(1);
  const [findMinerals, setFindMinerals] = useState<boolean>(false);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [hasRoverExtraction, setHasRoverExtraction] = useState<boolean>(false);
  const [hasSatelliteExtraction, setHasSatelliteExtraction] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        const currentSession = data?.session ?? session;
        if (!currentSession) {
          router.push("/auth");
        }
      } catch (err) {
        if (!session) router.push("/auth");
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [session, supabase, router]);

  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    loading,
  } = usePageData();

  // Fetch user's mineral deposits from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      // Fetch upgrades using utility function
      const upgrades = await fetchUserUpgrades(supabase, session.user.id);
      
      setTelescopeUpgrade(upgrades.telescopeUpgrade);
      setSatelliteCount(upgrades.satelliteCount);
      setFindMinerals(upgrades.findMinerals);
      setRoverLevel(upgrades.roverLevel);

      // Fetch extraction research status
      const { data: researched } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", session.user.id);

      const roverExtraction = researched?.some(r => r.tech_type === "roverExtraction") || false;
      const satelliteExtraction = researched?.some(r => r.tech_type === "satelliteExtraction") || false;
      
      setHasRoverExtraction(roverExtraction);
      setHasSatelliteExtraction(satelliteExtraction);

      // If the user can find minerals, fetch deposits
      if (upgrades.findMinerals) {
        setDepositLoading(true);
        try {
          // The mineralDeposits table doesn't include a `quantity` column in the DB
          // so only select actual columns. Provide a fallback quantity when mapping.
          const { data: deposits, error: depErr } = await supabase
            .from("mineralDeposits")
            .select(
              "id, mineralconfiguration, location, roverName, created_at, discovery"
            )
            .not("location", "is", null)
            .eq("owner", session.user.id);

          if (depErr) {
            console.error("Error fetching mineral deposits:", depErr);
            setMineralDeposits([]);
          } else if (deposits) {
            setMineralDeposits(
              (deposits as any[]).map(
                (row) =>
                  ({
                    id: row.id,
                    mineral: row.mineralconfiguration,
                    location: row.location,
                    roverName: row.roverName,
                    projectType: (row.mineralconfiguration as any)?.metadata
                      ?.source,
                    discoveryId: row.discovery,
                  } as MineralDeposit)
              )
            );
          }
        } finally {
          setDepositLoading(false);
        }
      } else {
        // Ensure local deposits cleared and not loading if they don't have the tech
        setMineralDeposits([]);
        setDepositLoading(false);
      }
    };

    fetchUserData();
  }, [session, supabase]);

  return (
    <div
      className={`min-h-screen w-full relative flex justify-center ${
        isDark ? "text-[#E5EEF4]" : "text-[#232a36]"
      }`}
    >
      <div className="fixed inset-0 -z-10">
        <div
          className={
            isDark
              ? "bg-gradient-to-br from-[#232a36] via-[#1e293b] to-[#0f172a] w-full h-full"
              : "bg-gradient-to-br from-[#E5EEF4] via-[#D8E5EC] to-[#BFD7EA] w-full h-full"
          }
        />
      </div>

      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />

      {/* Main Content */}
      <div className="w-full h-full pt-24 relative z-10 px-4 md:px-8 max-w-7xl flex flex-col">
        <div className="mb-6">
            <ActivityHeaderSection
                classificationsCount={classifications.length}
                landmarksExpanded={landmarksExpanded}
                onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
            />
        </div>

        <main className="flex-1 flex flex-col gap-4 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="text-2xl font-bold text-primary">Your Inventory</h2>
                <Button onClick={() => router.push("/research")} className="gap-2" variant='outline' size="sm">
                    <Wrench className="w-4 h-4" />Research more items
                </Button>
            </div>

            <section className="flex-shrink-0">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Tools & Automatons</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ToolCard
                        icon={<TelescopeComplexIcon hasVisual={telescopeUpgrade} />}
                        name="Telescope Complex"
                        count={1}
                        status="active"
                        description={telescopeUpgrade ? "Radio + Visual telescopes" : "Radio Telescope"}
                    />
                    <ToolCard
                        icon={<SatelliteIcon count={satelliteCount} />}
                        name="Weather Satellites"
                        count={satelliteCount}
                        status="active"
                        description="Orbital weather monitoring"
                    />
                    <ToolCard
                        icon={<RoverIcon level={roverLevel} />}
                        name="Investigative Rover"
                        count={1}
                        status="active"
                        description={`Level ${roverLevel} terrain analysis`}
                    />
                </div>
            </section>

            <section className="flex-1 flex flex-col min-h-0">
                <h3 className="text-lg font-semibold mb-2 text-foreground flex-shrink-0">Mineral Deposits</h3>

                {depositLoading ? (
                    <Card className="p-6 text-center">
                        <p className="text-muted-foreground">Loading deposits...</p>
                    </Card>
                ) : !findMinerals ? (
                    <Card className="p-6 text-center">
                        <p className="text-muted-foreground mb-1">Mineral detection not yet unlocked</p>
                        <p className="text-sm text-muted-foreground">
                            Research "Find Mineral Deposits" to unlock this feature
                        </p>
                    </Card>
                ) : mineralDeposits.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p className="text-muted-foreground mb-1">No deposits in collection yet</p>
                        <p className="text-sm text-muted-foreground">
                            Deploy your tools and classify terrain to discover deposits for future extraction
                        </p>
                    </Card>
                ) : (
                    <div className="overflow-y-auto pr-2 -mr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-2">
                            {mineralDeposits.map((deposit) => (
                                <MineralExtraction
                                    key={deposit.id}
                                    id={deposit.id}
                                    mineralConfiguration={deposit.mineral}
                                    location={deposit.location}
                                    roverName={deposit.roverName}
                                    projectType={deposit.projectType}
                                    discoveryId={deposit.discoveryId}
                                    hasRoverExtraction={hasRoverExtraction}
                                    hasSatelliteExtraction={hasSatelliteExtraction}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="flex-shrink-0 pb-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0"><RoverIcon level={roverLevel} /></div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">Rover Configuration</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Research extraction tech to automate mining, deploy multiple rovers, and unlock advanced drilling capabilities for rare minerals
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push("/research")}
                            size="sm"
                            className="gap-2 whitespace-nowrap flex-shrink-0"
                        >
                            Unlock Upgrades
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </section>
        </main>
      </div>

      {/* Stub
      
        List of deposits
        List of automatons/tools & numbers
        Info & button to direct user to upgrades, inc. info about automaton/tool additions
      */}
    </div>
  );
}
