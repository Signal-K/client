import React from "react";
import { cn } from "../../../lib/uitls";
import { RocketIcon } from "lucide-react";
import { BentoGrid } from "../ui/bento-grid";
import { InventoryOneList, InventoryTwoList } from "../../_Skeleton/InventoryBlocks";

export default function BlockGrid() {
    return (
        <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
            {items.map((item, i) => (
                <BentoBoxItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    className={cn("[&>p:text-lg]", item.className)}
                />
            ))}
        </BentoGrid>
    );
};

// Boxes
export const BentoBoxItem = ({
    title,
    description,
    className,
    header,
}: {
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    className?: string | React.ReactNode;
    header?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
                className
            )}
        >
            {header}
            <RocketIcon />
            {/* <div className="group-hover/bento:translate-x-2 transition duration-200">
                <RocketIcon />
                <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
          {description}
        </div>
            </div> */}
        </div>
    );
};

// Items
const items = [
    {
        title: "Inventory list", // Rover Temperature Control Panel"
        description: (
            <span className="text-sm">
                
            </span>
        ),
        icon: RocketIcon,
        header: <InventoryOneList />,
        className: "md:col-span-1",
    },
    {
        title: "Inventory list 2", // Rover Temperature Control Panel"
        description: (
            <span className="text-sm">
                
            </span>
        ),
        icon: RocketIcon,
        header: <InventoryTwoList />,
        className: "md:col-span-1",
    },
];