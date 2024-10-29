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

    const GRID_SIZE = 4;

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [itemsRes, { data: { session } }] = await Promise.all([
                fetch("/api/gameplay/inventory"),
                supabase.auth.getSession()
            ]);

            let items: InventoryItem[] = await itemsRes.json();
            items = items.filter(item => 
                (item.ItemCategory === "Structure" || item.ItemCategory === "CommunityStation") &&
                item.locationType === "Surface"
            );

            setInventoryItems(items);

            if (session?.user) {
                const { data: userItems } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("anomaly", activePlanet?.id)
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

        const inventoryItem = userInventory.find(item => item.id === itemId);
        if (!inventoryItem) return;

        const newConfig = {
            ...inventoryItem.configuration,
            slot: slotIndex
        };

        const { error } = await supabase
            .from("inventory")
            .update({ configuration: newConfig })
            .eq("id", itemId);

        if (error) {
            toast.error("Failed to update item position");
        } else {
            setUserInventory(prev =>
                prev.map(item =>
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
        const destinationIndex = parseInt(result.destination.droppableId.split("-")[1]);

        updateItemConfiguration(parseInt(sourceId), destinationIndex);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="p-4 max-w-7xl mx-auto">
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

                    <InventoryList
                        userInventory={userInventory}
                        inventoryItems={inventoryItems}
                    />
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
};

interface UserInventoryItem {
    id: number;
    item: number;
    owner: string;
    quantity: number;
    configuration: { slot?: number } | null;
};