"use client";

import React, { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetGrid from "@/app/(scenes)/(missions)/(navigating)/PlanetSelector";
import MyStructures from "@/app/(structures)/Structures";

export default function TerrestrialPlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [missionCompletionStatus, setMissionCompletionStatus] = useState(new Map());

    const fetchMissionCompletionStatus = async () => {
        if (session) {
            try {
                const { data, error } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id);
    
                if (error) {
                    console.error('Error fetching missions: ', error.message);
                    return;
                };
    
                const missionStatusMap = new Map();
                data.forEach((mission) => {
                    missionStatusMap.set(mission.mission, true);
                });
    
                setMissionCompletionStatus(missionStatusMap);
            } catch (error: any) {
                console.error('Error fetching mission completion status:', error.message);
            };
        };
    };

    const renderStructureContent = () => {
        if (!missionCompletionStatus.has(101)) {
            return (
                <>
                    <PlanetGrid />
                </>
            );
        } else { // I'm sure there will be other conditionals....
            return (
                <MyStructures />
            );
        };
    };

    return (
        <></>
    );
};

// Start inventory block - from Jira