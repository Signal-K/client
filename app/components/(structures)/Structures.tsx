"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import IndividualStructure from "./IndividualStructure";
import { StructuresConfig } from "@/constants/Structures/Properties";
import { LockIcon } from "lucide-react";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
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
        showInNoModal: boolean;
        icon: React.ReactNode;
        text: string;
        dynamicComponent?: React.ReactNode;
        sizePercentage?: number;
    }[];
    onActionClick?: (action: string) => void;
    onClose?: () => void;
}

export default function StructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
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
                    .not('item', 'lte', 100); // Exclude items <= 100 (for test/archival)

                if (inventoryError) throw inventoryError;

                setUserStructuresOnPlanet(inventoryData || []);

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

    const handleIconClick = async (itemId: number) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('configuration')
                .eq('item', itemId)
                .eq('owner', session?.user.id)
                .eq('anomaly', activePlanet.id)
                .single();
    
            if (inventoryError) {
                console.error('Error fetching inventory data:', inventoryError);
                return;
            }
    
            const config = StructuresConfig[itemDetail.id] || {};
            const uses = (inventoryData?.configuration?.Uses ?? 0) as number;
            const updatedButtons = config.buttons.map(button => ({
                ...button,
                showInNoModal: true, // Default value
                icon: uses <= 0 
                    ? <LockIcon className="w-6 h-6 text-[#FFE3BA]" /> 
                    : button.icon,
                text: uses <= 0 
                    ? button.text.includes('locked') ? button.text : `${button.text} - locked` 
                    : button.text,
                disabled: uses <= 0
            }));
    
            setSelectedStructure({
                name: itemDetail.name,
                imageSrc: itemDetail.icon_url,
                title: config.title || '',
                labels: config.labels || [],
                actions: config.actions || [],
                buttons: updatedButtons,
            });
        }
    };
    
    const handleClose = () => {
        setTimeout(() => {
            setSelectedStructure(null);
        }, 100);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
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
            </div>

            {selectedStructure && (
                <IndividualStructure
                    key={selectedStructure.name}
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
      showInNoModal: boolean;
      icon: React.ReactNode;
      text: string;
      dynamicComponent?: React.ReactNode;
      sizePercentage?: number;
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

    const handleIconClick = (itemId: number) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const config = StructuresConfig[itemDetail.id] || {};
            setSelectedStructure({
                name: itemDetail.name,
                imageSrc: itemDetail.icon_url,
                title: config.title || '', 
                labels: config.labels || [], 
                actions: config.actions || [],
                buttons: config.buttons.map(button => ({
                    ...button,
                    showInNoModal: true // Default value
                })), 
            });
        }
    }; 

    const handleClose = () => {
        setTimeout(() => {
            setSelectedStructure(null);
        }, 100);
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
                    key={selectedStructure.name}
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
};