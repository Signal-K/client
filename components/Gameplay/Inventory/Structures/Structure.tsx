"use client"

// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import { SurveyorStructureModal, TelescopeReceiverStructureModal, TransitingTelescopeStructureModal } from "./Telescopes/Telescopes";
import { AnomalyStructureModal } from "../Automatons/Automaton";
import MiningStationPlaceable from "./Mining";
import { MeteorologyToolModal } from "./Telescopes/Terrestrial";
import { AutomatonUpgradeStructureModal } from "./Automatons/Automatons";
import { CameraAutomatonModule, CameraReceiverStation } from "./Automatons/Modules";
import LaunchpadButton from "./Vehicles/Launchpad";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
};

interface UserItem {
    id: number;
    item: number;
    owner: string;
    notes: string;
    quantity: number;
    anomaly: string;
};

interface Recipe {
    [key: string]: number;
}

interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    recipe?: Recipe;
  };

interface OwnedTelescope14 {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
    notes: string;
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

export const PlacedStructureSingle: React.FC<{ ownedItem: OwnedItem; structure: UserStructure; style: any; }> = ({ ownedItem, structure, style }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={`flex flex-col items-center justify-center p-4 ${style}`}>
            <img
                src={structure.icon_url}
                alt={structure.name}
                className="w-16 h-16 mb-2 cursor-pointer"
                onClick={openModal}
            />
            <p className="text-center text-sm font-medium">{structure.name}</p>

            {structure.id === 12 && (
                <TelescopeReceiverStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 14 && (
                <TransitingTelescopeStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 22 && (
                <AnomalyStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 30 && (
                <MiningStationPlaceable
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                    missionId={15}
                />
            )}
            {structure.id === 26 && (
                <MeteorologyToolModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 31 && (
                <AutomatonUpgradeStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 28 && (
                <CameraAutomatonModule
                    // If this component does not handle modal states directly, ensure it's implemented elsewhere
                    // If needed, you can pass other necessary props here
                />
            )}
            {structure.id === 32 && (
                <CameraReceiverStation
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 24 && (
                <SurveyorStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 33 && (
                <LaunchpadButton />
            )}
        </div>
    );
};

export const AllStructures = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 4; // Number of structures to show at a time

    useEffect(() => {
        async function fetchData() {
            if (session && activePlanet) {
                try {
                    const { data: ownedItemsData, error: ownedItemsError } = await supabase
                        .from('inventory')
                        .select('*')
                        .eq('owner', session.user.id)
                        .eq('anomaly', activePlanet.id);

                    if (ownedItemsError) {
                        throw ownedItemsError;
                    }

                    if (ownedItemsData) {
                        const itemIds = ownedItemsData.map(item => item.item);

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

    // Function to handle previous button click
    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    // Function to handle next button click
    const handleNext = () => {
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, userStructures.length - itemsPerPage));
    };

    return (
        <div className="p-4 relative">
            <h2 className="text-2xl font-semibold mb-4">Structures on your planet</h2>
            <div className="relative">
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {userStructures.slice(currentIndex, currentIndex + itemsPerPage).map(({ ownedItem, structure }, index) => (
                        <PlacedStructureSingle
                            key={structure.id}
                            ownedItem={ownedItem}
                            structure={structure}
                            style={{
                                position: 'relative',
                                transform: `translate(-50%, -50%)`,
                            }}
                        />
                    ))}
                </div>
                {currentIndex > 0 && (
                    <button
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
                        onClick={handlePrevious}
                    >
                        &#8592;
                    </button>
                )}
                {currentIndex + itemsPerPage < userStructures.length && (
                    <button
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
                        onClick={handleNext}
                    >
                        &#8594;
                    </button>
                )}
            </div>
        </div>
    );
};

export function CreateStructureWithItemRequirementinfo({ craftingItemId }: { craftingItemId: number }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userItems, setUserItems] = useState<UserItem[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [requiredResources, setRequiredResources] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUserItems() {
            if (!session) {
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("owner", session.user.id);

                if (error) {
                    throw error;
                }

                setUserItems(data || []);
            } catch (error: any) {
                console.error("Error fetching user items: ", error.message);
            }
        }

        async function fetchInventoryItems() {
            try {
                const response = await fetch("/api/gameplay/inventory");
                if (!response.ok) {
                    throw new Error("Failed to fetch inventory items from the API");
                }

                const data = await response.json();
                setInventoryItems(data);
            } catch (error: any) {
                console.error("Error fetching inventory items: ", error.message);
            }
        }

        fetchUserItems();
        fetchInventoryItems();
    }, [session, supabase]);

    const [craftableItem, setCraftableItem] = useState<InventoryItem | null>(null);

    type Recipe = Record<string, number>;

    const handleCraftStructure = async () => {
        setLoading(true);

        try {
            const craftItem = inventoryItems.find(item => item.id === craftingItemId);
            if (!craftItem) {
                return;
            }

            let canCraft = true;

            // Check if user has all the required resources
            const recipe: Recipe = craftItem.recipe || {}; // Ensure recipe is defined
            for (const [resourceId, requiredQuantity] of Object.entries(recipe)) {
                const userResource = userItems.find(item => item.item === parseInt(resourceId));
                if (!userResource || userResource.quantity < requiredQuantity) {
                    canCraft = false;
                    break; // Exit loop early if any resource is missing
                }
            }

            if (!canCraft) {
                alert("You do not have the required resources to craft this item.");
                return;
            }

            // Check if the structure already exists for the user in the current anomaly
            const structureExistsInAnomaly = userItems.some(
                item => Number(item.item) === craftingItemId && Number(item.anomaly) === Number(activePlanet?.id)
            );

            if (structureExistsInAnomaly) {
                alert("You already have this structure in the current anomaly.");
                return;
            }

            // Deduct required resources from user's inventory
            for (const [resourceId, requiredQuantity] of Object.entries(recipe)) {
                const userResource = userItems.find(item => item.item === parseInt(resourceId));
                if (userResource) {
                    const newQuantity = userResource.quantity - requiredQuantity;
                    if (newQuantity > 0) {
                        const { error } = await supabase
                            .from("inventory")
                            .update({ quantity: newQuantity })
                            .eq("id", userResource.id);

                        if (error) throw error;
                    } else {
                        const { error } = await supabase
                            .from("inventory")
                            .delete()
                            .eq("id", userResource.id);
                        if (error) throw error;
                    }
                }
            }

            // Add crafted item to user's inventory
            const { error } = await supabase
                .from("inventory")
                .insert([{ item: craftItem.id, owner: session?.user.id, quantity: 1, anomaly: activePlanet?.id }]);

            const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: 12,
            };

            const { error: missionError } = await supabase
                .from('missions')
                .insert([missionData]);

            if (missionError) {
                throw missionError;
            }

            if (error) {
                throw error;
            }

            alert("Item crafted successfully!");
        } catch (error: any) {
            console.error("Error crafting item: ", error.message);
            alert("An error occurred while crafting the item.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <p>Status: your aim is to craft {craftableItem?.name}</p>
            <div>
                <h3>Missing Resources:</h3>
                <ul>
                    {requiredResources.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
            <button
                onClick={handleCraftStructure}
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? "Crafting..." : "Craft Structure"}
            </button>
        </div>
    );
};

interface CheckInventoryProps {
    itemId: number;
}

export const CheckInventory: React.FC<CheckInventoryProps> = ({ itemId }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [ownedItem, setOwnedItem] = useState<OwnedItem | null>(null);
    const [structure, setStructure] = useState<UserStructure | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function fetchData() {
        if (session && activePlanet) {
            try {
                // Fetch owned items from supabase
                const { data: ownedItemsData, error: ownedItemsError } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .eq('item', itemId);

                if (ownedItemsError) {
                    throw ownedItemsError;
                }

                if (ownedItemsData && ownedItemsData.length > 0) {
                    const ownedItem = ownedItemsData[0];

                    // Fetch item details from the Next.js API
                    const response = await fetch('/api/gameplay/inventory');
                    if (!response.ok) {
                        throw new Error('Failed to fetch item details from the API');
                    }
                    const itemDetailsData: UserStructure[] = await response.json();

                    if (itemDetailsData) {
                        const structure = itemDetailsData.find(itemDetail => itemDetail.id === itemId);

                        if (structure) {
                            setOwnedItem(ownedItem);
                            setStructure(structure);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            };
        };
    };

    useEffect(() => {
        fetchData();
    }, [session, activePlanet, itemId, supabase]);

    const handleStructureClick = async (structure: UserStructure) => {
        setErrorMessage(null); // Reset error message

        if (session && activePlanet) {
            try {
                createInventoryUserEntry(structure);
            } catch (error: any) {
                console.error('Error:', error.message);
                setErrorMessage("An error occurred while creating the structure.");
                return;
            }
        }
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
                fetchData();
            } catch (error: any) {
                console.log(error.message);
                setErrorMessage("An error occurred while creating the inventory entry.");
            }
        }
    };

    if (!ownedItem || !structure) {
        return (
            <div>
                <button
                    onClick={async () => {
                        const response = await fetch('/api/gameplay/inventory');
                        const itemDetailsData: UserStructure[] = await response.json();
                        const structure = itemDetailsData.find(itemDetail => itemDetail.id === itemId);
                        if (structure) {
                            await handleStructureClick(structure);
                        }
                    }}
                    className="px-4 py-2 text-white bg-green-500 rounded-md focus:outline-none hover:bg-green-600"
                >
                    Create Structure
                </button>
                {errorMessage && (
                    <div className="mt-4 bg-red-500 text-white p-4 rounded-md">
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }

    return (
        <PlacedStructureSingle
            ownedItem={ownedItem}
            structure={structure}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%)`,
            }}
        />
    );
};