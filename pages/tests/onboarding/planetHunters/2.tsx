import React from "react";
import CoreLayout from "../../../../components/Core/Layout";
import IntroToLightkurve from "../../../../components/onboarding/LightKurve/introToLightkurve";
import ProgressSidebar from "../../../../components/onboarding/blocks/ProgressSidebar";
import ExoPlanetDetective from "../../../../components/onboarding/LightKurve/_Introduction";
import PlanetHuntersOnboardingPage2 from "../../../../components/onboarding/LightKurve/_PlanetHunters";

export default function PlanetHuntersOnboardingPage1 () {
    const credits = 20;
    const currentPage = 2

    return (
        <CoreLayout>
            <PlanetHuntersOnboardingPage2 />
            <ProgressSidebar currentPage={currentPage} credits={credits} />
        </CoreLayout>
    );
};