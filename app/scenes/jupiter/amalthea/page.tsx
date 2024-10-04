"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/app/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/app/components/(structures)/PlanetStructures";

const AmaltheaView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToAmalthea = () => {
        updatePlanetLocation(51);
    };

    if (activePlanet?.id !== 51) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Amalthea.</p>
                    <button onClick={handleUpdateToAmalthea}>Switch to Amalthea</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={51} />
            <PlanetStructures />
        </div>
    );
};

export default AmaltheaView;