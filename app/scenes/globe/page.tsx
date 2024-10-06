"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem } from "@/types/Items";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import StructuresOnPlanet from "./Structures";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";

const GlobeView: React.FC = () => {
    const { activePlanet, updatePlanetLocation } = useActivePlanet();
    const handleUpdatetToGlobeAnomalyLocation = () => {
        updatePlanetLocation(35);
    };

    if (activePlanet?.id !== 35) {
        updatePlanetLocation(35);
    };

    return (
        <div className="relative min-h-screen">
            <GlobeStructures />
        </div>
    );
};

export default GlobeView;

const GlobeStructures: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);

    const handleStructuresFetch = (
        surface: InventoryStructureItem[]
    ) => {
        setSurfaceStructures(surface);
    };

    const fetchStructures = useCallback(async () => {
        if (!session || !activePlanet?.id) {
            return;
        };

        try {
            const { data: inventoryData, error } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session.user.id)
                .eq("anomaly", activePlanet.id || 35 || 69)
                .not('item', 'lte', 100)

            if (error) {
                throw error;
            };

            const surface = inventoryData.filter((item) => item.locationType === 'Surface');
            handleStructuresFetch(surface);
        } catch (error: any) {
            console.error('Error fetching surface structures: ', error.message);
        };
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    return (
        <EarthViewLayout>
            <div className="w-full">
                <div className="flex flex-row space-y-4">
                    
                </div>
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className="py-2">
                    
                </div>
            </div>
            <div className="w-full">
                <center><StructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
            </div>
        </EarthViewLayout>
    );
};