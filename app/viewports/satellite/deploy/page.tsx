"use client"

import { useRouter } from "next/navigation"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import GameNavbar from "@/src/components/layout/Tes";
import DeploySatelliteViewport from "@/src/components/scenes/deploy/satellite/DeploySatellite";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { useEffect, useState } from "react";
import { hasUpgrade } from "@/src/utils/userUpgrades";

export default function SatelliteDeployPage() {
    const router = useRouter();
    const { isDark } = UseDarkMode();
    const supabase = useSupabaseClient();
    const session = useSession();
    const [hasSatelliteUpgrade, setHasSatelliteUpgrade] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) return;

        const check = async () => {
            try {
                const upgrade = await hasUpgrade(supabase, session.user.id, "satellitecount");
                setHasSatelliteUpgrade(upgrade);
            } catch (e) {
                console.warn("Failed to check researched tech", e)
            }
        }

        check()
    }, [session, supabase])

    return (
        <div 
            className={`h-screen w-full flex flex-col overflow-hidden ${
                isDark 
                    ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
                    : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
            }`}
        >
            <div className="flex-shrink-0">
                <GameNavbar />
            </div>
            {hasSatelliteUpgrade && (
                <div className="mx-auto w-full max-w-4xl px-4 py-2 flex-shrink-0">
                    <div className="rounded-md bg-emerald-700/10 border border-emerald-600/20 text-emerald-300 px-3 py-2 text-sm">
                        Satellite capacity upgrade active — you can launch additional satellites.
                    </div>
                </div>
            )}
            <div className="flex-1 min-h-0">
                <DeploySatelliteViewport />
            </div>
        </div>
    );
};