import React from "react";
import { cn } from "@/lib/utils";
import { RocketIcon } from "lucide-react";
import { BentoGrid } from "./BentoGrid";
import { RoverControlPanel } from "@/components/Gameplay/Inventory/Automation";
import { RoverImageNoHandle } from "@/Classifications/RoverContent";
// import { ContentPlaceholderBlockTest, PlanetStatBlock, SectorsInsidePlanetBlock } from "../../_Skeleton/PlanetDataBlocks";

export default function BlockGrid() {
    return (
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[20rem]">
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
                // className
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
        header: <RoverImageNoHandle date="718" rover="perseverance" className='' />,
        className: "md:col-span-1 row-span-1",
    },
    {
        title: "Inventory list 2",
        description: (
            <span className="text-sm">

            </span>
        ),
        icon: RocketIcon,
        // header: <InventoryTwoList />,
        className: "md:col-span-1 row-span-1",
    },
    {
        title: "Post form card",
        description: (
            <span className="text-sm">

            </span>
        ),
        icon: RocketIcon,
        // header: <ClassificationForPlanetFormBlock />,
        className: "md:col-span-1 row-span-1",
    },
    {
        title: "Content placeholder test",
        description: (
            <span className="text-sm">

            </span>
        ),
        icon: RocketIcon,
        // header: <ContentPlaceholderBlockTest />,
        className: "md:col-span-1 row-span-1",
    },
    {
        title: "Your owned structures",
        description: (
            <span className="text-sm">
                You're able to view all structures you own, on any sector and any planet, in this block
            </span>
        ),
        icon: RocketIcon,
        // header: <OwnedStructuresFullList />,
        className: "md:col-span-2 row-span-2"
    },
    {
        title: "Posts for a planet/all planets",
        description: (
            <span className="text-sm">
                This block allows you to view posts for a specific anomaly (currently planets), however there is also a global feed that takes every post/comment & vote/metadata
            </span>
        ),
        icon: RocketIcon,
        // header: <ClassificationForPlanetFormBlock />,
        className: "md:col-span-2 row-span-1"
    },
    {
        title: "All sectors that you own",
        description: (
            <span className="text-sm">
                No discriminator for a specific anomaly/planet
            </span>
        ),
        icon: RocketIcon,
        // header: <SectorsInsidePlanetBlock />,
        className: "md:col-span-2 row-span-1"
    },
    {
        title: "Data/stat display for an anomaly ",
        description: (
            <span className="text-sm">
                In this case, we're looking at a planet in the `basePlanets` table
            </span>
        ),
        icon: RocketIcon,
        // header: <PlanetStatBlock />,
        className: "md:col-span-4 row-span-1"
    },
];