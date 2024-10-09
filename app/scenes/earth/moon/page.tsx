"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/content/(anomalies)/(planets)/PlanetStructures";

const MoonView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToMoon = () => {
        updatePlanetLocation(11);
    };

    if (activePlanet?.id !== 11) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Moon.</p>
                    <button onClick={handleUpdateToMoon}>Switch to Moon</button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
    <img
      className="absolute inset-0 w-full h-full object-cover"
      src="/assets/Backdrops/Moon.png"
    />
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={11} />
            <PlanetStructures />
        </div>
        </div>
    );
};

export default MoonView;