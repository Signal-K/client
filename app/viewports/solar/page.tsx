"use client"

import { useRouter } from "next/navigation"
import GameNavbar from "@/src/components/layout/Tes"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import SolarHealth from "@/src/components/scenes/deploy/solar/SolarHealth"

export default function SolarHealthViewportExpandedPage() {
    const router = useRouter();

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