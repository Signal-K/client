"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/content/(anomalies)/(planets)/PlanetStructures";

const VenusView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToVenus = () => { 
        updatePlanetLocation(20);
    };

    if (activePlanet?.id !== 20) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Venus.</p>
                    <button onClick={handleUpdateToVenus}>Switch to Venus</button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
    <img
      className="absolute inset-0 w-full h-full object-cover"
      src="/assets/Backdrops/Venus.png"
    />
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={20} />
            <PlanetStructures />
        </div>
        </div>
    );
};

export default VenusView;