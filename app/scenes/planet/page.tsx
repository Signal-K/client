"use client";

import React, { useState, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout from "@/app/components/(scenes)/planetScene/layout";
import StructuresOnPlanet from "@/app/components/(structures)/Structures";
import { InventoryStructureItem } from "@/types/Items";
import ChapterOneIntroduction from "@/app/components/(scenes)/chapters/one/ChapterOneIntro";

export default function PlanetViewPage() {
    const { activePlanet } = useActivePlanet();

    const [orbitalStructures, setOrbitalStructures] = useState<InventoryStructureItem[]>([]);
    const [atmosphereStructures, setAtmosphereStructures] = useState<InventoryStructureItem[]>([]);
    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);

    const handleStructuresFetch = useCallback(
        (orbital: InventoryStructureItem[], atmosphere: InventoryStructureItem[], surface: InventoryStructureItem[]) => {
            setOrbitalStructures(orbital);
            setAtmosphereStructures(atmosphere);
            setSurfaceStructures(surface);
        },
        []
    );    

    return (
        <PlanetViewLayout>
            <div>
                Planet id: {activePlanet?.id}
                <br />
                Orbital Structures
            </div>
            <div>
                Atmosphere Structures
            </div>
            <div>
                <StructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
            </div>
            <div className="bg-white/50 h-full">
                <ChapterOneIntroduction />
            </div>
        </PlanetViewLayout>
    );
}

/*

<PlanetViewLayout>
            <div>
                Planet id: {activePlanet?.id}
                <br />
                Orbital & Orbital structures
                {/* <div className="flex flex-row space-y-4">
                    {orbitalStructures.map((structure) => (
                        <div key={structure.id} className="flex items-center space-x-4">
                            <img src={structure.itemDetail?.icon_url} alt={structure.itemDetail?.name} className="w-16 h-16 object-cover" />
                        </div>
                    ))}
                </div> 
                </div>
                <div>
                    Atmosphere Structures
                    {/* <div className="flex flex-row space-y-4">
                        {atmosphereStructures.map((structure) => (
                            <div key={structure.id} className="flex items-center space-x-4">
                                <img src={structure.itemDetail?.icon_url} alt={structure.itemDetail?.name} className="w-16 h-16 object-cover" />
                            </div>
                        ))}
                    </div> 
                </div>
                <div>
                    Surface Structures
                    {/* <div className="flex flex-row space-y-4">
                        {surfaceStructures.map((structure) => (
                            <div key={structure.id} className="flex items-center space-x-4">
                                <img src={structure.itemDetail?.icon_url} alt={structure.itemDetail?.name} className="w-16 h-16 object-cover" />
                            </div>
                        ))}
                    </div> 
                    <StructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
                </div>
                <div className="bg-white/50 h-full">
                    {/* Automatons 
                    <ChapterOneIntroduction />
                </div>
            </PlanetViewLayout>
*/