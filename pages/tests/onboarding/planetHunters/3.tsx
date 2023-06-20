import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import Stitching from "../../../../components/onboarding/LightKurve/stitching";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 30;
    const currentPage = 3

    return (
        <CoreLayout>
            <Stitching />
            <ProgressSidebar credits={credits} currentPage={currentPage} />
        </CoreLayout>
    );
};