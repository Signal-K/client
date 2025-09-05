"use client"

import { useRouter } from "next/navigation"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import GameNavbar from "@/src/components/layout/Tes";
import DeploySatelliteViewport from "@/src/components/ui/scenes/deploy/satellite/DeploySatellite";

export default function SatelliteDeployPage() {
    const router = useRouter();

    return (
        <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#002439] to-[#001a2a] overflow-hidden">
            <GameNavbar />
            <DeploySatelliteViewport />
        </div>
    );
};