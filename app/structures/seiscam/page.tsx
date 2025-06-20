'use client'

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
import React from "react"
import GameNavbar from "@/components/Layout/Tes"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function SeiscamOnEarthPage() {
    const router = useRouter();

    const session = useSession();

    if (!session) {
        router.push("/");
    };

    const actions = [{

    }];

    const buttons = [{

    }];

    return (
        <div className="relative min-h-screen w-full flex-flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
                alt="Earth Background"
            />

            <div className="w-full">
                <GameNavbar />
            </div>

            <div className="flex flex-row space-y-4">
                <Dialog
                    defaultOpen
                    onOpenChange={(open) => {
                        if (!open) {
                            router.push("/");
                        };
                    }}
                >
                    <DialogContent
                        className="p-6 rounded-3xl text-white max-w-3xl w-full h-[80vh] overflow-hidden flex flex-col justify-start"
                        style={{
                            background: "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85))",
                            color: "#2E3440",
                        }}
                    >
                        <div className="flex-grow overflow-y-auto w-full">
                            <div className="flex justify-between items-center">
                                
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};