import React, { useCallback, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
    id: number;
    name: string;
    description: string;
    icon_url: string;
    ItemCategory: string;
    locationType: string;
    location?: number;
};

export default function BuildTerrariumStructures({ location }: { location: number }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const [unownedStructures, setUnownedStructures] = useState<InventoryItem[]>([]);
    const [selectedStructure, setSelectedStructure] = useState<InventoryItem | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStructures = useCallback(async () => {
        if (!session) {
            setLoading(false);
            return;
        }
        try {
            const { data: userInventory, error } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session.user.id)
                .eq("terrarium", location);
            
            if (error) throw error;

            const ownedItems = userInventory.map((item: any) => item.item);
            const response = await fetch("/api/gameplay/inventory/");
            const inventoryItems: InventoryItem[] = await response.json();

            const surfaceStructures = inventoryItems.filter(
                (item) => item.ItemCategory === "Structure"
            );

            const unowned = surfaceStructures.filter(
                (item) => !ownedItems.includes(item.id)
            );
            setUnownedStructures(unowned);
        } catch (error: any) {
            setError(error.message);
            console.error("Error fetching structures:", error.message);
        } finally {
            setLoading(false);
        }
    }, [session, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    const addToInventory = async ( structure: InventoryItem ) => {
        if (!session) {
            return;
            setLoading(false);
        };

        try {
            // setLoading(true);

            const {
                error
            } = await supabase
                .from("inventory")
                .insert([
                    {
                        owner: session.user.id,
                        terrarium: location,
                        item: structure.id,
                        quantity: 1,
                        configuration: {
                            Uses: 1,
                        },
                    },
                ]);

            if (error) {
                throw error;
            };

            setOpen(false);
        } catch (error: any) {
            setError(error.message);
            console.error("Error adding structure to inventory:", error.message);
        } finally {
            setLoading(false);
        };
    };


    if (loading) return <p>Loading...</p>;
    if (unownedStructures.length === 0) return null;

    return (
        <div className="relative">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <Button
                        size="lg"
                        className="rounded-full p-4 bg-[#1a1b26] text-[#a9b1d6] hover:bg-[#24283b] shadow-lg"
                    >
                        <Plus size={24} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-full max-h-[90vh] w-full sm:w-[90vw] h-auto sm:h-auto p-6 bg-gradient-to-br from-[#1a1b26] via-[#292e42] to-[#565f89] rounded-3xl overflow-hidden flex flex-col justify-between">
                    <AnimatePresence>
                        {selectedStructure ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center text-center space-y-4"
                            >
                                <img
                                    className="w-40 h-40 mx-auto rounded-lg shadow-md"
                                    alt={selectedStructure.name}
                                    src={selectedStructure.icon_url}
                                />
                                <h2 className="text-2xl font-semibold text-[#c0caf5]">
                                    {selectedStructure.name}
                                </h2>
                                <p className="text-md text-[#a9b1d6] max-w-sm text-center">
                                    {selectedStructure.description}
                                </p>
                                <Button
                                    size="lg"
                                    className="w-full max-w-md bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#89b4fa]"
                                    onClick={() => {
                                        console.log("Build", selectedStructure.name);
                                        setSelectedStructure(null);
                                        addToInventory(selectedStructure);
                                    }}
                                >
                                    Build
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
                                    {unownedStructures.map((structure) => (
                                        <div
                                            key={structure.id}
                                            className="flex flex-col items-center p-4 bg-[#24283b] rounded-lg shadow-md hover:bg-[#292e42] transition cursor-pointer"
                                            onClick={() => setSelectedStructure(structure)}
                                        >
                                            <img
                                                src={structure.icon_url}
                                                alt={structure.name}
                                                className="w-24 h-24 mb-2 rounded-lg"
                                            />
                                            <h3 className="text-lg font-semibold text-[#c0caf5]">
                                                {structure.name}
                                            </h3>
                                            <p className="text-sm text-[#a9b1d6] text-center truncate w-full">
                                                {structure.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    );
};