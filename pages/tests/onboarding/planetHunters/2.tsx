import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import IntroToLightkurve from "../../../../components/onboarding/LightKurve/introToLightkurve";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 20;
    const currentPage = 2

    return (
        <CoreLayout>
            <IntroToLightkurve />
            <ProgressSidebar currentPage={currentPage} credits={credits} />
        </CoreLayout>
    );
};