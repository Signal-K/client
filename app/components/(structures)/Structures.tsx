"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";

export default function StructuresOnPlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStructures() {
            if (!session?.user?.id || !activePlanet?.id) {
                setLoading(false);
                return;
            };

            try {
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .not('item', 'is', null);

                if (inventoryError) throw inventoryError;

                setUserStructuresOnPlanet(inventoryData || []);

                // Fetch item details for "Structure" items from the API
                const response = await fetch('/api/gameplay/inventory');
                const itemsData: StructureItemDetail[] = await response.json();

                const itemMap = new Map<number, StructureItemDetail>();
                itemsData.forEach(item => {
                    if (item.ItemCategory === 'Structure') {
                        itemMap.set(item.id, item);
                    }
                });

                setItemDetails(itemMap);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStructures();
    }, [session?.user?.id, activePlanet?.id, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-row space-y-4">
            {userStructuresOnPlanet.map((structure) => {
                const itemDetail = itemDetails.get(structure.item);
                return itemDetail ? (
                    <div key={structure.id} className="flex items-center space-x-4">
                        <img src={itemDetail.icon_url} alt={itemDetail.name} className="w-16 h-16 object-cover" />
                    </div>
                ) : null;
            })}
        </div>
    );
};