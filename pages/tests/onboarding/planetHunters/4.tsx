import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import Stitching from "../../../../components/onboarding/LightKurve/playing";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";
import TrophyBlockLightkurveOnboardingPt1 from "../../../../components/onboarding/blocks/gamification/trophyBlock";
import OwnedItemsList from "../../../../components/Gameplay/Inventory/userOwnedItems";
import { useSession } from "@supabase/auth-helpers-react";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 40;
    const session = useSession();
    const currentPage = 4

    return (
        <CoreLayout>
            <Stitching />
            <TrophyBlockLightkurveOnboardingPt1 />
            <OwnedItemsList />
            {/* <ProgressSidebar credits={credits} currentPage={currentPage} /> */}
        </CoreLayout>
    );
};