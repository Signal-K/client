"use client"

import dynamic from "next/dynamic"
import GameNavbar from "@/src/components/layout/Tes"

const SolarHealth = dynamic(() => import("@/src/components/scenes/deploy/solar/SolarHealth"), {
  ssr: false,
  loading: () => <div className="p-4 text-xs text-slate-400">Loading solar viewport...</div>,
});

export default function SolarHealthViewportExpandedPage() {
    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <div className="w-full z-50 flex-shrink-0">
                <GameNavbar />
            </div>

            <div className="flex-1 z-10 min-h-0 pt-12">
                <SolarHealth />
            </div>
        </div>
    )
}
