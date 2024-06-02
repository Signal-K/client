"use client"

// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import CreateBaseClassification from "@/Classifications/ClassificationForm";
import { useProfileContext } from "@/context/UserProfile";
import { SurveyorStructureModal, TelescopeReceiverStructureModal, TransitingTelescopeStructureModal } from "./Telescopes";
import { AnomalyStructureModal } from "../Automatons/Automaton";

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

export const PlacedStructureSingle: React.FC<{ ownedItem: OwnedItem; structure: UserStructure; style: any; }> = ({ ownedItem, structure, style }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <img src={structure.icon_url} alt={structure.name} className="w-14 h-14 mb-2 cursor-pointer" onClick={openModal} />
            <p>{ownedItem.id} {ownedItem.anomaly}</p>
            {structure.id === 12 && (
                <TelescopeReceiverStructureModal isOpen={isModalOpen} onClose={closeModal} ownedItem={ownedItem} structure={structure} />
            )}
            {structure.id === 14 && (
                <TransitingTelescopeStructureModal isOpen={isModalOpen} onClose={closeModal} ownedItem={ownedItem} structure={structure} />
            )}
            {structure.id == 24 && (
                <SurveyorStructureModal isOpen={isModalOpen} ownedItem={ownedItem} structure={structure} onClose={closeModal} />
            )}
            {structure.id === 22 && (
                <AnomalyStructureModal isOpen={isModalOpen} onClose={closeModal} ownedItem={ownedItem} structure={structure} />
            )}
        </div>
    );
};

export const AllStructures = () => {
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
                        .eq('notes', 'Structure');

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

    // Function to generate random positions
    const getRandomPosition = () => {
        const maxPosition = 80; // Adjust as needed
        const minPosition = 20; // Adjust as needed
        const randomPosition = Math.floor(Math.random() * (maxPosition - minPosition + 1) + minPosition);
        return `${randomPosition}%`;
    };

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
                            top: getRandomPosition(),
                            left: getRandomPosition(),
                            transform: `translate(-50%, -50%)`, // Adjust as needed
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

// Create structures
export const CreateStructure: React.FC<StructureSelectProps> = ({ onStructureSelected }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [structures, setStructures] = useState<UserStructure[]>([]);
    const [activeSector, setActiveSector] = useState<number | undefined>();
    const [isCalloutOpen, setIsCalloutOpen] = useState(false);
    const [userInventory, setUserInventory] = useState<OwnedItem[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchStructures = async () => {
        try {
            const response = await fetch('/api/gameplay/inventory');
            if (!response.ok) {
                throw new Error('Failed to fetch item details from the API');
            }
            const data: UserStructure[] = await response.json();
            const structuredData: UserStructure[] = data.filter(item => item.ItemCategory === 'Structure');
            setStructures(structuredData);
        } catch (error: any) {
            console.error('Error fetching structures:', error.message);
        }
    };

    const fetchUserInventory = async () => {
        try {
            if (session?.user?.id && activePlanet?.id) {
                const { data, error } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id);

                if (error) {
                    throw error;
                }

                setUserInventory(data || []);
            }
        } catch (error: any) {
            console.error('Error fetching user inventory:', error.message);
        }
    };

    useEffect(() => {
        if (session) {
            fetchStructures();
            fetchUserInventory();
        }
    }, [session, supabase]);

    const handleStructureClick = async (structure: UserStructure) => {
        setErrorMessage(null); // Reset error message

        console.log('User Inventory:', userInventory);
        console.log('Checking structure:', structure);

        const structureExists = userInventory.some(item => item.item === structure.id.toString());

        if (structureExists) {
            setErrorMessage("You already have this structure here.");
            return;
        }

        if (structure.id === 14 || structure.id === 24) {
            const prerequisiteStructure = userInventory.some(item => Number(item.item) === 12);
            if (!prerequisiteStructure) {
                setErrorMessage("You need to have structure 12 to create this structure.");
                return;
            }
        }

        if (session && activeSector === 50) {
            try {
                const payload = JSON.stringify({
                    user_id: session?.user?.id,
                    structure_id: structure.id,
                });

                const response = await fetch('http://papyrus-production.up.railway.app/craft_structure', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: payload,
                });

                const data = await response.json();
                console.log('Response from Flask upon attempt to create structure entry:', data);

                if (data.status === 'proceed') {
                    await createInventoryUserEntry(structure);
                } else {
                    setErrorMessage(data.message || "Unable to create structure.");
                    return;
                }
            } catch (error: any) {
                console.error('Error:', error.message);
                setErrorMessage("An error occurred while creating the structure.");
                return;
            }
        } else {
            await createInventoryUserEntry(structure);
        }
        
        onStructureSelected(structure);
        setIsCalloutOpen(false);
    };

    const createInventoryUserEntry = async (structure: UserStructure) => {
        if (session && activePlanet?.id) {
            try {
                const { data, error } = await supabase
                    .from('inventory')
                    .upsert([
                        {
                            item: structure.id,
                            owner: session?.user?.id,
                            quantity: 1,
                            time_of_deploy: new Date().toISOString(),
                            notes: "Structure",
                            anomaly: activePlanet.id,
                        },
                    ]);

                if (error) {
                    throw error;
                }

                console.log('Inventory user entry created:', data);
                // Refetch the user inventory after creating a structure
                fetchUserInventory();
            } catch (error: any) {
                console.log(error.message);
                setErrorMessage("An error occurred while creating the inventory entry.");
            }
        }
    };

    return (
        <>
            <center>
                <div className="relative inline-block text-center pl-10">
                    <button
                        type="button"
                        className="px-4 py-2 text-white bg-blue-500 rounded-md focus:outline-none hover:bg-blue-600"
                        onClick={() => setIsCalloutOpen(!isCalloutOpen)}
                    >
                        Build structure
                    </button>

                    {isCalloutOpen && (
                        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                                {structures.map((structure) => (
                                    <div
                                        key={structure.id}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleStructureClick(structure)}
                                    >
                                        <div className="flex items-center space-x-2 pl-8">
                                            <img src={structure.icon_url} alt={structure.name} className="w-8 h-8" />
                                            <span className="font-bold">{structure.name}</span>
                                        </div>
                                        <span className="text-gray-500">{structure.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </center>
            {errorMessage && (
                <div className="absolute top-0 left-0 right-0 mt-4 mx-auto w-1/2 bg-red-500 text-white p-4 rounded-md">
                    {errorMessage}
                </div>
            )}
        </>
    );
};
