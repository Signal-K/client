'use client';

import GameNavbar from "@/components/Layout/Tes";
import TotalPoints from "@/components/Structures/Missions/Stardust/Total";
import { AdvancedTechTreeComponent } from "@/components/Structures/Research/OldTechTree";
import { Button } from "@/components/ui/button";
import MySettlementsLocations from "@/content/Classifications/UserLocations";
import React, { useEffect, useState } from "react";

export default function TechTreeResearchPage() {
    return (
        <div className="relative w-full py-10 bg-black text-white">
            <GameNavbar />
            Available: <TotalPoints />
            <h2 className="text-lg text-white">Available upgrades</h2>
            <h3 className="text-md text-white">Astronomy</h3>
            <Button
                variant='ghost'
            >
                Probecount ++
            </Button>
            <h3 className="text-md text-white">Meteorology</h3>
            <Button
                variant='ghost'
            >
                Probecount ++
            </Button>
            <h3 className="text-md text-white">Biology</h3>
            <Button
                variant='ghost'
            >
                Cameracount++
            </Button>
            <Button
                variant='ghost'
            >
                Station Count - select [show available/ready]
            </Button>
            <h2 className="text-lg text-white">[temporarily] Unavailable upgrades</h2>
            <h3 className="text-md text-white">Astronomy</h3>
            <Button
                variant='ghost'
            >
                Probedistance ++
            </Button>
            <h3 className="text-md text-white">Meteorology</h3>
            <MySettlementsLocations /> - Show weather balloons on Settlements
            <h3 className="text-md text-white">Biology</h3>
            <Button
                variant='ghost'
            >
                Heat/Motion Sensors ++
            </Button>
            {/* <AdvancedTechTreeComponent /> */}
        </div>
    );
};