"use client";

import { DiscoveryCardsByUserAndAnomaly } from "@/components/Projects/(classifications)/Collections/ByAnomaly";
import SwitchPlanet from "@/components/(scenes)/travel/SolarSystem";
import AllClassifications from "@/content/Starnet/YourClassifications";
import React from "react";

export default function TestPage() {
    return (
        <div>
            <SwitchPlanet />
            <DiscoveryCardsByUserAndAnomaly anomalyId={40} />
        </div>
    );
};