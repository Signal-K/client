"use client"

import { useRouter } from "next/navigation"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import GameNavbar from "@/src/components/layout/Tes";
import DeploySatelliteViewport from "@/src/components/scenes/deploy/satellite/DeploySatellite";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

export default function SatelliteDeployPage() {
    const router = useRouter();
    const { isDark } = UseDarkMode();

    return (
        <div 
            className={`h-screen w-full flex flex-col overflow-hidden ${
                isDark 
                    ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
                    : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
            }`}
        >
            <GameNavbar />
            <DeploySatelliteViewport />
        </div>
    );
};