"use client";

import { Menu, MenuButton, MenuItem } from "@headlessui/react";
import { ArrowDownIcon, LucideArrowLeft, LucideArrowRightSquare, LucideBookOpen, PaintRollerIcon } from "lucide-react";
import { NavMenuProps } from "@/types/Layout/Menu";
import { Button } from "../ui/button";

function NavMenu({ onClick }: NavMenuProps) {
    return (
        <Menu as="div" className='relative inline-block text-left'>

        </Menu>
    );
};

export function Header() {
    return (
        <>
            <header className="left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white/10 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50">
                <div className="flex items-center gap-4">
                    <Button
                        className="rounded-full p-2"
                        size="icon"
                        variant="outline"
                        // onClick={}
                        style={{ visibility: "visible" }} // Only show when active planet isn't the smallest one
                    >
                        <LucideArrowLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        className="rounded-full p-2"
                        size="icon"
                        variant="outline"
                        // onClick={}
                        style={{ visibility: "visible" }}
                    >
                        <LucideBookOpen className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex flex-col items-center">
                    <div className="inline-block rounded-lg bg-gray-100/80 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80">
                        <NavMenu onClick={() => {}} />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        className="rounded-full p-2"
                        size="icon"
                        variant="outline"
                    >
                        <PaintRollerIcon className="h-5 w-5" />
                    </Button>
                    <Button
                        className="rounded-full p-2"
                        size="icon"
                        variant="outline"
                    >
                        <LucideArrowRightSquare className="h-5 w-5" />
                    </Button>
                </div>
            </header>
        </>
    );
};