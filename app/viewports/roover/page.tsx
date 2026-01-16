"use client"

import { useRouter } from "next/navigation"
import GameNavbar from "@/src/components/layout/Tes"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import RoverViewportSection from "@/src/components/scenes/deploy/Rover/RoverSection"

export default function RoverViewportExpandedPage() {
    const router = useRouter();

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <div className="w-full z-50 flex-shrink-0">
                <GameNavbar />
            </div>

            <div className="flex-1 z-10 min-h-0 pt-12">
                <RoverViewportSection />
            </div>
        </div>
    );
};