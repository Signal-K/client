"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
 
export default function ChapterOneIntroduction() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [missionExists, setMissionExists] = useState(false);

    useEffect(() => {
        const checkMission = async () => {
            if (!session?.user?.id) return;

            try {
                const { data: existingMissions, error: checkError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", 1370201);

                if (checkError) {
                    throw checkError;
                }

                if (existingMissions.length > 0) {
                    setMissionExists(true);
                }
            } catch (error: any) {
                console.error("Error checking mission 1370201: ", error.message);
            }
        };

        checkMission();
    }, [session, supabase]);

    const handleItemInitialisation = async () => {
        if (!session || !activePlanet) {
            return;
        }

        const itemsToAdd = [3102, 3101];

        try {
            const { error: inventoryError } = await supabase
                .from("inventory")
                .insert(itemsToAdd.map((id) => ({
                    owner: session.user.id,
                    item: id,
                    quantity: 1,
                    time_of_deploy: null,
                    anomaly: activePlanet.id,
                    parentItem: null,
                })));

            if (inventoryError) {
                throw inventoryError;
            };

            const missionData = {
                user: session.user.id,
                time_of_completion: new Date().toISOString(),
                mission: 1370201,
                configuration: null,
                rewarded_items: [],
            };

            const { error: missionError } = await supabase.from("missions").insert([missionData]);

            if (missionError) {
                throw missionError;
            }

            console.log("Mission 1370201 created successfully.");
            setMissionExists(true); 
        } catch (error: any) {
            console.error("Error handling item initialization: ", error.message);
        }
    };

    if (missionExists) {
        return null;
    }

    return (
        <div>
            <p>Some boilerplate text introducing the user</p>
            <button onClick={handleItemInitialisation} className="block bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Button that creates your structures and marks this as completed
            </button>
        </div>
    );
}