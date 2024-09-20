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

        const itemsToAdd = [3102];

        try {
            // Insert items
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
            }

            // Insert mission
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

            // Update activemission to 1370203
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ activemission: 1370203 })
                .eq("id", session.user.id);

            if (updateError) throw updateError;

            console.log("Mission 1370201 created and activemission updated to 1370203.");
            setMissionExists(true); 
        } catch (error: any) {
            console.error("Error handling item initialization: ", error.message);
        }
    };

    if (missionExists) {
        return (
            null
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg w-full">
                <p>Welcome! You're now on your planet. Let's start doing some classifications. If you start something and don't like it, you'll then be able to change, so don't worry</p> <br />
                <p>After picking your first mission that interests you, you'll be given a structure that will provide you with data to classify. You'll then be able to use the research station to unlock more content to explore</p> <br />
                <p>If you want to change your mission, get some more info or build something new, click on the Astronaut helmet icon in the bottom-right corner</p>
                <button
                    onClick={handleItemInitialisation}
                    className="mt-4 bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Get started
                </button>
            </div>
        </div>
    );
};