"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/content/(anomalies)/(planets)/PlanetStructures";

const MercuryView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToMercury = () => { 
        updatePlanetLocation(10);
    };

    if (activePlanet?.id !== 10) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Mercury.</p>
                    <button onClick={handleUpdateToMercury}>Switch to Mercury</button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Mercury.png"
      />
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={10} />
            <PlanetStructures />
        </div>
        </div>
    );
}; 

export default MercuryView;