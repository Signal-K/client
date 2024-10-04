"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/app/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/app/components/(structures)/PlanetStructures";

const MirandaView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToMiranda = () => { 
        updatePlanetLocation(71);
    };

    if (activePlanet?.id !== 71) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Miranda.</p>
                    <button onClick={handleUpdateToMiranda}>Switch to Miranda</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={71} />
            <PlanetStructures />
        </div>
    );
};

export default MirandaView;