"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

const StartGame: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();

    const [loading, setLoading] = useState(false);

    const handlePlanetSelect = async ( planetId: number ) => {
        try { // Fetch the details of the planet that has been selected for the user
            const { data: planetData, error: planetError } = await supabase
                .from("anomalies")
                .select("*")
                .eq('id', planetId)
                .single();
                
            if (planetError) {
                throw planetError;
                return (
                    <p>There was an error fetching details of your new planet</p>
                );
            };

            if (!planetData) {
                throw new Error("Planet data not found");
                return (
                    <p>There was an error fetching details of your planet</p>
                );
            };

            await updatePlanetLocation(planetId);

            const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: 100,
                configuration: null,
                rewarded_items: null,
            };
        } catch (error: any) {

        }
    }

    return (
        <></>
    )
}