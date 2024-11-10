"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface InventoryListProps {
    userInventory: UserInventoryItem[];
    inventoryItems: InventoryItem[];
}

export function InventoryList({
    userInventory,
    inventoryItems,
}: InventoryListProps) {
    return (
        <Card className="p-4 bg-card/90 backdrop-blur-sm border-primary/20">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
                Inventory Items
            </h2>
            <ScrollArea className="h-[300px]">
                <Droppable droppableId="inventoryList" direction="vertical">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                        >
                            {userInventory.map((item, index) => {
                                const itemDefinition = inventoryItems.find(
                                    (def) => def.id === item.item
                                );
                                if (!itemDefinition) return null;

                                return (
                                    <Draggable
                                        key={item.id.toString()}
                                        draggableId={item.id.toString()}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="border p-2 rounded-md shadow-sm bg-transparent hover:bg-secondary/80"
                                            >
                                                <Image
                                                    src={itemDefinition.icon_url}
                                                    alt={itemDefinition.name}
                                                    width={48}
                                                    height={48}
                                                    className="mx-auto"
                                                />
                                                <p className="text-center mt-2 text-xs font-semibold text-foreground">
                                                    {itemDefinition.name}
                                                </p>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </ScrollArea>
        </Card>
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
    configuration: any;
};