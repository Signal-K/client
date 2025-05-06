'use client';

import { useRouter } from "next/navigation"; // 1. Import useRouter
import Home from "@/app/page";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import GameNavbar from "@/components/Layout/Tes";
import { TelescopeDiskDetector } from "@/components/Projects/Telescopes/DiskDetector";
import SunspotSteps from "@/components/Projects/Telescopes/Sunspots/SunspotShell";
import DailyMinorPlanetMissions from "@/components/Structures/Missions/Astronomers/DailyMinorPlanet/DailyMinorPlanet";
import PlanetHuntersSteps from "@/components/Structures/Missions/Astronomers/PlanetHunters/PlanetHunters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { BuildingIcon, MoonStarIcon, SunIcon, TelescopeIcon, TestTubeDiagonalIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function TelescopeOnEarthPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();

    const [hasStruct, setHasStruct] = useState<boolean | null>(null);

    if (!session) return <Home />;

    const buttons = [
        {
            icon: <TelescopeIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Discover planets",
            dynamicComponent: <PlanetHuntersSteps />,
            classificationtype: 'planet',
            sizePercentage: 95,
            showInNoModal: true,
        },
        {
            icon: <SunIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Sunspot data",
            dynamicComponent: <SunspotSteps />,
            classificationtype: "sunspot",
            sizePercentage: 60,
        },
        {
            icon: <TestTubeDiagonalIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Find early solar systems",
            dynamicComponent: <TelescopeDiskDetector />,
            sizePercentage: 70,
        },
        {
            icon: <MoonStarIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Discover asteroids",
            dynamicComponent: <DailyMinorPlanetMissions />,
            sizePercentage: 95,
        },
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
                alt="Earth Background"
            />
            <div className="w-full">
                <GameNavbar />
            </div>
            <div className="flex flex-row space-y-4">
                <Dialog
                    defaultOpen
                    onOpenChange={(open) => {
                        if (!open) router.push("/"); // 3. Redirect when dialog is closed
                    }}
                >
                    <div className="relative transition-all duration-500 ease-in-out">
                        <DialogContent
                            className="p-6 rounded-3xl text-white max-w-3xl mx-auto"
                            style={{
                                background: 'linear-gradient(135deg, rgba(44, 79, 100, 0.7), rgba(95, 203, 195, 0.7))'
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <BuildingIcon className="w-8 h-8 text-[#a3be8c]" />
                                    <h1 className="text-2xl font-bold text-[#eceff4]">Telescope</h1>
                                </div>
                            </div>

                            <div className="relative flex justify-center my-4">
                                <img
                                    src="/assets/Items/TransitingTelescope.png"
                                    alt='Telescope'
                                    className="w-20 h-20"
                                    width='80'
                                    height='80'
                                    style={{ aspectRatio: '80/80', objectFit: 'cover' }}
                                />
                            </div>

                            <div className="gap-4 mt-6">
                                <div className="flex flex-col items-center my-4 space-y-4">
                                    {buttons.map((button, index) => (
                                        button.showInNoModal !== false && (
                                            <div
                                                key={index}
                                                className="flex items-center justify-center bg-[#85DDA2]/40 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#85DDA2]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                                                onClick={() => {}}
                                                style={{ width: '100%', maxWidth: '200px' }}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <div className="flex-shrink-0">
                                                        {button.icon}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};