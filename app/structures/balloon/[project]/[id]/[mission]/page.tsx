'use client'

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSessionContext } from "@supabase/auth-helpers-react"

import { StarterLidar } from "@/components/Projects/Lidar/Clouds"
import GameNavbar from "@/components/Layout/Tes"

export default function BalloonClassifyPage() {
    const params = useParams();
    const router = useRouter();

    const { session, isLoading } = useSessionContext();

    const [MissionComponent, setMissionComponent] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        if (!isLoading && !session) {
            router.push('/')
        };
    }, [session, isLoading, router]);

    useEffect(() => {
        if (isLoading || !session) return;

        const project = String(params.project);
        const mission = String(params.mission);
        const idParam = String(params.id || "");

        let anomalyid: string | undefined;
        if (idParam.startsWith("an-")) {
            anomalyid = idParam.replace("an-", "");
        } else if (!isNaN(Number(idParam))) {
            anomalyid = idParam;
        };

        let component: React.ReactNode = null;

        switch(project) {
            case 'cloudspotting':
                switch(mission) {
                    case "classify":
                        component = <StarterLidar anomalyid={anomalyid || ""} />
                        break;
                };
        };

        setMissionComponent(component)
    }, [params, session, isLoading]);

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <div className="fixed inset-0 -z-10">
                <img 
                    className="w-full h-full object-cover"
                    src="/assets/Backdrops/Earth.png"
                    alt="Earth Background"
                />
            </div>

            <div className="relative z-10 pb-8">
                <GameNavbar />
            </div>

            <main className="relative z-5 py-8 flex justify-center">
                <div className="w-full max-w-6xl px-4">
                    {MissionComponent}
                </div>
            </main>
        </div>
    )
}