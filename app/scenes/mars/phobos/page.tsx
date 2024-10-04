"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import InitialisePlanet from "@/app/components/(scenes)/planetScene/initialisePlanet";
import PlanetStructures from "@/app/components/(structures)/PlanetStructures";

const PhobosView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const handleUpdateToPhobos = () => {
        updatePlanetLocation(41);
    };

    if (activePlanet?.id !== 41) {
        return (
            <div className="min-h-screen w-full flex flex-col">
                <div className="bg-black/90">
                    <p>Current planet is not Phobos.</p>
                    <button onClick={handleUpdateToPhobos}>Switch to Phobos</button>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={41} />
            <PlanetStructures />
        </div>
    );
};

export default PhobosView;