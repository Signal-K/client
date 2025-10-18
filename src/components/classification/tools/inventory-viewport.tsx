"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import Section from "@/src/components/sections/Section"
import ToolCard from "@/src/components/deployment/missions/structures/tool-card"
import { RoverIcon, SatelliteIcon, TelescopeComplexIcon } from "@/src/components/deployment/missions/structures/tool-icons"
import Link from "next/link";

type TabType = "minerals" | "tools";

interface InventoryViewportInterface {
    mobileMenuOpen: boolean;
    loading: boolean;
    activeTab: TabType;
};

export default function InventoryViewport() {
  const router = useRouter();

  const supabase = useSupabaseClient();
  const session = useSession();

  if (!session) {
    router.push("/auth");
  }

  // State management
  const [state, setState] = useState<InventoryViewportInterface>({
    loading: true,
    mobileMenuOpen: false,
    activeTab: "minerals",
  });

  const setMobileMenuOpen = ( open: boolean ) => {
    setState(( prev ) => ({ ...prev, mobileMenuOpen: open }))
  };

  const setActiveTab = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  return (
    <Section
        sectionId="inventory-viewport"
        variant="viewport"
        backgroundType="none"
        expandLink={"/inventory"}
    >
        <div className="relative w-full flex flex-col py-8 md:py-12">
            {/* Tab Content */}
            <div className="flex-1 min-h-[200px] mb-4">
                {state.activeTab === "tools" && (
                    <section className="flex-shrink-0">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Tools & Automatons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Link href="/structures/telescope">
                                <ToolCard
                                    icon={<TelescopeComplexIcon />}                        
                                    name="Telescope complex"
                                    count={1}
                                    status="active"
                                    description=""
                                />
                            </Link>
                            <Link href="/viewports/satellite">
                                <ToolCard
                                    icon={<SatelliteIcon />}
                                    name="Satellite"
                                    count={1}
                                    status="active"
                                    description=""
                                />
                            </Link>
                            <Link href="/viewports/roover">
                                <ToolCard
                                    icon={<RoverIcon />}
                                    name="Rover"
                                    count={1}
                                    status="active"
                                    description=""
                                />
                            </Link>
                        </div>
                    </section>
                )}

                {state.activeTab === "minerals" && (
                    <section className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-lg font-semibold mb-4 text-foreground flex-shrink-0">
                            Mineral Deposits
                        </h3>
                        <div className="text-muted-foreground">
                            {/* Mineral deposits content will go here */}
                            <p>Your mineral deposits from rover missions will appear here.</p>
                        </div>
                    </section>
                )}
            </div>

            {/* Tab Buttons at Bottom */}
            <div className="flex gap-2 justify-center mt-auto pt-4 border-t border-border/50">
                <Button
                    variant={state.activeTab === "minerals" ? "default" : "outline"}
                    onClick={() => setActiveTab("minerals")}
                    className="min-w-[120px]"
                >
                    Minerals
                </Button>
                <Button
                    variant={state.activeTab === "tools" ? "default" : "outline"}
                    onClick={() => setActiveTab("tools")}
                    className="min-w-[120px]"
                >
                    Tools
                </Button>
            </div>
        </div>
    </Section>
  );
}
