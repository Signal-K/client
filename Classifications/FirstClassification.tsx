"use client"

import React, { useEffect, useState } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlacedStructureSingle } from "@/components/Gameplay/Inventory/Structures/Structure";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
};

interface UserStructure {
    id: number;
    item: number; // Assuming this should be a number
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

interface StructureSelectProps {
    onStructureSelected: (structure: UserStructure) => void;
    activeSectorId: number;
};

export default function FirstClassification() {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <AllStructures />
    );
};

const AllStructures = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (session && activePlanet) {
                try {
                    // Fetch owned items from supabase
                    const { data: ownedItemsData, error: ownedItemsError } = await supabase
                        .from('inventory')
                        .select('*')
                        .eq('owner', session.user.id)
                        .eq('anomaly', activePlanet.id)
                        .eq('notes', 'Created by crafting 14 for mission 7');

                    if (ownedItemsError) {
                        throw ownedItemsError;
                    }

                    if (ownedItemsData) {
                        const itemIds = ownedItemsData.map(item => item.item);

                        // Fetch item details from the Next.js API
                        const response = await fetch('/api/gameplay/inventory');
                        if (!response.ok) {
                            throw new Error('Failed to fetch item details from the API');
                        }
                        const itemDetailsData: UserStructure[] = await response.json();

                        if (itemDetailsData) {
                            const structuresData: { ownedItem: OwnedItem; structure: UserStructure }[] = itemDetailsData
                                .filter(itemDetail => itemDetail.ItemCategory === 'Structure' && itemIds.includes(itemDetail.id))
                                .map(itemDetail => {
                                    const ownedItem = ownedItemsData.find(ownedItem => ownedItem.item === itemDetail.id);
                                    const structure: UserStructure = {
                                        id: itemDetail.id,
                                        item: itemDetail.id,
                                        name: itemDetail.name,
                                        icon_url: itemDetail.icon_url,
                                        description: itemDetail.description,
                                        cost: itemDetail.cost,
                                        ItemCategory: itemDetail.ItemCategory,
                                        parentItem: itemDetail.parentItem,
                                        itemLevel: itemDetail.itemLevel,
                                    };
                                    return { ownedItem: ownedItem || { id: '', item: '', quantity: 0, sector: '' }, structure };
                                });
                            setUserStructures(structuresData);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        }

        fetchData();
    }, [session, activePlanet, supabase]);

    return (
        <div className="p-4 relative">
            <h2 className="text-2xl font-semibold mb-4">Your Structures</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {userStructures.map(({ ownedItem, structure }, index) => (
                    <PlacedStructureSingle
                        key={structure.id}
                        ownedItem={ownedItem}
                        structure={structure}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%)`, // Adjust as needed
                        }}
                    />
                ))}
            </div>
        </div>
    );
};