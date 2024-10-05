"use client";

import React from 'react';
import {
  zoodexDataSources,
  telescopeDataSources,
  lidarDataSources,
  physicsLabDataSources,
  roverDataSources
} from '@/components/Data/ZoodexDataSources';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

const filterMissionsByPlanetType = (planetType: string, dataSources: any[]) => {
    return dataSources.flatMap((source) => {
        const filteredItems = source.items.filter((item: any) => 
            item.compatiblePlanetTypes?.includes(planetType)
        );        
      return filteredItems;
    });
};

interface MissionListProps {
  planetType: string;
};

const MissionList: React.FC<MissionListProps> = ({ planetType }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const zoodexMissions = filterMissionsByPlanetType(planetType, zoodexDataSources);
    const telescopeMissions = filterMissionsByPlanetType(planetType, telescopeDataSources);
    const lidarMissions = filterMissionsByPlanetType(planetType, lidarDataSources);
    // const physicsLabMissions = filterMissionsByPlanetType(planetType, physicsLabDataSources);
    // const roverMissions = filterMissionsByPlanetType(planetType, roverDataSources);

    const missionCategories = [
        {
            id: 'zoodex',
            name: 'Animal Conservation & Tracking',
            missions: zoodexMissions.map((mission) => ({
                id: mission.id,
                title: mission.name,
                description: mission.description,
                identifier: mission.identifier,
                technology: mission.techId,
                activeStructure: mission.activeStructure,
            })),
        },
        {
            id: 'telescope',
            name: 'Space Investigations',
            missions: telescopeMissions.map((mission) => ({
                id: mission.id,
                title: mission.name,
                description: mission.description,
                identifier: mission.identifier,
                technology: mission.techId,
                activeStructure: mission.activeStructure,
            })),
        },
        {
            id: 'lidar',
            name: 'Climate & Meteorology',
            missions: lidarMissions.map((mission) => ({
                id: mission.id,
                title: mission.name,
                description: mission.description,
                identifier: mission.identifier,
                technology: mission.techId,
                activeStructure: mission.activeStructure,
            })),
        },
        // {
        //     id: 'physicsLab',
        //     name: 'Particle lab',
        //     missions: physicsLabMissions.map((mission) => ({
        //         id: mission.id,
        //         title: mission.name,
        //         description: mission.description,
        //         identifier: mission.identifier,
        //         technology: mission.techId,
        //         activeStructure: mission.activeStructure,
        //     })),
        // },
        // {
        //     id: 'rover',
        //     name: 'Surface landmarks',
        //     missions: roverMissions.map((mission) => ({
        //         id: mission.id,
        //         title: mission.name,
        //         description: mission.description,
        //         identifier: mission.identifier,
        //         technology: mission.techId,
        //         activeStructure: mission.activeStructure,
        //     })),
        // },
    ];

    const handleTravel = async (mission: any) => {
        if (!session) {
            return;
        };
    
        const techId = mission.techId || mission.technology;
    
        if (!techId) {
            console.error("Missing techId or technology for mission", mission);
            return;
        }
    
        // Ensure mission has an identifier
        if (!mission.identifier) {
            console.error("Missing mission identifier", mission);
            return;
        }
    
        // Correctly populate the configuration with the mission's identifier
        const structureCreationData = {
            owner: session.user.id,
            item: mission.activeStructure,
            quantity: 1,
            notes: "Created for user's first classification",
            anomaly: activePlanet?.id || 69,
            configuration: {
                "Uses": 10,
                "missions unlocked": [mission.identifier],  // Pass dynamic mission identifier
            },
        };
    
        const initialMissionData = {
            user: session.user.id,
            time_of_completion: new Date().toISOString(),
            mission: mission.id,
        };
    
        const researchedStructureData = {
            user_id: session.user.id,
            tech_type: mission.activeStructure,
            tech_id: techId,
            created_at: new Date().toISOString(),
        };
    
        try {
            // const { error: missionError } = await supabase
            //     .from("missions")
            //     .insert([initialMissionData]);
    
            // if (missionError) throw missionError;
    
            const { error: inventoryError } = await supabase
                .from('inventory')
                .insert([structureCreationData]);
    
            if (inventoryError) throw inventoryError;
    
            const { error: researchedError } = await supabase
                .from("researched")
                .insert([researchedStructureData]);
    
            if (researchedError) throw researchedError;
    
        } catch (error: any) {
            console.log("Error adding mission: ", error.message);
        }
    };
    
    return (    
        <div className="min-h-screen text-white p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Available Missions</h1>
            <div className="space-y-6">
                {missionCategories.map((category) => 
                    category.missions.length > 0 && (
                        <div key={category.id}>
                            <h2 className="text-xl font-semibold text-[#5FCBC3] mb-3">{category.name}</h2>
                            <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                                {category.missions.map((mission) => (
                                    <div
                                        key={mission.id}
                                        className="bg-[#FFD580] text-[#2C4F64] p-3 rounded-md min-w-[200px] hover:bg-[#D689E3] transition-colors duration-200 cursor-pointer"
                                        onClick={() => handleTravel(mission)}
                                    >
                                        <h3 className="font-medium">{mission.title}</h3>
                                        <p className="text-sm mt-1">{mission.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default MissionList;