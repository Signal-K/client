"use client"

import { useRouter } from "next/navigation"
import GameNavbar from "@/src/components/layout/Tes";
import DeploySatelliteViewport from "@/src/components/scenes/deploy/satellite/DeploySatellite";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/src/hooks/useAuthUser";

export default function SatelliteDeployPage() {
    const router = useRouter();
    const { isDark } = UseDarkMode();
    const { user } = useAuthUser();
    const [hasSatelliteUpgrade, setHasSatelliteUpgrade] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        const check = async () => {
            try {
                const response = await fetch("/api/gameplay/research/summary", { cache: "no-store" });
                const payload = await response.json().catch(() => null);
                if (!response.ok) {
                    setHasSatelliteUpgrade(false);
                    return;
                }
                const researched = Array.isArray(payload?.researched) ? payload.researched : [];
                setHasSatelliteUpgrade(researched.some((r: any) => r.tech_type === "satellitecount"));
            } catch (e) {
                console.warn("Failed to check researched tech", e)
            }
        }

        check()
    }, [user])

    return (
        <div 
            className={`w-full h-screen flex flex-col overflow-hidden ${
                isDark 
                    ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
                    : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
            }`}
        >
                <GameNavbar />
            {hasSatelliteUpgrade && (
                <div className="mx-auto w-full max-w-4xl px-4 py-2 flex-shrink-0">
                    <div className="rounded-md bg-emerald-700/10 border border-emerald-600/20 text-emerald-300 px-3 py-2 text-sm">
                        Satellite capacity upgrade active — you can launch additional satellites.
                    </div>
                </div>
            )}
            <div className="flex-1 min-h-0 w-full">
                <DeploySatelliteViewport />
            </div>
        </div>
    );
};
