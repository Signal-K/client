"use client";

import React, { useEffect, useState } from "react";
import PlanetSelector from "../components/(scenes)/planetScene/SelectPlanet";
import { cloudClassificationConfig, planetClassificationConfig, roverImgClassificationConfig } from "../components/(create)/(classifications)/FormConfigurations";
import { SunspotDetectorTutorial } from "../components/(structures)/Telescopes/Sunspots";

export default function TestPage() {
    return (
        <div>
            <PlanetSelector />
            <SunspotDetectorTutorial anomalyId="101266259" /> 
        </div>
    );
};