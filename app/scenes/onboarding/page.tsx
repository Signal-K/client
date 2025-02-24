'use client';

import React from "react";
import { EarthScene } from "@/app/scenes/earth/scene";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import MissionSelector from "@/components/Missions/mission-selector";
import VerticalToolbar from "@/components/Layout/Toolbar";
import Navbar from "@/components/Layout/Navbar";

export default function Onboarding () {
    return (
        <>
            <Navbar />
            <EarthScene
                topSection={<></>}
                middleSection={<MissionSelector />}
                // toolbar={<VerticalToolbar />}
                // bottomSection={<InventoryPage />}
            />
        </>
    ); 
};