"use client"

import { useRouter } from "next/navigation"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import GameNavbar from "@/src/components/layout/Tes";
import DeploySatelliteViewport from "@/src/components/scenes/deploy/satellite/DeploySatellite";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { useEffect, useState } from "react";

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
                const { data, error } = await supabase
                    .from("researched")
                    .select("tech_type")
                    .eq("user_id", session.user.id)
                    .eq("tech_type", "satellitecount")
                    .limit(1)

                if (error) {
                    console.warn("Error checking researched tech:", error)
                    return
                }

                setHasSatelliteUpgrade(Array.isArray(data) && data.length > 0)
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
            <GameNavbar />
            {hasSatelliteUpgrade && (
                <div className="mx-auto w-full max-w-4xl px-4 py-2">
                    <div className="rounded-md bg-emerald-700/10 border border-emerald-600/20 text-emerald-300 px-3 py-2 text-sm">
                        Satellite capacity upgrade active — you can launch additional satellites.
                    </div>
                </div>
            )}
            <DeploySatelliteViewport />
        </div>
    );
};