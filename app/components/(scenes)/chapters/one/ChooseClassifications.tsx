"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { MissionStructureDisplay } from '@/app/components/(structures)/StructuresForMission';
import { useActivePlanet } from '@/context/ActivePlanet';
import { Mission } from '@/app/components/(structures)/StructuresForMission';

interface CitizenScienceModule {
    id: number;
    name: string;
    level?: number; // aka chapter
    starterMission?: number; // used to determine if a user has started it
    structure: number;
};

export default function ChooseClassificationStarter() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [modules, setModules] = useState<CitizenScienceModule[]>([]);
    const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
    const [activemission, setactivemission] = useState<Mission | null>(null);

    useEffect(() => {
        const fetchModulesAndMissions = async () => {
            try {
                // Fetch modules and missions
                const modulesRes = await fetch('/api/citizen/modules');
                const modulesData: CitizenScienceModule[] = await modulesRes.json();
                const filteredModules = modulesData.filter(module => module.id >= 0 && module.id <= 10);
                setModules(filteredModules);

                const missionsRes = await fetch('/api/gameplay/missions');
                const missionsData: Mission[] = await missionsRes.json();

                // Fetch profile and check active mission
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('activemission')
                    .eq('id', session?.user.id)
                    .single();

                if (profileError) throw profileError;

                if (profile.activemission) {
                    const activemission = missionsData.find(mission => mission.id === profile.activemission);
                    setactivemission(activemission || null);
                } else {
                    // Fetch completed missions and available missions
                    const { data: completedMissions, error: missionsError } = await supabase
                        .from('missions')
                        .select('mission')
                        .eq('user', session?.user.id);

                    if (missionsError) throw missionsError;

                    const completedMissionIds = completedMissions.map((m: any) => m.mission);
                    const availableMissions = filteredModules
                        .filter(module => !completedMissionIds.includes(module.starterMission))
                        .map(module => missionsData.find(mission => mission.id === module.starterMission))
                        .filter(Boolean) as Mission[];

                    setAvailableMissions(availableMissions);
                }
            } catch (error: any) {
                console.error('Error fetching modules and missions:', error.message);
            }
        };

        if (session?.user) {
            fetchModulesAndMissions();
        }
    }, [session, supabase]);

    const handleMissionClick = async (missionId: number) => {
        if (!session?.user?.id || !activePlanet?.id) return;
    
        // Find the mission to set as active
        const mission = availableMissions.find(m => m.id === missionId);
        if (!mission) {
            console.error('Mission not found:', missionId);
            return;
        }
    
        try {
            // Check if the user has mission 1370203
            const { data: existingMissions, error: missionsError } = await supabase
                .from('missions')
                .select('id')
                .eq('user', session.user.id)
                .eq('mission', 1370203);

            if (missionsError) throw missionsError;

            // If the user doesn't have mission 1370203, create it
            if (existingMissions.length === 0) {
                const missionData = {
                    user: session.user.id,
                    time_of_completion: new Date().toISOString(),
                    mission: 1370203,
                    configuration: null,
                    rewarded_items: [],
                };
                const { error: createMissionError } = await supabase.from('missions').insert([missionData]);

                if (createMissionError) throw createMissionError;

                console.log("Mission 1370203 created successfully.");
            };
    
            // Update active mission in the profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ activemission: mission.id })
                .eq('id', session.user.id);
    
            if (updateError) {
                throw updateError;
            }
    
            // Set the active mission state
            setactivemission(mission);
        } catch (error: any) {
            console.error('Error setting active mission:', error.message);
        }
    };
    
    const handleSwitchClassificationTask = async () => {
        if (!session?.user?.id) return;

        try {
            // Only perform the inventory check if there's an active mission
            if (activemission?.structure) {
                // Check if the item already exists in the inventory
                const { data: inventoryItem, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('id')
                    .eq('owner', session.user.id)
                    .eq('anomaly', activePlanet.id)
                    .eq('item', activemission.structure)
                    .single();
    
                if (inventoryError && inventoryError.code !== 'PGRST116') {
                    throw inventoryError; // Handle non-404 errors
                }
    
                if (!inventoryItem) {
                    // Insert a new item into the inventory
                    const { error: insertError } = await supabase
                        .from('inventory')
                        .insert([
                            { owner: session.user.id, 
                              anomaly: activePlanet.id, 
                              item: activemission.structure,
                              configuration: "created for: first classification mission group, chapter 1", // Add configuration field
                              time_of_deploy: new Date().toISOString(),
                             },
                        ]);
                
                    if (insertError) {
                        console.error("Error inserting structure into inventory:", insertError);
                    };
                };                
            };
    
            // Reset active mission in the profile
            const { error } = await supabase
                .from('profiles')
                .update({ activemission: null })
                .eq('id', session.user.id);

            if (error) throw error;

            setactivemission(null);
        } catch (error: any) {
            console.error('Error resetting active mission:', error.message);
        }
    };

    return (
        <div>
            <h1>Available Missions</h1>
            {activemission ? (
                <div>
                    <h2>{activemission.name}</h2>
                    <p>{activemission.description}</p>
                    <button 
                        onClick={handleSwitchClassificationTask} 
                        className="block bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Switch classification task
                    </button>
                    <MissionStructureDisplay activemission={activemission.id} /> {/* Display the structure modal */}
                </div>
            ) : (
                <div>
                    {availableMissions.length > 0 ? (
                        <ul>
                            {availableMissions.map(mission => (
                                <li key={mission.id}>
                                    <h2 onClick={() => handleMissionClick(mission.id)} className="cursor-pointer">
                                        {mission.name}
                                    </h2>
                                    <p>{mission.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No missions available at this time.</p>
                    )}
                </div>
            )}
        </div>
    );
};