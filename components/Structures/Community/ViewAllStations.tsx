"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import IndividualCommunityStation, { IndividualStationProps } from "./IndividualStation";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";

import "../../styles/Anims/StarterStructureAnimations.css";
import { CreateCommunityStation } from "../Build/MakeCommunityStation";

export default function StationsOnPlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [stationsOnPlanet, setStationsOnPlanet] = useState<IndividualStationProps[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [selectedStation, setSelectedStation] = useState<IndividualStationProps | null>(null);
    
    const [loading, setLoading] = useState(true);

    const fetchStructures = useCallback(async () => {
        if (!session || !activePlanet) {
            setLoading(false);
            return;
        };

        try {
            const response = await fetch('/api/gameplay/inventory');
            const itemData: StructureItemDetail[] = await response.json();
            const itemMap = new Map<number, StructureItemDetail>();
            itemData.forEach(item => {
                if (item.ItemCategory === "CommunityStation") {
                    itemMap.set(item.id, item);
                }
            });

            setItemDetails(itemMap);
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select("*")
                .eq('anomaly', activePlanet.id);

            if (inventoryError) {
                throw inventoryError;
            };

            const stations = new Map<number, InventoryStructureItem>();
            inventoryData.forEach(structure => {
                const itemDetail = itemMap.get(structure.item);
                if (itemDetail && itemDetail.locationType === 'Surface' && !stations.has(structure.item)) {
                    stations.set(structure.item, structure);
                };
            });

            const uniqueStations = Array.from(stations.values());
            // setStationsOnPlanet(uniqueStations || []);
        } catch (error: any) {
            console.error("Error fetching structures", error);
        } finally {
            setLoading(false);
        };
    }, [session, activePlanet, supabase, itemDetails]);

    return (
        <></>
    );
};