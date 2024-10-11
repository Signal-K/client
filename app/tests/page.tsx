"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";
import SwitchPlanet from "@/components/(scenes)/travel/SolarSystem";

export default function TestPage() {
    return (
        <StarnetLayout>
            <div className="1">
                {/* <ExoplanetTransitHunter /> */}
                <SwitchPlanet />
            </div>
        </StarnetLayout>
    );
};