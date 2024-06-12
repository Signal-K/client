"use client";

// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import CreateBaseClassification, { CreateFirstBaseClassification } from "@/Classifications/ClassificationForm";
import { useProfileContext } from "@/context/UserProfile";
import PlanetData from "@/components/Content/Anomalies/PlanetData";

interface OwnedItem { 
    id: string;
    item: string;
    quantity: number;
    sector: string;
    notes?: string;
};

interface UserStructure {
    id: number;
    item: number; 
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

export const SurveyorStructureModal: React.FC<TransitingTelescopeStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const [isActionDone, setIsActionDone] = useState(false);

    const handleActionClick = () => {
        // Implement action logic here
        setIsActionDone(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{structure.name}</h2>
                    <button className="btn btn-square btn-outline" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <PlanetData /> {/* This should actually search for the data where the structure is located, not the user's active planet */}
                </div>
            </div>
        </div>
    );
};

interface TransitingTelescopeStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
};

export const TransitingTelescopeStructureModal: React.FC<TransitingTelescopeStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const [isActionDone, setIsActionDone] = useState(false);
    const { activePlanet } = useActivePlanet();

    const handleActionClick = () => {
        // Implement action logic here
        setIsActionDone(true);
    };

    if (!isOpen) return null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/citiAnomalies/${activePlanet?.id}/ActivePlanet.png`;

    return (
        // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <>
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{structure.name}</h2>
                    <button className="btn btn-square btn-outline" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <img src={structure.icon_url} alt={structure.name} className="w-32 h-32 mb-2" />
                    <p>ID: {ownedItem.id}</p>
                    <p>{ownedItem.notes}</p>
                    <p>Description: {structure.description}</p>
                    <div className="mt-4">
                    <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} />
                    {ownedItem.notes === "Created by crafting 14 for mission 7" ? (
                        <CreateFirstBaseClassification assetMentioned={imageUrl} />
                    ) : (
                        <CreateBaseClassification assetMentioned={imageUrl} />
                    )}
                        {isActionDone && <p className="mt-2 text-green-500">Action Completed</p>}
                    </div>
                </div>
            </div>
        </>
        // {/* </div> */}
    );
};

interface TelescopeReceiverStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
};

export const TelescopeReceiverStructureModal: React.FC<TelescopeReceiverStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [activeModules, setActiveModules] = useState<string[]>([]);
    const [inactiveModules, setInactiveModules] = useState<string[]>([]);

    useEffect(() => {
        if (session && activePlanet && isOpen) {
            getActiveModules();
        }
    }, [session, activePlanet, isOpen]);

    const getActiveModules = async () => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select('item')
                .eq('owner', session?.user?.id)
                .eq('anomaly', activePlanet?.id)
                .in('item', [14, 29]);

            if (error) {
                throw error;
            }

            const activeModuleIds = data.map((module: any) => String(module.item));
            setActiveModules(activeModuleIds);
            setInactiveModules(["14", "29"].filter(id => !activeModuleIds.includes(id)));
        } catch (error: any) {
            console.error('Error fetching active telescope modules:', error.message);
        }
    };

    const handleModuleClick = async (moduleId: string) => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .upsert([
                    {
                        item: moduleId,
                        owner: session?.user?.id,
                        quantity: 1,
                        time_of_deploy: new Date().toISOString(),
                        notes: "Structure",
                        anomaly: activePlanet?.id,
                    },
                ]);

            if (error) {
                throw error;
            }

            console.log('Module created successfully:', data);
            // Refresh active modules after creating the new module
            getActiveModules();
        } catch (error: any) {
            console.error('Error creating module:', error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{structure.name}</h2>
                    <button className="btn btn-square btn-outline" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <img src={structure.icon_url} alt={structure.name} className="w-32 h-32 mb-2" />
                    <p>ID: {ownedItem.id}</p>
                    <p>Description: {structure.description}</p>
                    <div>
                        {inactiveModules.map(moduleId => (
                            <div key={moduleId} className="flex items-center justify-between mb-2">
                                <span>Module {moduleId}</span>
                                <button className="btn btn-primary" onClick={() => handleModuleClick(moduleId)}>Create</button>
                            </div>
                        ))}
                        {activeModules.map(moduleId => (
                            <div key={moduleId} className="flex items-center justify-between mb-2">
                                <span>Module {moduleId}</span>
                                <span>Unlocked</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};