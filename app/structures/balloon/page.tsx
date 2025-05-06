'use client';

import Home from "@/app/page";
import GameNavbar from "@/components/Layout/Tes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { BuildingIcon } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function WeatherBalloonOnEarthPage() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [hasStruct, setHasStruct] = useState<boolean | null>(null);

    if (!session) {
        return (
            <Home />
        );
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src='/assets/Backdrops/Earth.png'
                alt='Earth Background'
            />
            <div className="w-full">
                <GameNavbar />
            </div>
            <div className="flex flex-row space-y-4">
                <Dialog defaultOpen>
                    <div className="relative transition-all duration-500 ease-in-out">
                        <DialogContent
                                className="p-6 rounded-3xl text-white max-w-3xl mx-auto"
                                style={{ background: 'linear-gradient(135deg, rgba(44, 79, 100, 0.7), rgba(95, 203, 195, 0.7))' }}
                        > 
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-2">
                                        <BuildingIcon className="w-8 h-8 text-[#a3be8c]" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-[#eceff4]">Weather Balloon</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="relative flex justify-center my-4">
                                <img

                                />
                            </div>
                            {/* Alert mapping goes here */}
                            {/* Actions mapping goes here */}
                            <div className="gap-4 mt-6">
                                <div className="flex flex-col items-center my-4 space-y-4">

                                </div>
                            </div>
                        </DialogContent>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};