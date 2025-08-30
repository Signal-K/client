"use client"

import { useRouter } from "next/navigation"
import GameNavbar from "@/src/components/layout/Tes"
import { Dialog, DialogContent } from "@/src/components/ui/dialog"
import RoverViewportSection from "@/src/components/ui/scenes/deploy/Rover/RoverSection"

export default function RoverViewportExpandedPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen w-full h-full flex-col">
            <img
                src="/assets/backdrops/Earth.png"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Earth Background"
            />

            <div className="w-full z-10">
                <GameNavbar />
            </div>

            <div className="flex justify-center items-center flex-grow z-10 px-2">
                <Dialog
                    defaultOpen
                    onOpenChange={(open) => {
                        if (!open) router.push("/");
                    }}
                >
                    <DialogContent
                        className="p-0 w-full max-w-[90vw] h-[85vh] flex flex-col bg-transparent shadow-none"
                        style={{ color: "" }}
                    >   
                        <div className="h-full w-full flex">
                            <RoverViewportSection />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};