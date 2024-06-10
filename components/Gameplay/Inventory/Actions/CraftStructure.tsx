"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function CraftStructure({ structureId }: { structureId: number }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
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
                setRecipeItems(items);
                setCraftable(isCraftable);
            } catch (error: any) {
                console.error("Error fetching recipe:", error.message);
            }
        }

        fetchRecipe();
    }, [structureId, userInventory]);

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
        };
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
            };

            setUserTelescopeId(data[0].id);
        } catch (error: any) {
            console.log(error);
        };
    }

    const [structureTableId, setSTID] = useState(0);

    const craftStructure = async () => {
        if (session && activePlanet?.id && craftable) {
            try {
                const { data, error } = await supabase
                    .from('inventory')
                    .upsert([
                        {
                            item: structureId,
                            owner: session?.user?.id,
                            quantity: 1,
                            time_of_deploy: new Date().toISOString(),
                            parentItem: userTelescopeId,
                            notes: `Created by crafting ${structureId} for mission 7`,
                            anomaly: activePlanet.id,
                        },
                    ]);
    
                if (error) {
                    throw error;
                }
    
                handleMissionComplete();
    
                // Wait for the newly created row to be fetched
                await fetchNewlyCreatedRow();
    
                // Now that we have the correct structureTableId, update the notes
                await updateNotes();
    
                // Refetch the user inventory after creating a structure
                fetchUserInventory();
            } catch (error: any) {
                console.log(error.message);
            }
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
            <h2>Recipe for Structure {structureId}</h2>
            <ul>
                {recipeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            {craftable && (
                <button onClick={craftStructure}>Craft Structure</button>
            )}
        </div>
    );
};