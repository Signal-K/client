"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import IndividualStructure from "./IndividualStructure";
import { StructuresConfig } from "@/constants/Structures/Properties";
import { LockIcon } from "lucide-react";
import AnimatedPointer from "../(scenes)/chapters/helpers/animatedPointer";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
}

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
    structureId?: number;  // Added structureId as optional
    onActionClick?: (action: string) => void;
    onClose?: () => void;
};

import { CitizenScienceModule } from "@/app/api/citizen/modules/route";

export default function StructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
    const [activeMission, setActiveMission] = useState<number | null>(null); 
    const [missionStructureId, setMissionStructureId] = useState<number | null>(null); 

    const fetchStructures = useCallback(async () => {
        if (!session?.user?.id || !activePlanet?.id) {
            setLoading(false);
            return;
        }

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('activeMission')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;

            setActiveMission(profileData.activeMission);

            const modulesResponse = await fetch('/api/citizen/modules');
            const modulesData: CitizenScienceModule[] = await modulesResponse.json();

            const activeModule = modulesData.find(module => module.starterMission === profileData.activeMission);
            if (activeModule) {
                setMissionStructureId(activeModule.structure);
            }

            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id)
                .not('item', 'lte', 100);

            if (inventoryError) throw inventoryError;

            const uniqueStructuresMap = new Map<number, InventoryStructureItem>();
            inventoryData.forEach(structure => {
                if (!uniqueStructuresMap.has(structure.item)) {
                    uniqueStructuresMap.set(structure.item, structure);
                }
            });

            const uniqueStructures = Array.from(uniqueStructuresMap.values());
            setUserStructuresOnPlanet(uniqueStructures || []);

            const response = await fetch('/api/gameplay/inventory');
            const itemsData = await response.json();

            const itemMap = new Map<number, StructureItemDetail>();
            itemsData.forEach((item: StructureItemDetail) => {
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
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    const handleIconClick = (itemId: number, inventoryId: number) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const config = StructuresConfig[itemDetail.id] || {};
            setSelectedStructure({
                name: itemDetail.name,
                imageSrc: itemDetail.icon_url,
                title: `Structure ID: ${inventoryId}`, // Pass inventory id here
                labels: config.labels || [],
                actions: config.actions || [],
                buttons: config.buttons.map(button => ({
                    ...button,
                    showInNoModal: true,
                })),
                structureId: inventoryId // Pass structureId here
            });
        }
    };    

    const handleClose = useCallback(() => {
        setSelectedStructure(null);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const activeStructure = userStructuresOnPlanet.find(structure => structure.item === missionStructureId);
    const otherStructures = userStructuresOnPlanet.filter(structure => structure.item !== missionStructureId);

    return (
        <div>
            <div className="flex flex-row space-y-4 relative">
                {otherStructures.map((structure) => {
                    const itemDetail = itemDetails.get(structure.item);

                    return itemDetail ? (
                        <div key={structure.id} className="flex items-center space-x-4 relative">
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() => handleIconClick(itemDetail.id, structure.id)} // Pass both arguments
                            />
                        </div>
                    ) : null;
                })}

                {activeStructure && (
                    <div key={activeStructure.id} className="flex items-center space-x-4 relative">
                        <img
                            src={itemDetails.get(activeStructure.item)?.icon_url}
                            alt={itemDetails.get(activeStructure.item)?.name}
                            className="w-16 h-16 object-cover cursor-pointer"
                            onClick={() => handleIconClick(activeStructure.item, activeStructure.id)} // Pass both arguments
                        />
                        <AnimatedPointer
                            position="top"
                            arrowDirection="left"
                            offset={-10}
                            size={40}
                        />
                    </div>
                )}
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
                    structureId={selectedStructure.structureId} // Fix structureId
                    onClose={handleClose}
                />
            )}
        </div>
    );
}

export function StarterMissionStructures() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [starterMissionStructures, setStarterMissionStructures] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);

    const fetchStructures = useCallback(async () => {
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
                .not('item', 'lte', 100);

            if (inventoryError) throw inventoryError;

            const uniqueStructures = Array.from(new Map(
                inventoryData
                    .filter((structure: InventoryStructureItem) => {
                        const config = structure.configuration as { "Created for"?: string };
                        return config["Created for"] === "Starter mission";
                    })
                    .map((structure: InventoryStructureItem) => [structure.item, structure])
            ).values());

            setStarterMissionStructures(uniqueStructures);

            const response = await fetch('/api/gameplay/inventory');
            const itemsData = await response.json();

            const itemMap = new Map<number, StructureItemDetail>();
            itemsData.forEach((item: StructureItemDetail) => {
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
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    const handleIconClick = (itemId: number, structureId: number) => {
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
                    showInNoModal: true,
                })),
                structureId: structureId // Pass structureId here
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
        <div>
            <h2>Starter Mission Structures</h2>
            <div className="flex flex-row space-y-4 relative">
                {starterMissionStructures.map((structure) => {
                    const itemDetail = itemDetails.get(structure.item);
                    return itemDetail ? (
                        <div key={structure.id} className="flex items-center space-x-4 relative">
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() => handleIconClick(itemDetail.id, structure.id)} // Pass both arguments
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
                    structureId={selectedStructure.structureId} // Pass the structureId prop
                    onClose={handleClose}
                />
            )}
        </div>
    );
};

export function ActiveMissionStructures() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
    const [activeMission, setActiveMission] = useState<number | null>(null);
    const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

    const fetchStructures = useCallback(async () => {
        if (!session?.user?.id || !activePlanet?.id) {
            setLoading(false);
            return;
        }

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('activeMission')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;

            setActiveMission(profileData.activeMission);

            const modulesResponse = await fetch('/api/citizen/modules');
            const modulesData = await modulesResponse.json();
            const activeModule = modulesData.find((module: { starterMission: any; }) => module.starterMission === profileData.activeMission);
            if (activeModule) {
                setMissionStructureId(activeModule.structure);
            }

            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id)
                .not('item', 'lte', 100);

            if (inventoryError) throw inventoryError;

            const uniqueStructures = Array.from(new Map(
                inventoryData
                    .filter((structure: InventoryStructureItem) => structure.item === missionStructureId)
                    .map((structure: InventoryStructureItem) => [structure.item, structure])
            ).values());

            setUserStructuresOnPlanet(uniqueStructures);

            const response = await fetch('/api/gameplay/inventory');
            const itemsData = await response.json();

            const itemMap = new Map<number, StructureItemDetail>();
            itemsData.forEach((item: StructureItemDetail) => {
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
    }, [session?.user?.id, activePlanet?.id, supabase, missionStructureId]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    useEffect(() => {
        if (activeMission && missionStructureId) {
            // Automatically open the modal for the first structure with the mission structure ID
            const firstStructure = userStructuresOnPlanet.find(structure => structure.item === missionStructureId);
            if (firstStructure) {
                const itemDetail = itemDetails.get(firstStructure.item);
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
                            showInNoModal: true,
                        })),
                        structureId: firstStructure.id // Pass structureId here
                    });
                }
            }
        }
    }, [activeMission, missionStructureId, userStructuresOnPlanet, itemDetails]);

    const handleIconClick = (itemId: number, structureId: number) => {
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
                    showInNoModal: true,
                })),
                structureId: structureId // Pass structureId here
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
        <div>
            <h2>Active Mission Structures</h2>
            <div className="flex flex-row space-y-4 relative">
                {userStructuresOnPlanet.map((structure) => {
                    const itemDetail = itemDetails.get(structure.item);
                    return itemDetail ? (
                        <div key={structure.id} className="flex items-center space-x-4 relative">
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() => handleIconClick(itemDetail.id, structure.id)} // Pass both arguments
                            />
                            {structure.item === missionStructureId && (
                                <AnimatedPointer
                                    position="top"
                                    arrowDirection="left"
                                    offset={-10}
                                    size={20}
                                />
                            )}
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
                    structureId={selectedStructure.structureId} // Pass the structureId prop
                    onClose={handleClose}
                />
            )}
        </div>
    );
}


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