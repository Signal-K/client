// A component to show the structures on the user's active planet

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

interface StructureSingleProps {
    userStructure: UserStructure;
};

export interface UserStructure {
    id: string;
    item: number;
    name: string;
    icon_url: string;
    description: string;
    // Function (what is executed upon click)
};

interface StructureSelectProps {
    onStructureSelected: (structure: UserStructure) => void;
    activeSectorId: number;
};

interface Structure {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    item: number;
}

// View structures
export const PlacedStructures = ({ }) => { // This currently allows us to view all structures on a planet, not sure about clicking into the individual ones...
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructures, setUserStructures] = useState<UserStructure[]>([]);

    useEffect(() => {
        const fetchUserStructures = async () => {
            if (!activePlanet || !session) return;

            try {
                const { data: userItems, error: userItemsError } = await supabase
                    .from("inventoryUSERS")
                    .select('item, "planetSector"')
                    .eq('owner', session.user.id);

                if (userItemsError) {
                    console.error(userItemsError.message);
                    return;
                }

                const structureIds = userItems
                    .filter((item) => item.item)
                    .map((item) => item.item);

                const { data: structures, error: structuresError } = await supabase
                    .from("inventoryITEMS")
                    .select('id, name, description, icon_url')
                    .in('id', structureIds)
                    .eq('ItemCategory', 'Structure');

                if (structuresError) {
                    console.error(structuresError.message);
                    return;
                }

                const structuredData: UserStructure[] = structures.map((item: any) => ({
                    id: item.id,
                    item: item.item, // Ensure the 'item' property is present
                    name: item.name,
                    icon_url: item.icon_url,
                    description: item.description
                }));

                setUserStructures(structuredData);
            } catch (error: any) {
                console.error("Error fetching user structures:", error.message);
            }
        };

        fetchUserStructures();
    }, [activePlanet, session, supabase]);

    return (
        <div>
            <h2>Your Placed Structures</h2>
            <ul>
                {userStructures.map((structure) => (
                    <li key={structure.id}>
                        <img src={structure.icon_url} alt={structure.name} />
                        <div>
                            <h3>{structure.name}</h3>
                            <p>{structure.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Create structures
export const StructureSingle: React.FC<StructureSelectProps> = ({ onStructureSelected }) => { // <StructureSingleProps> = ({ userStructure }) => { /#/ -> activeSectorId
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
                    item: item.item, // Ensure the 'item' property is present
                    name: item.name,
                    icon_url: item.icon_url,
                    description: item.description
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
        if (session && activePlanet?.id) {
            try {
                const { data, error } = await supabase
                    .from('inventoryUSERS')
                    .upsert([
                        {
                            item: structure.id,
                            owner: session?.user?.id,
                            quantity: 1,
                            planetSector: activeSector,
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