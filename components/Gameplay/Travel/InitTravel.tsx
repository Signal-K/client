"use client"

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React from "react";

export default function GoToYourPlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const handleGoToPlanet = async () => {
        try {
            const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: 3,
                configuration: null,
                rewarded_items: [activePlanet?.id],
            };            

            const { data: newMission, error: missionError } = await supabase
                .from("missions")
                .insert([missionData]);

            if (missionError) {
                throw missionError;
            }
        } catch (error: any) {
            console.error("Error handling planet selection:", error.message);
        };
    };

    return (
        <button onClick={handleGoToPlanet}>Go to your planet</button>
    );
};