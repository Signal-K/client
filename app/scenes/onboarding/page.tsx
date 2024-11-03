import React from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { EarthScene } from "../earth/scene";
import InitialiseChapterOneUser from "@/components/(scenes)/chapters/one/InitialiseUser";
import InventoryPage from "@/components/Inventory/Grid/Grid";
import EnhancedWeatherEvents from "@/components/enhanced-weather-events";
import { MissionSelectorComponent } from "@/components/mission-selector";

export default function Onboarding () {
    return (
        <EarthScene
            // topSection={<EnhancedWeatherEvents />}
            middleSection={<MissionSelectorComponent />}
            bottomSection={<InventoryPage />}
        />
    );
};