"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/components/(anomalies)/(planets)/PlanetStructures";

const NeptuneView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToNeptune = () => { 
        updatePlanetLocation(80);
    };

    if (activePlanet?.id !== 80) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Neptune.</p>
                    <button onClick={handleUpdateToNeptune}>Switch to Neptune</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={80} />
            <PlanetStructures />
        </div>
    );
};

export default NeptuneView;