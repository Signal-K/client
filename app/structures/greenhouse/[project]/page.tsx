'use client'

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSessionContext } from "@supabase/auth-helpers-react"
import GameNavbar from "@/components/Layout/Tes"
import { GreenhouseResearchStations } from "@/components/Structures/Missions/Biologists/ResearchStations"
import ChatGPTImageClassifier from "@/app/tests/pleaseWork"

export default function GreenhouseProjectRoute() {
    const { project } = useParams();
    const router = useRouter();

    const { session, isLoading } = useSessionContext();

    const [ProjectComponent, setProjectComponent] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        if (!isLoading && !session) {
            router.push('/');
        };
    }, [isLoading, session, router]);

    useEffect(() => {
        if (!isLoading && session) {
            switch (project) {
                case 'stations':
                    setProjectComponent(<GreenhouseResearchStations />);
                    break;
                case 'scan':
                    setProjectComponent(<ChatGPTImageClassifier />);
                    break;
                default:
                    router.push('/structures/greenhouse');
                    break;
            };
        };
    }, [project, session, isLoading, router]);

    if (isLoading) {
        return null;
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
                alt="Earth Background"
            />

            <div className="relative z-10 pb-4">
                <GameNavbar />
            </div>

            <main className="flex-grow z-10 px-4 py-12 flex justify-center items-start overflow-y-auto">
                <div className="max-w-4xl w-full">
                    <div className="mb-6 flex justify-end">
                        <button
                        onClick={() => router.push('/structures/greenhouse')}
                        className="bg-muted hover:bg-muted/70 text-sm text-foreground border border-border rounded-md px-4 py-2 transition-colors"
                        >
                        All Projects
                        </button>
                    </div>
                    {ProjectComponent}
                </div>
            </main>
        </div>
    );
};