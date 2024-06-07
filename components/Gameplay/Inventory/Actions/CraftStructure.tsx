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
                            notes: `Created by crafting ${structureId}`,
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
                // Here you should define the setErrorMessage function
                // and use it to set an error message for the user
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
        }
    };

    useEffect(() => {
        fetchUserInventory();
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
}
