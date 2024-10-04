"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/app/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/app/components/(structures)/PlanetStructures";

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
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={10} />
            <PlanetStructures />
        </div>
    );
};

export default MercuryView;