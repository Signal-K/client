import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import Instructions from "../../../../components/onboarding/LightKurve/transitMethod";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 10;
    const currentPage = 1

    return (
        <CoreLayout>
            <Instructions />
            <ProgressSidebar credits={credits} currentPage={currentPage} />
        </CoreLayout>
    );
};