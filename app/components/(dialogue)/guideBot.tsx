"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function CaptnCosmosGuideModal() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [missionNumber, setMissionNumber] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMissions = async () => {
            if (!session?.user) return;

            try {
                // Fetch user missions from Supabase
                const { data: missions, error } = await supabase
                    .from("missions")
                    .select("mission")
                    .eq("user", session.user.id);

                if (error) throw error;

                // Check for specific missions
                if (missions.some((mission) => mission.mission === 1370201)) {
                    setMissionNumber(1370201);
                } else if (missions.some((mission) => mission.mission === 1370203)) {
                    setMissionNumber(1370203);
                } else if (missions.some((mission) => mission.mission === 1370204)) {
                    setMissionNumber(1370204);
                } else if (missions.some((mission) => mission.mission === 1370205)) {
                    setMissionNumber(1370205);
                } else if (missions.some((mission) => mission.mission === 1370206)) {
                    setMissionNumber(1370206);
                } else {
                    setMissionNumber(null); // No relevant mission found
                }

            } catch (error: any) {
                console.error("Error fetching missions:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, [session, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {missionNumber ? (
                <div>
                    <p>Current mission number: {missionNumber}</p>
                </div>
            ) : (
                <p>No relevant missions found.</p>
            )}
        </div>
    );
};