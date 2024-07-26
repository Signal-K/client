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
                <>
                    <MyStructures />
                </>
            );
        };
    };

    const renderAutomatonContent = () => {
        if (!missionCompletionStatus.has(101)) {
            return (
                <></>
            );
        } else {
            return (
                <p>User's automaton on that planet (created when user picks their planet)</p>
            ); // There's not going to be any automaton content for the first chapter, right? Just a focal point (arrow) for them to collect the energy to life off next step
        };
    };

    return (
        <>
            {/* Desktop layout */}
            <div className="hidden md:grid md:grid-cols-1 md:grid-rows-3 md:gap-4 md:relative md:h-full">
                <div className="md:row-span-1 md:col-span-8 md:flex md:items-center md:justify-center">
                    {renderStructureContent()}
                </div>
                <div className="md:row-span-1 md:col-span-5 md:flex md:items-center md:justify-center p-2 mb-12">
                    {renderAutomatonContent()}
                </div>
            </div>

            {/* Mobile layout */}
            <div className="grid grid-cols-1 grid-rows-auto gap-4 md:hidden relative min-h-screen py-10 mt-10">
                <div className="col-span-1 flex justify-center items-start mt-10 py-12">
                    {renderStructureContent()}
                </div>
                <div className="col-span-2 flex justify-center">
                    {renderAutomatonContent()}
                </div>
            </div>
        </>
    );
};

// Start inventory block - from Jira