"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useRefresh } from "@/context/RefreshState";

import { UserStructure } from "@/types/Structures";
import { OwnedItem } from "@/types/Items";

export default function MyStructures() {
    const supabase = useSupabaseClient();
    const session = useSession(); 

    const { activePlanet } = useActivePlanet();

    const { refresh } = useRefresh(); // This should really be replaced in favour of electric/local-first sql

    const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 3; // Number of structures to show at a time - changes per planet layout

    useEffect(() => {
        async function fetchData() {
            if (session && activePlanet) {
                try {
                    const { data: ownedItemsData, error: ownedItemsError } = await supabase
                        .from('inventory')
                        .select('*')
                        .eq('owner', session.user.id)
                        .eq('anomaly', activePlanet.id);
    
                    if (ownedItemsError) {
                        throw ownedItemsError;
                    };
    
                    if (ownedItemsData) {
                        const itemIds = ownedItemsData.map(item => item.item);
    
                        const response = await fetch('/api/gameplay/inventory');
                        if (!response.ok) {
                            throw new Error('Failed to fetch item details from the API');
                        };

                        const itemDetailsData: UserStructure[] = await response.json();
    
                        if (itemDetailsData) {
                            const structuresData: { ownedItem: OwnedItem; structure: UserStructure }[] = itemDetailsData
                                .filter(itemDetail => itemDetail.ItemCategory === 'Structure' && itemIds.includes(itemDetail.id))
                                .map(itemDetail => {
                                    const ownedItem = ownedItemsData.find(ownedItem => ownedItem.item === itemDetail.id);
                                    const structure: UserStructure = {
                                        id: itemDetail.id,
                                        name: itemDetail.name,
                                        icon_url: itemDetail.icon_url,
                                        description: itemDetail.description,
                                        cost: itemDetail.cost,
                                        ItemCategory: itemDetail.ItemCategory,
                                        parentItem: itemDetail.parentItem,
                                        itemLevel: itemDetail.itemLevel,
                                        item: 0
                                    };

                                    return { ownedItem: ownedItem || { id: '', item: '', quantity: 0, sector: '' }, structure };
                                });

                            setUserStructures(structuresData);
                        };
                    };
                } catch (error) {

                console.error('Error fetching data:', error);
                };
            };
        };
    
        fetchData();
      }, [session, activePlanet, supabase, refresh]);

    return (
        <></>
    )
}