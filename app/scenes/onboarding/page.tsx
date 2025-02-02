import React from "react";
import { EarthScene } from "@/app/scenes/earth/scene";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import EnhancedWeatherEvents from '@/components/(scenes)/mining/enhanced-weather-events';
import MissionSelector from "@/components/Missions/mission-selector";
import VerticalToolbar from "@/components/Layout/Toolbar";

export default function Onboarding () {
    return (
        <EarthScene
            topSection={<EnhancedWeatherEvents />}
            middleSection={<MissionSelector />}
            // toolbar={<VerticalToolbar />}
            // bottomSection={<InventoryPage />}
        />
    ); 
};