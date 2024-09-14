"use client";

import { Menu, MenuButton, MenuItem } from "@headlessui/react";
import { ArrowDownIcon, LucideArrowLeft, LucideArrowRightSquare, LucideBookOpen, PaintRollerIcon } from "lucide-react";
import { NavMenuProps } from "@/types/Layout/Menu";
import { Button } from "../ui/button";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { UserAvatarNullUpload } from "../(settings)/profile/Avatar";

function NavMenu({ onClick }: NavMenuProps) {
    return (
        <Menu as="div" className='relative inline-block text-left'>

        </Menu>
    );
};

export function Header() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [avatar_url, setAvatarUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchUserAvatar = async () => {
            if (!session) {
                return (
                    null
                );
            };

            try {
                const { data: avatarData, error: avatarError } = await supabase
                    .from("profiles")
                    .select("avatar_url")
                    .eq("id", session.user.id)
                    .single();

                if (avatarData) {
                    setAvatarUrl(avatarData.avatar_url);
                };

                if (avatarError) {
                    console.error("Error fetching profile: ", avatarError.message);
                    return (
                        null
                    );
                };
            } catch (error: any) {
                console.error("Unexpected error: ", error);
            };
        };

        fetchUserAvatar();
    }, [session]);

    return (
        <>
            <header className="left-0 right-0 z-50 flex h-16 w-full items-center justify-between bg-white/10 px-4 shadow-sm backdrop-blur-md dark:bg-gray-950/80 dark:text-gray-50">
                <div className="flex items-center gap-4">
                    {/* <Button
                        className="rounded-full p-2"
                        size="icon"
                        variant="outline"
                        // onClick={}
                        style={{ visibility: "visible" }} // Only show when active planet isn't the smallest one
                    >
                        <LucideArrowLeft className="h-5 w-5" />
                    </Button> */}
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
                    <div className="inline-block rounded-lg text-yellow-500 bg-cyan-100 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80">
                        <NavMenu onClick={() => {}} />
                        {activePlanet?.content}
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
                    {/* <Button
                        className="rounded-full p-2"
                        size="icon"
                        variant="outline"
                    >
                        <LucideArrowRightSquare className="h-5 w-5" />
                    </Button> */}
                    {/* <UserAvatarNullUpload
                        url={avatar_url}
                        size={64}
                        onUpload={(
                            filePath: string
                        ) => {
                            setAvatarUrl(filePath)
                        }}
                    /> */}
                </div>
            </header>
        </>
    );
};