import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

type PlanetDataType = {
    id: string;
    Configuration: string;
    type: string;
    [key: string]: any; // Adjust according to the actual structure of your `anomalies` table
};

export default function PlanetData() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [planetData, setPlanetData] = useState<PlanetDataType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function getPlanetData() {
        if (!activePlanet?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data: planetInfo, error: planetError } = await supabase
                .from("anomalies")
                .select("*")
                .eq("id", activePlanet.id)
                .single();

            if (planetError) {
                throw planetError;
            }

            setPlanetData(planetInfo);
        } catch (error: any) {
            console.error("Error fetching anomaly-planet data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            getPlanetData();
        }
    }, [session, activePlanet]);

    return (
        <div className="p-4 bg-gray-100 rounded-md">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {planetData ? (
                <div>
                    <h2 className="text-2xl font-bold mb-2">Planet Configuration</h2>
                    <p>{planetData.Configuration}</p>
                    <p>Planet ID: {planetData.id}. Planet type: {planetData.type}.</p>
                    {/* Render more data as needed. Convert configuration components */}
                </div>
            ) : (
                !loading && <p>No planet data available.</p>
            )}
        </div>
    );
};