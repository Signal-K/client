"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { InventoryGrid } from "./ItemGrid";
import { InventoryList } from "./ItemList";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function InventoryPage() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [userInventory, setUserInventory] = useState<UserInventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOverlayOpen, setOverlayOpen] = useState<boolean>(false); // State to track overlay visibility

    const GRID_SIZE = 8; // Adjusting the size for horizontal scroll

    useEffect(() => {
        fetchData();
    }, [activePlanet, supabase]);

    async function fetchData() {
        if (!activePlanet) {
            console.log("No active planet");
            return;
        }

        try {
            const [itemsRes, { data: { session } }] = await Promise.all([
                fetch("/api/gameplay/inventory"),
                supabase.auth.getSession(),
            ]);

            let items: InventoryItem[] = await itemsRes.json();
            items = items.filter(
                (item) =>
                    (item.ItemCategory === "Structure" ||
                        item.ItemCategory === "CommunityStation") &&
                    item.locationType === "Surface"
            );

            setInventoryItems(items);
            console.log(inventoryItems);

            if (session?.user) {
                const { data: userItems } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("anomaly", activePlanet.id)
                    .eq("owner", session.user.id);

                setUserInventory(userItems || []);
            }
        } catch (error) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    }

    async function updateItemConfiguration(itemId: number, slotIndex: number) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const inventoryItem = userInventory.find((item) => item.id === itemId);
        if (!inventoryItem) return;

        const newConfig = {
            ...inventoryItem.configuration,
            slot: slotIndex,
        };

        const { error } = await supabase
            .from("inventory")
            .update({ configuration: newConfig })
            .eq("id", itemId);

        if (error) {
            toast.error("Failed to update item position");
        } else {
            setUserInventory((prev) =>
                prev.map((item) =>
                    item.id === itemId
                        ? { ...item, configuration: newConfig }
                        : item
                )
            );
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const sourceId = result.draggableId;
        const destinationIndex = parseInt(
            result.destination.droppableId.split("-")[1]
        );

        updateItemConfiguration(parseInt(sourceId), destinationIndex);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="p-4 max-w-full mx-auto overflow-x-auto">
                <div className="relative">
                    <div className="sci-fi-shape sci-fi-shape-1" />
                    <div className="sci-fi-shape sci-fi-shape-2" />
                    <div className="sci-fi-wire sci-fi-wire-1" />
                    <div className="sci-fi-signal sci-fi-signal-1" />

                    <InventoryGrid
                        loading={loading}
                        gridSize={GRID_SIZE}
                        userInventory={userInventory}
                        inventoryItems={inventoryItems}
                    />

                    <div className="sci-fi-wire sci-fi-wire-2" />
                    <div className="sci-fi-signal sci-fi-signal-2" />

                    {/* Open Overlay Button directly below the main grid */}
                    <button
                        onClick={() => setOverlayOpen(!isOverlayOpen)} // Toggle overlay
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        {isOverlayOpen ? "Close Inventory Items" : "Open Inventory Items"}
                    </button>

                    {/* Sliding Inventory Overlay */}
                    <div
                        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
                            isOverlayOpen ? "translate-y-0" : "translate-y-full"
                        }`}
                        style={{ height: "40vh" }} // Occupy 40% of the screen height
                    >
                        {/* No border or background, just the items */}
                        <div className="p-4 h-full overflow-y-auto">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold mb-4 text-white">Inventory Items</h2>

                                {/* Close Overlay Button */}
                                <button
                                    onClick={() => setOverlayOpen(false)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Inventory Items List */}
                            <InventoryList
                                userInventory={userInventory}
                                inventoryItems={inventoryItems}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};

interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost?: number;
    icon_url: string;
    ItemCategory: string;
    parentItem?: number | null;
    itemLevel?: number;
    locationType?: string;
    recipe?: { [key: string]: number };
    gif?: string;
    configuration?: { slot?: number } | null;
};

interface UserInventoryItem {
    id: number;
    item: number;
    owner: string;
    quantity: number;
    configuration: { slot?: number } | null;
};