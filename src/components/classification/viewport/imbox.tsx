"use client"

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import Section from "@/src/components/sections/Section"
import { useRouter } from "next/navigation";
import { Bell, Inbox, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/src/components/ui/button"
import VotesList from "@/src/components/social/votesonyours";
import AwaitingObjects from "@/src/components/deployment/allLinked";

type TabType = "imbox" | "objects";

interface ImboxViewportInterface {
    mobileMenuOpen: boolean;
    loading: boolean;
    activeTab: TabType;
};

export default function ImboxViewport() {
    const router = useRouter();

    const [state, setState] = useState<ImboxViewportInterface>({
        loading: true,
        mobileMenuOpen: false,
        activeTab: "imbox",
    });

    const supabase = useSupabaseClient();
    const session = useSession();

    const setActiveTab = (tab: TabType) => {
        setState((prev) => ({ ...prev, activeTab: tab }));
    };

    return (
        <Section
            sectionId="imbox-viewport"
            variant="viewport"
            backgroundType="none"
            expandLink={"/imbox"}
        >
            <div className="relative w-full flex flex-col py-4 md:py-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                        <Inbox className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            Inbox
                        </h2>
                    </div>
                </div>

                {/* Tab buttons */}
                <div className="flex gap-2 mb-4 p-1 bg-muted/50 rounded-lg">
                    <Button
                        variant={state.activeTab === "imbox" ? "default" : "ghost"}
                        onClick={() => setActiveTab("imbox")}
                        className="flex-1 gap-2"
                        size="sm"
                    >
                        <Bell className="w-4 h-4" />
                        Votes
                    </Button>
                    <Button
                        variant={state.activeTab === "objects" ? "default" : "ghost"}
                        onClick={() => setActiveTab("objects")}
                        className="flex-1 gap-2"
                        size="sm"
                    >
                        <Wrench className="w-4 h-4" />
                        Objects awaiting observation
                    </Button>
                </div>

                {/* Tab content */}
                <div className="flex-1 min-h-[180px] max-h-[400px]">
                    {state.activeTab === "imbox" && (
                        <section className="flex-shrink-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                <VotesList />
                            </div>
                        </section>
                    )}

                    {state.activeTab === "objects" && (
                        <section>
                            <AwaitingObjects />
                        </section>
                    )}
                </div>
            </div>
        </Section>
    );
};