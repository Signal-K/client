"use client"

import { useRouter } from "next/navigation"
import GameNavbar from "@/src/components/layout/Tes"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import SolarHealth from "@/src/components/ui/scenes/deploy/solar/SolarHealth"

export default function SolarHealthViewportExpandedPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img 
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/backdrops/Earth.png"
                alt="Earth Background Image"
            />

            <div className="z-10 w-full">
                <GameNavbar />
            </div>

            <Dialog
                defaultOpen
                onOpenChange={(open) => {
                    if (!open) router.push("/")
                }}
            >
                <DialogContent
                    className="p-0 w-full max-w-[90vw] h-[85vh] flex flex-col bg-transparent shadow-none"
                    style={{ color: "" }}
                >
                    <div className="w-full h-full flex">
                        <SolarHealth />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}