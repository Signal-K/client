"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

type CloudDataType = {
    id: string;
    Configuration: string;
    anomalyType: string;
    [key: string]: any;
    // avatar_url: string; // This should be fetched from the storage bucket [as well]
    content: string;
};

type CloudDataProps = {
    cloud: CloudDataType;
    onSelect: () => void;
};

export function CloudDataCard({ cloud, onSelect }: CloudDataProps) {
    return (
        <div className="relative group grid [grid-template-areas:stack] overflow-hidden rounded-lg" onClick={onSelect}>
            <Link href="#" className="absolute inset-0 z-10" prefetch={false}>
                <span className="sr-only">View</span>
            </Link>
            <img
                src={cloud.avatar_url || "/placeholder.svg"}
                alt={cloud.content}
                className="[grid-area:stack] object-cover w-full aspect-square"
            />
            <div className="flex-1 [grid-area:stack] bg-black/40 group-hover:opacity-90 transition-opacity text-white p-4 lg:p-6 justify-end flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold tracking-tight">{cloud.content}</h3>
                </div>
            </div>
        </div>
    );
}

export default function PlanetCloudData() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [cloudDataList, setCloudDataList] = useState<CloudDataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getCloudData() {
            if (!activePlanet?.id) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const { data: cloudInfo, error: cloudError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalytype", "mars-cloud")
                    .eq("parentAnomaly", activePlanet.id);

                if (cloudError) {
                    throw cloudError;
                }

                setCloudDataList(cloudInfo || []);
            } catch (error: any) {
                console.error("Error fetching cloud data:", error);
                setError("Error fetching cloud data");
            } finally {
                setLoading(false);
            }
        }

        getCloudData();
    }, [activePlanet, supabase]);

    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {cloudDataList.map((cloud) => (
                        <CloudDataCard
                            key={cloud.id}
                            cloud={cloud}
                            onSelect={() => console.log("Cloud data selected")}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
