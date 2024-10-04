"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/app/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/app/components/(structures)/PlanetStructures";

const PlutoView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToPluto = () => { 
        updatePlanetLocation(90);
    };

    if (activePlanet?.id !== 90) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Pluto.</p>
                    <button onClick={handleUpdateToPluto}>Switch to Pluto</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={90} />
            <PlanetStructures />
        </div>
    );
};

export default PlutoView;