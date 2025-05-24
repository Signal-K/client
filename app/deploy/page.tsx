'use client';

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import GameNavbar from "@/components/Layout/Tes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Building2Icon, Router } from "lucide-react";
import { useRouter } from "next/navigation";
import TelescopeRangeSlider from "@/components/(scenes)/deploy/TelescopeRange";
import AutomatonDeploySection from "@/components/(scenes)/deploy/AutomatonItems";
import BiomassOnEarth from "@/components/Data/BiomassEarth";
import EarthStats from "@/components/Data/EarthStats";
import BiologySectionDeploy from "@/components/(scenes)/deploy/BiodomeStationCard";

export default function DeployAutomatonsPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();

    // const [selectedLocation, setSelectedLocation] = useState(null);

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
                        if (!open) {
                            router.push("/")
                        }
                    }}
                >
                    <DialogContent
                        className="rounded-3xl text-white max-w-3xl w-full h-[90vh] overflow-hidden flex flex-col justify-start"
                        style={{
                            background: "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85)",
                            color: "#2E3440"
                        }}
                    >
                        {/* Header */}
                        <div className="flex justify-center items-center">
                            <div className="flex items-center space-x-2">
                                <Building2Icon className="w-8 h-8 text-[#A3BE8C]" /> {/* <-- CHANGE THIS */}
                                <h1 className="text-2xl font-bold text-[#2E3440]">Kickoff</h1>
                            </div>
                        </div>

                        <div className="flex justify-center my-4">
                            <img
                                src="/planet.svg" // Should probably be an energy/lightning bolt icon
                                alt="Icon"
                                className="w-10 h-10"
                                width="80"
                                height="80"
                                style={{ aspectRatio: "80/80", objectFit: "cover" }}
                            />
                            <h2 className="text-lg font-semibold text-primary px-4">Current energy: 5</h2>
                        </div>
                        
                        {/* Labels */}
                        <div className="absolute left-0 top-[10rem] bottom-[4rem] flex flex-col justify-between pl-4 text-[#4C566A]">
                            <p className="writing-vertical">Astronomy</p>
                            <p className="writing-vertical">Meteorology</p>
                            <p className="writing-vertical">Biology</p>
                        </div>

                        <div className="flex-grow overflow-y-auto w-full left-[4rem] px-12">
                            <>
                                <div className="flex flex-col justify-between h-full">
                                    {/* Astronomy Section */}
                                    <div className="flex-1">
                                        <TelescopeRangeSlider />
                                    </div>

                                    {/* Meteorology Section */}
                                    <div className="flex-1">
                                        <AutomatonDeploySection />
                                    </div>

                                    {/* Biology Section */}
                                    <div className="flex-1 flex flex-col border border-dashed border-gray-300 rounded-lg text-gray-400 p-4 space-y-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <BiomassOnEarth />
                                            <EarthStats />
                                            {/* <p>Nearby stats...</p> */}
                                        </div>
                                        <p className="text-blue-300">
                                            These projects are available for observation:
                                        </p>
                                        <BiologySectionDeploy />
                                    </div>
                                </div>
                            </>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};