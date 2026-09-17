'use client';

import React from "react";
import { EarthScene } from "@/app/scenes/earth/scene";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import MissionSelector from "@/components/Missions/mission-selector";
import Navbar from "@/components/Layout/Navbar";
import GameNavbar from "@/components/Layout/Tes";

export default function Onboarding () {
    return (
        <>
            <GameNavbar />
            <div className="py-5">
                <EarthScene
                    topSection={<></>}
                    middleSection={<MissionSelector />}
                    // toolbar={<VerticalToolbar />}
                    // bottomSection={<InventoryPage />}
                />
            </div>
        </>
    ); 
};