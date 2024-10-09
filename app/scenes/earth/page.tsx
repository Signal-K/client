"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import { InventoryStructureItem } from "@/types/Items";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import InitialiseChapterOneUser from "@/components/(scenes)/chapters/one/InitialiseUser";

const EarthView: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  return ( 
    <div className="relative min-h-screen">
        <EarthStructures />
    </div>
  );
};

export default EarthView;

const EarthStructures: React.FC = () => {
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

    const fetchStructures = useCallback(async () => {
        if (!session?.user?.id || !activePlanet?.id) return;

        try {
            const { data: inventoryData, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id)
                .not('item', 'lte', 100);

            if (error) throw error;

            const orbital = inventoryData.filter((item) => item.locationType === 'Orbital');
            const atmosphere = inventoryData.filter((item) => item.locationType === 'Atmosphere');
            const surface = inventoryData.filter((item) => item.locationType === 'Surface');

            handleStructuresFetch(orbital, atmosphere, surface);
        } catch (error) {
            console.error('Error fetching structures:', error);
        };
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    return (
        <EarthViewLayout>
            <div className="w-full">
                <div className="flex flex-row space-y-4">
                {orbitalStructures.map((structure) => (
                            <div
                                key={structure.id}
                                className="relative flex items-center space-x-4"
                            >
                                <img
                                    src={structure.itemDetail?.icon_url}
                                    alt={structure.itemDetail?.name}
                                    className="w-16 h-16 object-cover"
                                />
                            </div>
                        ))}
                </div>
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                    <center><OrbitalStructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
                </div>
            </div>
            <div className="w-full">
                <div className="py-2">
                    <center><AtmosphereStructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
                </div>
            </div>
            <div className="w-full">
                <center><StructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>  
            </div>
            <div className="relative flex-1">
                <AllAutomatonsOnActivePlanet />
            </div>
        </EarthViewLayout>
    );
};