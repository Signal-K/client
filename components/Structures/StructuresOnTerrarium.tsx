'use client';

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TerrariumInventoryStructureItem, StructureItemDetail  } from "@/types/Items";
import IndividualStructure, { IndividualStructureProps} from "./IndividualStructure";
import { StructuresConfig } from "@/constants/Structures/Properties";

interface Props {
    location: number;
};

export default function StructuresOnTerrarium({
    location
}: Props) { 
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userStructuresOnTerrarium, setUserStructuresOnTerrarium] = useState<TerrariumInventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
    
    const [loading, setLoading] = useState(true);

    const fetchStructures = useCallback(async () => {
        if (!session) {
            setLoading(false);
            return;
        };

        try {
            const response = await fetch('/api/gameplay/inventory');
            const itemsData: StructureItemDetail[] = await response.json();
            const itemMap = new Map<number, StructureItemDetail>();
            itemsData.forEach(item => {
                if (item.ItemCategory === 'Structure') {
                    itemMap.set(item.id, item);
                };
            });

            setItemDetails(itemMap);

            const {
                data: inventoryData,
                error: inventoryError,
            } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session.user.id)
                .eq("terrarium", location)

            if (inventoryError) {
                throw inventoryError;
                setLoading(false);
            };

            const uniqueStructuresMap = new Map<number, TerrariumInventoryStructureItem>();
            inventoryData?.forEach(( structure: TerrariumInventoryStructureItem ) => {
                const itemDetail = itemMap.get(structure.item);
                if (itemDetail && !uniqueStructuresMap.has(structure.item)) {
                    uniqueStructuresMap.set(structure.item, structure);
                };
            });

            const uniqueStructures = Array.from(uniqueStructuresMap.values());
            setUserStructuresOnTerrarium(uniqueStructures || []);
            } catch (error: any) {
                console.error('Error fetching data: ', error);
                setLoading(false);
            } finally {
                setLoading(false);
            };
    }, [session, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [session]);

    const handleIconClick = ( itemId: number, inventoryId: number ) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const config = StructuresConfig[itemDetail.id] || {};
            setSelectedStructure({
                name: itemDetail.name,
                imageSrc: itemDetail.icon_url,
                title: `Structure ID: ${inventoryId}`,
                labels: config.labels || [],
                actions: config.actions || [],
                buttons: config.buttons.map(button => ({
                  ...button,
                  showInNoModal: true,
                })),
                structureId: inventoryId
            });
        };
    };

    const handleClose = useCallback(() => {
        setSelectedStructure(null);
    }, []);

    if (loading) {
        return (
            <div>
                <p>
                    Loading...
                </p>
            </div>
        );
    };

    return (
        <div className="relative">
            <div className={`/grid px-11 grid-cols-4 gap-1 gap-y-3 relative ${userStructuresOnTerrarium.length === 1 ? 'justify-center' : 'justify-between'}`}>
                {userStructuresOnTerrarium.map(( structure, index ) => {
                    const itemDetail = itemDetails.get(structure.item);
                    return itemDetail ? (
                        <div
                            key={structure.id}
                            className={`flex flex-col items-center space-y-2 ${index === 1 ? 'justify-self-center' : ''}`}
                        >
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className={`w-24 h-24 object-cover cursor-pointer ${structure.item ? 'bouncing-structure' : 'moving-structure'}`}
                                onClick={() => handleIconClick(itemDetail.id, structure.id)}
                            />
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
};