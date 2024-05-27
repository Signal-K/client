// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, RadioGroup, Radio} from "@nextui-org/react";
import CreateBaseClassification from "@/components/Content/ClassificationForm";
import { useProfileContext } from "@/context/UserProfile";
import { SurveyorStructureModal, TelescopeReceiverStructureModal, TransitingTelescopeStructureModal } from "./Telescopes";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
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

interface PlacedStructureSingleProps {
    UserStructure: UserStructure;
};

interface StructureSelectProps {
    onStructureSelected: (structure: UserStructure) => void;
    activeSectorId: number;
};

export const PlacedStructureSingle: React.FC<{ ownedItem: OwnedItem; structure: UserStructure }> = ({ ownedItem, structure }) => {
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
            <p>{ownedItem.id}</p>
            {structure.id === 12 && (
                <TelescopeReceiverStructureModal isOpen={isModalOpen} onClose={closeModal} ownedItem={ownedItem} structure={structure} />
            )}
            {structure.id === 14 && (
                <TransitingTelescopeStructureModal isOpen={isModalOpen} onClose={closeModal} ownedItem={ownedItem} structure={structure} />
            )}
            {structure.id == 24 && (
                <SurveyorStructureModal isOpen={isModalOpen} ownedItem={ownedItem} structure={structure} onClose={closeModal} />
            )}
            {/* Add more conditionals here for other structure IDs and their respective modals */}
        </div>
    );
};

export const AllStructures: React.FC<{}> = () => {
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

    return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4">Your Structures</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {userStructures.map(({ ownedItem, structure }) => (
                    <PlacedStructureSingle key={structure.id} ownedItem={ownedItem} structure={structure} />
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

    const fetchUserSector = async () => {
        try {
            if (activePlanet?.id) {
                const { data, error } = await supabase
                    .from("basePlanetSectors")
                    .select('id')
                    .eq("anomaly", activePlanet.id)
                    .eq('owner', session?.user?.id)
                    .limit(1);

                if (data && data.length > 0) {
                    setActiveSector(data[0].id);
                }

                if (error) {
                    console.error(error.message);
                }
            }
        } catch (error: any) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        if (session) {
            fetchStructures();
        }
    }, [session, supabase]);

    const handleStructureClick = async (structure: UserStructure) => {
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
                    createInventoryUserEntry(structure);
                }
            } catch (error: any) {
                console.error('Error:', error.message);
            }
        }

        createInventoryUserEntry(structure);
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

                if (data) {
                    console.log('Inventory user entry created:', data);
                }

                if (error) {
                    console.log(error.message);
                }
            } catch (error: any) {
                console.log(error);
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
        </>
    );
};