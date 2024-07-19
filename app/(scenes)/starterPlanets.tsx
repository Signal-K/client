"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

export default function FirstScene() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [completedMissions, setCompletedMissions] = useState(new Map());

    const fetchCompletedMissions = async () => {
        if (session) {
            try {
                const { data, error } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id)

                if (error) {
                    console.error('Error fetching missions: ', error.message);
                    return;
                };

                const missionStatusMap = new Map();
                data.forEach((mission) => {
                    missionStatusMap.set(mission.mission, true);
                });

                setCompletedMissions(missionStatusMap);
            } catch (error: any) {
                return error;
            };
        };
    };

    // If activePlanet = planet.type, show planet type here
}