'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { InventoryItem } from "@/types/Items";

export function CreateStructure({ structureType }: { structureType: string }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    
    const [loading, setLoading] = useState(false);
    const [structureItemMap, setStructureItemMap] = useState<Record<string, InventoryItem | undefined>>({});

    useEffect(() => {
        const fetchInventoryItems = async () => {
            try {
                const response = await fetch('/api/gameplay/inventory');
                const items: InventoryItem[] = await response.json();
                const map: Record<string, InventoryItem | undefined> = {};
                
                items.forEach(item => {
                    if (item.ItemCategory === 'Structure') {
                        map[item.name] = item; // Store the entire item
                    }
                });
                
                setStructureItemMap(map);
            } catch (error) {
                console.error("Error fetching inventory items:", error);
            }
        };

        fetchInventoryItems();
    }, []);

    async function addSpecificStructure() {
        if (!session || !activePlanet) {
            setLoading(false);
            return;
        }

        const structureItem = structureItemMap[structureType];

        if (!structureItem) {
            console.error("Invalid structure type");
            return;
        }

        setLoading(true);

        try {
            const { error: inventoryError } = await supabase
                .from("inventory")
                .insert([
                    {
                        owner: session.user.id,
                        anomaly: activePlanet.id,
                        item: structureItem.id, // Use the item id from the object
                        quantity: 1,
                        configuration: { Uses: 5 },
                    },
                ]);

            if (inventoryError) {
                throw inventoryError;
            }
        } catch (error: any) {
            console.error("Error adding structure to inventory", error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-full max-h-[90vh] w-full sm:w-[90vw] h-full sm:h-[90vh] p-0 bg-gradient-to-br from-[#1a1b26] via-[#292e42] to-[#565f89] rounded-3xl overflow-hidden">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative h-full flex flex-col items-center justify-between p-8"
                >
                    <div className="text-center">
                        {structureItemMap[structureType] && (
                            <>
                                <img
                                    src={structureItemMap[structureType]?.icon_url} 
                                    alt={structureType} 
                                    className="w-64 h-64 mx-auto rounded-lg shadow-lg"
                                />
                                <h2 className="text-3xl font-semibold mb-2 text-[#C0CAF5]">
                                    {structureItemMap[structureType].name}
                                </h2>
                                <p className="text-lg text-[#A9B1D6] mb-8">
                                    {structureItemMap[structureType].description}
                                </p>
                            </>
                        )}
                    </div>
                    <Button
                        size="lg"
                        className="w-full max-w-md bg-[#7AA2F7] text-[#1A1B26] hover:bg-[#89b4Fa]"
                        onClick={addSpecificStructure}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};