"use client"

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import Section from "@/src/components/sections/Section"
import ToolCard from "@/src/components/deployment/missions/structures/tool-card"
import { RoverIcon, SatelliteIcon, TelescopeComplexIcon } from "@/src/components/deployment/missions/structures/tool-icons"
import { MineralCard } from "@/src/components/deployment/structures/mineral-card";
import { MineralConfiguration } from "@/src/utils/mineralAnalysis";
import { Package, Wrench, Sparkles } from "lucide-react";
import Link from "next/link";
import { fetchUserUpgrades } from "@/src/utils/userUpgrades";

type TabType = "minerals" | "tools";

interface MineralDeposit {
  mineral: MineralConfiguration;
  location: string;
  quantity: number;
};

interface InventoryViewportInterface {
    mobileMenuOpen: boolean;
    loading: boolean;
    activeTab: TabType;
    mineralDeposits: MineralDeposit[];
    depositLoading: boolean;
    telescopeUpgrade: boolean;
    satelliteCount: number;
    roverLevel: number;
    findMinerals: boolean;
};

export default function InventoryViewport() {
  const router = useRouter();

  const supabase = useSupabaseClient();
  const session = useSession();

  if (!session) {
    router.push("/auth");
  };

  // State management
  const [state, setState] = useState<InventoryViewportInterface>({
    loading: true,
    mobileMenuOpen: false,
    activeTab: "minerals",
    mineralDeposits: [],
    depositLoading: true,
    telescopeUpgrade: false,
    satelliteCount: 1,
    roverLevel: 1,
    findMinerals: false,
  });

  const setMobileMenuOpen = ( open: boolean ) => {
    setState(( prev ) => ({ ...prev, mobileMenuOpen: open }))
  };

  const setActiveTab = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  // Fetch user upgrades and mineral deposits
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      // Fetch upgrades using utility function
      const upgrades = await fetchUserUpgrades(supabase, session.user.id);

      setState((prev) => ({
        ...prev,
        telescopeUpgrade: upgrades.telescopeUpgrade,
        satelliteCount: upgrades.satelliteCount,
        findMinerals: upgrades.findMinerals,
        roverLevel: upgrades.roverLevel,
      }));

      // Fetch mineral deposits if unlocked
      if (upgrades.findMinerals) {
        const { data: deposits, error: depErr } = await supabase
          .from("mineralDeposits")
          .select("id, mineralconfiguration, location, roverName, created_at")
          .not("location", "is", null)
          .eq("owner", session.user.id);

        if (!depErr && deposits) {
          setState((prev) => ({
            ...prev,
            mineralDeposits: (deposits as any[]).map((row) => ({
              mineral: row.mineralconfiguration,
              location: row.location,
              quantity: row.quantity ?? 1,
            })),
            depositLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, depositLoading: false }));
        }
      } else {
        setState((prev) => ({ ...prev, depositLoading: false }));
      }
    };

    fetchUserData();
  }, [session, supabase]);

  return (
    <Section
        sectionId="inventory-viewport"
        variant="viewport"
        backgroundType="none"
        expandLink={"/inventory"}
    >
        <div className="relative w-full flex flex-col py-4 md:py-6">
            {/* Header with icon and gradient accent */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                    <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        Inventory
                        {state.mineralDeposits.length > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">
                                ({state.mineralDeposits.length} deposit{state.mineralDeposits.length !== 1 ? 's' : ''})
                            </span>
                        )}
                    </h2>
                </div>
            </div>

            {/* Tab Buttons at Top */}
            <div className="flex gap-2 mb-4 p-1 bg-muted/50 rounded-lg">
                <Button
                    variant={state.activeTab === "minerals" ? "default" : "ghost"}
                    onClick={() => setActiveTab("minerals")}
                    className="flex-1 gap-2"
                    size="sm"
                >
                    <Sparkles className="w-4 h-4" />
                    Minerals
                </Button>
                <Button
                    variant={state.activeTab === "tools" ? "default" : "ghost"}
                    onClick={() => setActiveTab("tools")}
                    className="flex-1 gap-2"
                    size="sm"
                >
                    <Wrench className="w-4 h-4" />
                    Tools
                </Button>
            </div>

            {/* Tab Content - Compact height */}
            <div className="flex-1 min-h-[180px] max-h-[400px]">
                {state.activeTab === "tools" && (
                    <section className="flex-shrink-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <Link href="/structures/telescope">
                                <ToolCard
                                    icon={<TelescopeComplexIcon hasVisual={state.telescopeUpgrade} />}                        
                                    name="Telescope Complex"
                                    count={1}
                                    status="active"
                                    description={state.telescopeUpgrade ? "Radio + Visual" : "Radio Telescope"}
                                />
                            </Link>
                            <Link href="/viewports/satellite">
                                <ToolCard
                                    icon={<SatelliteIcon count={state.satelliteCount} />}
                                    name="Weather Satellite"
                                    count={state.satelliteCount}
                                    status="active"
                                    description="Orbital monitoring"
                                />
                            </Link>
                            <Link href="/viewports/roover">
                                <ToolCard
                                    icon={<RoverIcon level={state.roverLevel} />}
                                    name="Investigative Rover"
                                    count={1}
                                    status="active"
                                    description={`Level ${state.roverLevel} analysis`}
                                />
                            </Link>
                        </div>
                    </section>
                )}

                {state.activeTab === "minerals" && (
                    <section className="flex-1 flex flex-col min-h-0">
                        {state.depositLoading ? (
                            <Card className="p-4 text-center bg-muted/30">
                                <p className="text-sm text-muted-foreground">Loading deposits...</p>
                            </Card>
                        ) : !state.findMinerals ? (
                            <Card className="p-4 text-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                                <p className="text-sm text-muted-foreground mb-1">🔒 Mineral detection locked</p>
                                <p className="text-xs text-muted-foreground">
                                    Research "Find Mineral Deposits" to unlock
                                </p>
                            </Card>
                        ) : state.mineralDeposits.length === 0 ? (
                            <Card className="p-4 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                                <p className="text-sm text-muted-foreground mb-1">No deposits collected yet</p>
                                <p className="text-xs text-muted-foreground">
                                    Deploy your rover and classify terrain to discover minerals
                                </p>
                            </Card>
                        ) : (
                            <div className="overflow-y-auto pr-1 -mr-1 max-h-[320px]">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-1">
                                    {state.mineralDeposits.map((deposit, idx) => (
                                        <MineralCard
                                            key={`${deposit.mineral.mineralType}-${idx}`}
                                            mineral={deposit.mineral}
                                            location={deposit.location}
                                            quantity={deposit.quantity}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    </Section>
  );
}
