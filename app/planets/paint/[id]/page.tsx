'use client'

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { useParams } from "next/navigation"
import { Classification } from "../../[id]/page";
import { useRouter } from "next/navigation"
import GameNavbar from "@/components/Layout/Tes";
import PlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator"
import { Button } from "@/components/ui/button"

export default function PaintYourPlanetPage() {
    const params = useParams();
    const id = params?.id as string;

    const router = useRouter();

    const supabase = useSupabaseClient();
    const session = useSession();

    const [classification, setClassification] = useState<Classification | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!params.id) {
            return;
        };

        const fetchClassification = async () => {
            const {
                data,
                error
            } = await supabase
                .from("classifications")
                .select("*, anomaly:anomalies(*), classificationConfiguration, media")
                .eq("id", params.id)
                .single();

            if (error) {
                console.error("Error fetching planet details: ", error);
                setError('Failed to fetch classification data');
                return;
            };

            setClassification(data);
        };

        fetchClassification();
    }, [params]);

    if (!classification) {
        return (
            <p>Loading...</p>
        );
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-black text-white">
            <GameNavbar />
            <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/assets/Backdrops/background1.jpg"
                        alt='background'
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                </div>

                {/* Main content container fills remaining space */}
                <main className="relative z-10 flex flex-col h-full px-4 pt-4">
                    {/* Limit PlanetGenerator height so it doesn't overflow */}
                    <div className="flex-grow overflow-auto max-h-[calc(100vh-160px)]">
                        <PlanetGenerator
                            classificationId={classification.id.toString()}
                            editMode={true}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D8DEE9] pb-4">
                        <Button variant="outline" onClick={() => router.push(`/structures/telescope`)}>
                            🧬 Back to Structure
                        </Button>
                        <Button variant="ghost" onClick={() => router.push('/')}>
                            🏠 Home
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    )
};