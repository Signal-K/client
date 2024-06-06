"use client"

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function CraftStructure({ structureId }: { structureId: number }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [recipeItems, setRecipeItems] = useState<string[]>([]);

    useEffect(() => {
        async function fetchRecipe() {
            try {
                const response = await fetch(`/api/gameplay/inventory`);
                if (!response.ok) {
                    throw new Error(`Error fetching inventory data: ${response.status} ${response.statusText}`);
                }
                const inventoryItems = await response.json();
                
                const structure = inventoryItems.find((item: { id: number; }) => item.id === structureId);
                if (!structure || !structure.recipe) {
                    throw new Error("Structure or recipe not found.");
                }

                const items: string[] = [];
                for (const itemId in structure.recipe) {
                    const quantity = structure.recipe[itemId];
                    const itemName = inventoryItems.find((item: { id: { toString: () => string; }; }) => item.id.toString() === itemId)?.name;
                    if (itemName) {
                        items.push(`${quantity} ${itemName}`);
                    }
                }
                setRecipeItems(items);
            } catch (error: any) {
                console.error("Error fetching recipe:", error.message);
            }
        }

        fetchRecipe();
    }, [structureId]);

    return (
        <div>
            <h2>Recipe for Structure {structureId}</h2>
            <ul>
                {recipeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
