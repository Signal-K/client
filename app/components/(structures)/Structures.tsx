"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
}

export default function StructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    useEffect(() => {
        async function fetchStructures() {
            if (!session?.user?.id || !activePlanet?.id) {
                return;
            }
    
            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .not('item', 'is', null);
    
                if (inventoryError) throw inventoryError;
    
                // Fetch item details for "Structure" items from the API
                const response = await fetch('/api/gameplay/inventory');
                const itemsData: StructureItemDetail[] = await response.json();
    
                // Categorize structures based on their locationType
                const orbitalStructures: InventoryStructureItem[] = [];
                const atmosphereStructures: InventoryStructureItem[] = [];
                const surfaceStructures: InventoryStructureItem[] = [];
    
                inventoryData?.forEach((structure: InventoryStructureItem) => {
                    const itemDetail = itemsData.find(item => item.id === structure.item);
    
                    // Ensure itemDetail is assigned
                    if (itemDetail) {
                        structure.itemDetail = itemDetail; // Assign itemDetail to the structure
                    }
    
                    if (itemDetail?.ItemCategory === 'Structure') {
                        if (itemDetail.locationType === 'Orbit') {
                            orbitalStructures.push(structure);
                        } else if (itemDetail.locationType === 'Atmosphere') {
                            atmosphereStructures.push(structure);
                        } else if (itemDetail.locationType === 'Surface') {
                            surfaceStructures.push(structure);
                        }
                    }
                });
    
                onStructuresFetch(orbitalStructures, atmosphereStructures, surfaceStructures);
    
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    
        fetchStructures();
    }, [session?.user?.id, activePlanet?.id, supabase, onStructuresFetch]);
    

    return null;
}