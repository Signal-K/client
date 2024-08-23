"use client";

import { Menu, MenuButton, MenuItem } from "@headlessui/react";
import { ArrowDownIcon, LucideArrowLeft, LucideArrowRightSquare, LucideBookOpen, PaintRollerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivePlanet } from "@/context/ActivePlanet";

export function Header() {
    const { activePlanet } = useActivePlanet();

    return (
        <header className="left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white/10 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
                <Button
                    className="rounded-full p-2 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400"
                    size="icon"
                    variant="outline"
                    style={{ visibility: "visible" }}
                >
                    <LucideArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                    className="rounded-full p-2 text-yellow-900 hover:text-yellow-700 dark:text-yellow-300 dark:hover:text-yellow-400"
                    size="icon"
                    variant="outline"
                    style={{ visibility: "visible" }}
                >
                    <LucideBookOpen className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex flex-col items-center">
                <div className="inline-block rounded-lg bg-gray-100/80 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80 text-green-500 dark:text-green-300">
                    <p>{activePlanet?.content || "Star Sailors"}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    className="rounded-full p-2 text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-400"
                    size="icon"
                    variant="outline"
                >
                    <PaintRollerIcon className="h-5 w-5" />
                </Button>
                <Button
                    className="rounded-full p-2 text-purple-500 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-400"
                    size="icon"
                    variant="outline"
                >
                    <LucideArrowRightSquare className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}