import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

export default function PlanetData() { // Right now, this will only be for the active planet
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [planetData, setPlanetData] = useState();

    async function getPlanetData() {
        try {
            const { data: planetInfo, error: planetError } = await supabase.from("anomalies")
                .select("*")
                .eq("id", activePlanet?.id)
                .limit(1)

            if (planetInfo) {
                // setPlanetData(planetInfo);
            };

            if (planetError) {
                console.error("Error fetching anomaly-planet data: ", planetError);
            };
        } catch (error: any) {
            console.log("Caught error when attempting to fetch anomaly-planet data: ", error);
        };
    }

    useEffect(() => {
        getPlanetData();
    }, [session]);

    return (
        // <p>{planetInfo.Configuration}</p> {/* Create a function to convert the configuration from `anomalies` table. */}
        <p>Planet data</p>
    );
};