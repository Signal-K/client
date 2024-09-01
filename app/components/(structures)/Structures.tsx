"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import IndividualStructure from "./IndividualStructure";
import { StructuresConfig } from "@/constants/Structures/Properties";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
};

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
    }, [session?.user?.id, activePlanet?.id, supabase]);
    

    return null;
};

interface IndividualStructureProps {
    name: string;
    title: string;
    labels: { text: string; variant: "default" | "secondary" | "destructive" }[];
    imageSrc: string;
    actions: {
      icon: React.ReactNode;
      text: string;
    }[];
    buttons: {
      icon: React.ReactNode;
      text: string;
    }[];
    onActionClick?: (action: string) => void;
    onClose?: () => void;
};

export function AllStructures() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);

    useEffect(() => {
        async function fetchStructures() {
            if (!session?.user?.id || !activePlanet?.id) {
                setLoading(false);
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

                setUserStructuresOnPlanet(inventoryData || []);

                const response = await fetch('/api/gameplay/inventory');
                const itemsData: StructureItemDetail[] = await response.json();

                const itemMap = new Map<number, StructureItemDetail>();
                itemsData.forEach(item => {
                    if (item.ItemCategory === 'Structure') {
                        itemMap.set(item.id, item);
                    };
                });

                setItemDetails(itemMap);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            };
        };

        fetchStructures();
    }, [session?.user?.id, activePlanet?.id, supabase]);

    const handleIconClick = (itemId: number) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const config = StructuresConfig[itemDetail.id];
            setSelectedStructure({
                ...config,
                imageSrc: itemDetail.icon_url,
                name: itemDetail.name,
            });
        }
    };

    const handleClose = () => {
        setSelectedStructure(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-row space-y-4">
            {userStructuresOnPlanet.map((structure) => {
                const itemDetail = itemDetails.get(structure.item);
                return itemDetail ? (
                    <div key={structure.id} className="flex items-center space-x-4">
                        <img 
                            src={itemDetail.icon_url} 
                            alt={itemDetail.name} 
                            className="w-16 h-16 object-cover cursor-pointer" 
                            onClick={() => handleIconClick(itemDetail.id)} 
                        />
                    </div>
                ) : null;
            })}

            {selectedStructure && (
                <IndividualStructure
                    name={selectedStructure.name}
                    title={selectedStructure.title}
                    labels={selectedStructure.labels}
                    imageSrc={selectedStructure.imageSrc}
                    actions={selectedStructure.actions}
                    buttons={selectedStructure.buttons}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}