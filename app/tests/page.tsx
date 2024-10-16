"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";
import SwitchPlanet from "@/components/(scenes)/travel/SolarSystem";
import { MissionProgressionComponent } from "@/components/Missions/PathwayGuide";
import CompletedMissions from "@/components/Missions/CompletedMissions";

export default function TestPage() {
    return (
            <div className="1">
                {/* <MissionProgressionComponent /> */}
                <CompletedMissions />
            </div>
    );
};