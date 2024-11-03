import React from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { EarthScene } from "../earth/scene";
import InitialiseChapterOneUser from "@/components/(scenes)/chapters/one/InitialiseUser";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import EnhancedWeatherEvents from "@/components/enhanced-weather-events";
import MissionSelector from "@/components/mission-selector";
import VerticalToolbar from "@/components/Layout/Toolbar";

export default function Onboarding () {
    return (
        <EarthScene
            // topSection={<EnhancedWeatherEvents />}
            middleSection={<MissionSelector />}
            toolbar={<VerticalToolbar />}
            // bottomSection={<InventoryPage />}
        />
    );
};