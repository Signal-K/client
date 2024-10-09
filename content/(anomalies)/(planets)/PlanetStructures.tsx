"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem } from "@/types/Items";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import StructuresOnPlanet, { OrbitalStructuresOnPlanet, AtmosphereStructuresOnPlanet } from "@/components/Structures/Structures";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";

const PlanetStructures: React.FC = () => {
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

export default PlanetStructures;