"use client";

import { Droppable } from "@hello-pangea/dnd";
import Image from "next/image";
import { Skeleton } from "@/src/components/ui/skeleton";

interface InventoryGridProps {
  loading: boolean;
  gridSize: number;
  userInventory: UserInventoryItem[];
  inventoryItems: InventoryItem[];
};

export function InventoryGrid({
    loading,
    gridSize,
    userInventory,
    inventoryItems,
}: InventoryGridProps) {
    const totalSlots = gridSize * 2; // Ensure 2 rows for horizontal scrolling

    if (loading) {
        return (
            <div className={`grid grid-rows-2 grid-flow-col gap-4 mb-8 overflow-x-auto`}>
                {Array(totalSlots)
                    .fill(0)
                    .map((_, i) => (
                        <Skeleton
                            key={i}
                            className="w-24 h-24 aspect-square rounded-lg" // Adjusting size for smaller cells
                        />
                    ))}
            </div>
        );
    }

    return (
        <div className={`grid grid-rows-2 grid-flow-col gap-4 mb-8 w-full overflow-x-auto`}>
            {Array(totalSlots)
                .fill(0)
                .map((_, index) => {
                    const itemInSlot = userInventory.find(
                        (item) => item.configuration?.slot === index
                    );
                    const itemDefinition = itemInSlot
                        ? inventoryItems.find((def) => def.id === itemInSlot.item)
                        : null;

                    return (
                        <Droppable key={index} droppableId={`slot-${index}`}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="aspect-square border-2 border-dashed border-primary/50 rounded-lg p-2 flex items-center justify-center bg-transparent hover:bg-card/50 w-24 h-24"
                                >
                                    {itemInSlot && itemDefinition ? (
                                        <div className="w-full h-full relative group">
                                            <Image
                                                src={itemDefinition.icon_url}
                                                alt={itemDefinition.name}
                                                fill
                                                className="object-contain p-2 transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                <span className="text-sm text-foreground font-medium truncate">
                                                    {itemDefinition.name}
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    );
                })}
        </div>
    );
}

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
    configuration: any;
};