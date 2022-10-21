// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, RadioGroup, Radio} from "@nextui-org/react";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
};

export interface UserStructure {
    id: string;
    item: number;
    name: string;
    icon_url: string;
    description: string;
    // Function (what is executed upon click)
};

interface PlacedStructureSingleProps {
    UserStructure: UserStructure;
}

interface StructureSelectProps {
    onStructureSelected: (structure: UserStructure) => void;
    activeSectorId: number;
};

// View a single structure
interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
};

export const PlacedStructureSingle: React.FC<{ ownedItem: OwnedItem; structure: UserStructure }> = ({ ownedItem, structure }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <img src={structure.icon_url} alt={structure.name} className="w-14 h-14 mb-2" />
            <p>{ownedItem.id}</p>
            {structure.id == "12" && (
                <TelescopeReceiverStructureModal ownedItem={ownedItem} structure={structure} />
            )}
        </div>
    );
};

const TelescopeReceiverStructureModal: React.FC<{ ownedItem: OwnedItem; structure: UserStructure }> = ({ ownedItem, structure }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [activeModules, setActiveModules] = useState<string[]>([]);
    const [inactiveModules, setInactiveModules] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (session && activePlanet) {
            getActiveModules();
        };
    }, [session, activePlanet]);

    const getActiveModules = async () => {
        try {
            const { data, error } = await supabase
                .from('inventoryUSERS')
                .select('item')
                .eq('owner', session?.user?.id)
                .eq('basePlanet', activePlanet?.id)
                .in('item', [14, 29]);
    
            if (error) {
                throw error;
            }
    
            const activeModuleIds = data.map((module: any) => String(module.item)); 
            setActiveModules(activeModuleIds);
            setInactiveModules(["14", "29"].filter(id => !activeModuleIds.includes(id))); 
        } catch (error: any) {
            console.error('Error fetching active telescope modules:', error.message);
        };
    };    

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
    };


    const handleModuleClick = async (moduleId: string) => {
        try {
            const { data, error } = await supabase
                .from('inventoryUSERS')
                .upsert([
                    {
                        item: moduleId,
                        owner: session?.user?.id,
                        quantity: 1,
                        time_of_deploy: new Date().toISOString,
                        notes: "Structure",
                        basePlanet: activePlanet?.id,
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

    return (
        <div className="flex flex-col gap-2">
            <Button onClick={handleOpen} className="max-w-fit">
                Open Modal
            </Button>
            <Modal isOpen={isOpen} placement="bottom-center" onClose={handleClose}>
                    <ModalContent>
                        <div className="bg-indigo-500">
                            <ModalHeader>{structure.name}</ModalHeader>
                            <ModalBody>
                                <p>
                                </p>
                                <div>
                                    {inactiveModules.map(moduleId => (
                                        <div key={moduleId} className="flex items-center justify-between mb-2">
                                            <span>Module {moduleId}</span>
                                            <Button color="primary" onClick={() => handleModuleClick(moduleId)}>Create</Button>
                                        </div>
                                    ))}
                                    {activeModules.map(moduleId => (
                                        <div key={moduleId} className="flex items-center justify-between mb-2">
                                            <span>Module {moduleId}</span>
                                            <span>Unlocked</span>
                                        </div>
                                    ))}
                                </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onClick={handleClose}>
                                Close
                            </Button>
                            <Button color="primary" onClick={handleClose}>
                                Action
                            </Button>
                        </ModalFooter>
                    </div>
                </ModalContent>
            </Modal>
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
                    const { data: ownedItemsData, error: ownedItemsError } = await supabase
                        .from('inventoryUSERS')
                        .select('*')
                        .eq("owner", session.user.id)
                        .eq("basePlanet", activePlanet.id)
                        .eq("notes", "Structure");

                    if (ownedItemsError) {
                        throw ownedItemsError;
                    }

                    if (ownedItemsData) {
                        const itemIds = ownedItemsData.map(item => item.item);
                        const { data: itemDetailsData, error: itemDetailsError } = await supabase
                            .from('inventoryITEMS')
                            .select('*')
                            .in('id', itemIds)
                            .eq('ItemCategory', 'Structure');

                        if (itemDetailsError) {
                            throw itemDetailsError;
                        }

                        if (itemDetailsData) {
                            const structuresData: { ownedItem: OwnedItem; structure: UserStructure }[] = itemDetailsData.map(itemDetail => {
                                const ownedItem = ownedItemsData.find(ownedItem => ownedItem.item === itemDetail.id);
                                const structure: UserStructure = {
                                    id: itemDetail.id,
                                    item: itemDetail.id,
                                    name: itemDetail.name,
                                    icon_url: itemDetail.icon_url,
                                    description: itemDetail.description
                                };
                                return { ownedItem: ownedItem || { id: "", item: "", quantity: 0, sector: "" }, structure };
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
export const CreateStructure: React.FC<StructureSelectProps> = ({ onStructureSelected }) => { // <StructureSingleProps> = ({ userStructure }) => { /#/ -> activeSectorId
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [structures, setStructures] = useState<UserStructure[]>([]);
    const [activeSector, setActiveSector] = useState<Number>();
    const [isCalloutOpen, setIsCalloutOpen] = useState(false);

    const fetchStructures = async () => {
        try {
            const { data, error } = await supabase
                .from('inventoryITEMS')
                .select('id, name, description, icon_url')
                .eq('ItemCategory', 'Structure');

            if (data) {
                const structuredData: UserStructure[] = data.map((item: any) => ({
                    id: item.id,
                    item: item.item,
                    name: item.name,
                    icon_url: item.icon_url,
                    description: item.description,
                }));
                setStructures(structuredData);
            };

            if (error) {
                console.error(error.message);
            }
        } catch (error: any) {
            console.error(error.message);
        }
    };
    
    const fetchUserSector = async () => { // Temporary function to determine where to put the structure. We haven't got this determined yet from a narrative standpoint
        try {
            if (activePlanet?.id) { // Ensure activePlanet?.id is valid
                const { data, error } = await supabase
                    .from("basePlanetSectors")
                    .select('id')
                    .eq("anomaly", activePlanet.id) // Use activePlanet.id directly
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
            fetchUserSector();
            fetchStructures();
            console.log(activeSector);
        };
    }, [session, supabase]);

    const handleStructureClick = async (structure: UserStructure) => {
        if (session && activeSector == 50) {
                try {
                const payload = JSON.stringify({
                    user_id: session?.user?.id,
                    sector_id: activeSector,
                    structure_id: structure.id,
                });

                const response = await fetch('http://papyrus-production.up.railway.app/craft_structure', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Ideally this should also send a log request to supabase
                    },
                    body: payload,
                });

                const data = await response.json();
                console.log('Response from Flask upon attempt to create structure entry: ', data);

                if (data.status === 'proceed') {
                    createInventoryUserEntry(structure);
                };
            } catch (error: any) {
                console.error('Error: ', error.message);
            };
        }

        createInventoryUserEntry(structure); // Since initially we aren't going through papyrus api
        onStructureSelected(structure);
        setIsCalloutOpen(false);
    };

    const createInventoryUserEntry = async (structure: UserStructure) => {
        if (session && activeSector && activePlanet?.id) {
            try {
                const { data, error } = await supabase
                    .from('inventoryUSERS')
                    .upsert([
                        {
                            item: structure.id,
                            owner: session?.user?.id,
                            quantity: 1,
                            planetSector: activeSector,
                            time_of_deploy: new Date().toISOString,
                            notes: "Structure",
                            basePlanet: activePlanet.id,
                        },
                    ]);

                if (data) {
                    console.log('Inventory user entry created: ', data);
                };

                if (error) {
                    console.log(error.message);
                };
            } catch (error: any) {
                console.log(error);
            };
        };
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