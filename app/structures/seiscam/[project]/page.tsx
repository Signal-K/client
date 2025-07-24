'use client';

import { useRouter, useParams } from "next/navigation";
import { useSession } from "@supabase/auth-helpers-react";
import GameNavbar from "@/src/components/layout/Tes";
import AI4M from "@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AIForMars";
import PlanetFour from "@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/PlanetFour";

export default function SeisCamProjectpage() {
    const params = useParams();
    const router = useRouter();
    const project = params?.project;

    const session = useSession();

    if (!session) {
        router.push("/");
    };

    const componentMap: { [ key: string ]: React.ReactNode } = {
        landmarks: <AI4M />,
        surface: <PlanetFour />,
    };

    const SelectedComponent = componentMap[ project as string ];

    if (!SelectedComponent) {
        router.push("/structures/seiscam");
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
                alt="Earth Background"
            />

            <div className="pb-8">
                <GameNavbar />
            </div>

            <main className="flex-grow z-10 px-4 py-12 flex justify-center items-start overflow-y-auto">
                <div className="max-w-4xl w-full">
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={() => router.push('/structures/seiscam')}
                            className="bg-muted hover:bg-muted/70 text-sm text-foreground border border-border rounded-md px-4 py-2 transition-colors"
                        >
                            All Projects
                        </button>
                    </div>
                    {SelectedComponent}
                </div>
            </main>

        </div>

    )
}