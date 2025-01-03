"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/content/(anomalies)/(planets)/PlanetStructures";

const JupiterView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToJupiter = () => { 
        updatePlanetLocation(50);
    };

    if (activePlanet?.id !== 50) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Jupiter.</p>
                    <button onClick={handleUpdateToJupiter}>Switch to Jupiter</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={50} />
            <PlanetStructures />
        </div>
    );
};

export default JupiterView;