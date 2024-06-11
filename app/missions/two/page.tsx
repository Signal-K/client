"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Layout from "@/components/Layout";
import { DeleteMineralsAtEndOfMission } from "@/components/Gameplay/Inventory/Counters";
import { useActivePlanet } from "@/context/ActivePlanet";
import { AllAutomatons, SingleAutomaton, SingleAutomatonCraftItem } from "@/components/Gameplay/Inventory/Automatons/Automaton";

import { Card, Carousel } from "@material-tailwind/react";
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

export default function MissionGroupTwo() {
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
                        .eq()

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
                        };
                    };
                } catch (error) {
                    console.error('Error fetching data:', error);
                };
            };
        };

        fetchData();
    }, [session, activePlanet, supabase]);

    return (
        <Layout bg={false}>
            <div className="flex justify-center items-center p-5">
                <Carousel className="rounded-xl " placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <Card placeholder="flex justify-center items-center w-full h-full p-5 rounded-xl bg-gray-100 shadow-lg" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <center><DeleteMineralsAtEndOfMission /></center>
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <SingleAutomatonCraftItem craftItemId={30} />
                    </Card>
                    <Card placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        <PlacedStructureSingle
                            key={structure.id}
                            ownedItem={ownedItem}

                        />
                    </Card>
                </Carousel>
            </div>
        </Layout>
    );
};