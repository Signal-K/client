"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/components/(anomalies)/(planets)/PlanetStructures";

const EnceladusView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToEnceladus = () => { 
        updatePlanetLocation(61);
    };

    if (activePlanet?.id !== 61) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Enceladus.</p>
                    <button onClick={handleUpdateToEnceladus}>Switch to Enceladus</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={61} />
            <PlanetStructures />
        </div>
    );
};

export default EnceladusView;