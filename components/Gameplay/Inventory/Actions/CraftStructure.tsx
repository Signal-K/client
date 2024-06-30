"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function CraftStructure({ structureId }: { structureId: number }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [structureName, setStructureName] = useState<string>("");
    const [recipeItems, setRecipeItems] = useState<string[]>([]);
    const [craftable, setCraftable] = useState(false);
    const [userInventory, setUserInventory] = useState<any[]>([]);
    const [createdInventoryId, setCreatedInventoryId] = useState<number | null>(null);

    const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 7,
        configuration: null,
        rewarded_items: [13],
    };

    const inventoryData = {
        item: missionData.rewarded_items[0],
        owner: session?.user?.id,
        quantity: 1,
        notes: "Created upon the completion of mission 7",
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: activePlanet?.id,
    };

    useEffect(() => {
        async function fetchRecipe() {
            try {
                const response = await fetch(`/api/gameplay/inventory`);
                if (!response.ok) {
                    throw new Error(`Error fetching inventory data: ${response.status} ${response.statusText}`);
                }
                const inventoryItems = await response.json();

                const structure = inventoryItems.find((item: { id: number }) => item.id === structureId);
                if (!structure || !structure.recipe) {
                    throw new Error("Structure or recipe not found.");
                }

                setStructureName(structure.name);

                const items: string[] = [];
                let isCraftable = true;
                for (const itemId in structure.recipe) {
                    const quantity = structure.recipe[itemId];
                    const itemName = inventoryItems.find((item: { id: number }) => item.id === parseInt(itemId, 10))?.name;
                    if (itemName) {
                        items.push(`${quantity} ${itemName}`);
                        // Check if the user has enough of each required item
                        const userItem = userInventory.find((item: { item: number; quantity: number }) =>
                            item.item === parseInt(itemId, 10) &&
                            item.quantity >= quantity
                        );
                        if (!userItem) {
                            isCraftable = false;
                            break;
                        }
                    }
                }

                // Additional check for structureId 32
                if (structureId === 32) {
                    const hasRequiredItem = userInventory.some(
                        (item) => item.item === 28 && item.quantity > 0 && item.anomaly === activePlanet?.id
                    );
                    if (!hasRequiredItem) {
                        isCraftable = false;
                    }
                }

                setRecipeItems(items);
                setCraftable(isCraftable);
            } catch (error: any) {
                console.error("Error fetching recipe:", error.message);
            }
        }

        fetchRecipe();
    }, [structureId, userInventory, activePlanet]);

    const handleMissionComplete = async () => {
        try {
            const { data: newMission, error: newMissionError } = await supabase
                .from("missions")
                .insert([missionData]);

            const { data: newInventoryEntry, error: newInventoryEntryError } = await supabase
                .from("inventory")
                .insert([inventoryData]);
        } catch (error: any) {
            console.error(error);
        }
    };

    const [userTelescopeId, setUserTelescopeId] = useState(0);
    const fetchUserTelescope = async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session?.user?.id)
                .eq("item", 12)
                .eq("anomaly", activePlanet?.id);

            if (error) {
                throw error;
            }

            setUserTelescopeId(data[0].id);
        } catch (error: any) {
            console.log(error);
        };
    };

    const [notes, setNotes] = useState('');
    const [structureTableId, setSTID] = useState(0);

    const craftStructure = async () => {
        if (session && activePlanet?.id && craftable) {
            try {
                // Fetch the parent item first to ensure it exists
                const { data: parentData, error: parentError } = await supabase
                    .from('inventory')
                    .select('id')
                    .eq('owner', session?.user?.id)
                    .eq('item', 12) // Assuming 12 is the ID for the telescope
                    .eq('anomaly', activePlanet?.id);

                if (parentError || !parentData || parentData.length === 0) {
                    throw new Error('Parent item does not exist');
                };

                const parentItemId = parentData[0].id;

                if (structureId == 14) {
                    setNotes(`Created by crafting ${structureId} for mission 7`,)
                };

                if (structureId == 30) {
                    const missionData = {
                        user: session?.user?.id,
                        time_of_completion: new Date().toISOString(),
                        mission: 10,
                    };


                    const { error: missionError } = await supabase
                        .from('missions')
                        .insert([missionData]);
                    if (missionError) {
                        throw missionError;
                    };
                };

                const { data, error } = await supabase
                    .from('inventory')
                    .insert([
                        {
                            item: structureId,
                            owner: session?.user?.id,
                            quantity: 1,
                            time_of_deploy: new Date().toISOString(),
                            parentItem: parentItemId,
                            notes: notes,
                            anomaly: activePlanet.id,
                        },
                    ])
                    .select();

                if (error) {
                    throw error;
                };

                handleMissionComplete();

                // Wait for the newly created row to be fetched
                await fetchNewlyCreatedRow();

                // Now that we have the correct structureTableId, update the notes
                await updateNotes();

                // Refetch the user inventory after creating a structure
                fetchUserInventory();
            } catch (error: any) {
                console.log(error.message);
            };
        };
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
                };

                setUserInventory(data || []);
            };
        } catch (error: any) {
            console.error('Error fetching user inventory:', error.message);
        };
    };

    const fetchNewlyCreatedRow = async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session?.user?.id)
                .eq("item", structureId)
                .eq("anomaly", activePlanet?.id);

            if (error) {
                throw error;
            };

            setSTID(data[0].id);
        } catch (error: any) {
            console.log(error);
        };
    };

    const updateNotes = async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .update({ notes: `Created by crafting ${structureTableId}` })
                .eq("id", structureTableId);
        } catch (error) {
            console.log(error);
        };
    };

    useEffect(() => {
        fetchUserInventory();
        fetchUserTelescope();
    }, [session, activePlanet]);

    return (
        <div>
            <h2>Recipe for {structureName}</h2>
            <ul>
                {recipeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            {craftable && (
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 py-2" onClick={craftStructure}>Craft Structure</button>
            )}
        </div>
    );
};