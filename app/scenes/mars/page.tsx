"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

import { EarthViewLayout } from "@/app/components/(scenes)/planetScene/layout";
import InitialisePlanet from "@/app/components/(scenes)/planetScene/initialisePlanet";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/app/components/(structures)/Structures";
import { InventoryStructureItem } from "@/types/Items";
import { PlanetarySystem } from "@/app/components/(scenes)/planetScene/orbitals/system";
import AllAutomatonsOnActivePlanet from "@/app/components/(vehicles)/(automatons)/AllAutomatons";

const MarsView: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet, updatePlanetLocation } = useActivePlanet();
    const handleUpdateToMars = () => {
        updatePlanetLocation(40);
    };

    if (activePlanet?.id !== 40) {
        return (
        <div className="min-h-screen w-full flex flex-col">
            {/* <img
              className="absolute inset-0 w-full h-full object-cover"
              src="/assets/Backdrops/Mars.png"
            /> */}
            <div className="bg-black/90">
                <p>Current planet is not Mars.</p>
                <button onClick={handleUpdateToMars}>Switch to Mars</button>
            </div>
          </div>
        );
    };

    return (
        <div className="relative min-h-screen">
            <InitialisePlanet planetId={40} />
            <MarsStructures />
        </div>
    );
};

export default MarsView;

const MarsStructures: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [orbitalStructures, setOrbitalStructures] = useState<InventoryStructureItem[]>([]);
    const [atmosphereStructures, setAtmosphereStructures] = useState<InventoryStructureItem[]>([]);
    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);

    const handleStructuresFetch = (
        orbital: InventoryStructureItem[],
        atmosphere: InventoryStructureItem[],
        surface: InventoryStructureItem[]
    ) => {
        setOrbitalStructures(orbital);
        setAtmosphereStructures(atmosphere);
        setSurfaceStructures(surface);
    };

    return (
        <EarthViewLayout>
            <div className="w-full">
                <div className="flex flex-row space-y-4"></div>
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                    <center>
                        <OrbitalStructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
                    </center>
                </div>
            </div>
            <div className="w-full">
                <div className="py-2">
                    <center>
                        <AtmosphereStructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
                    </center>
                </div>
            </div>
            <div className="w-full">
                <center>
                    <StructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
                </center>
            </div>
            <div className="relative flex-1">
                <AllAutomatonsOnActivePlanet />
            </div>
        </EarthViewLayout>
    );
};