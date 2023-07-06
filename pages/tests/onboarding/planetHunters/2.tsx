import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import IntroToLightkurve from "../../../../components/onboarding/LightKurve/introToLightkurve";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";
import ExoPlanetDetective from "../../../../components/onboarding/LightKurve/_Introduction";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 20;
    const currentPage = 2

    return (
        <CoreLayout>
            <ExoPlanetDetective />
            {/* <ProgressSidebar currentPage={currentPage} credits={credits} /> */}
        </CoreLayout>
    );
};