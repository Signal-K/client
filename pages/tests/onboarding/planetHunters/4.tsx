import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import Stitching from "../../../../components/onboarding/LightKurve/playing";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 40;
    const currentPage = 4

    return (
        <CoreLayout>
            <Stitching />
            <ProgressSidebar credits={credits} currentPage={currentPage} />
        </CoreLayout>
    );
};