"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/components/(anomalies)/(planets)/PlanetStructures";

const SaturnView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToSaturn = () => {
        updatePlanetLocation(60);
    };

    if (activePlanet?.id !== 60) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Saturn.</p>
                    <button onClick={handleUpdateToSaturn}>Switch to Saturn</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={60} />
            <PlanetStructures />
        </div>
    );
};

export default SaturnView;