"use client";

import React from 'react';
import {
  zoodexDataSources,
  telescopeDataSources,
  lidarDataSources,
  physicsLabDataSources,
  roverDataSources
} from '@/app/components/(structures)/Data/ZoodexDataSources';

const filterMissionsByPlanetType = (planetType: string, dataSources: any[]) => {
    return dataSources.flatMap((source) => {
        const filteredItems = source.items.filter((item: any) => 
            item.compatiblePlanetTypes?.includes(planetType)
        );        
      console.log(`Filtered Items for ${planetType}:`, filteredItems);
      return filteredItems;
    });
  };

interface MissionListProps {
  planetType: string;
}

const MissionList: React.FC<MissionListProps> = ({ planetType }) => {
  const zoodexMissions = filterMissionsByPlanetType(planetType, zoodexDataSources);
  const telescopeMissions = filterMissionsByPlanetType(planetType, telescopeDataSources);
  const lidarMissions = filterMissionsByPlanetType(planetType, lidarDataSources);
  const physicsLabMissions = filterMissionsByPlanetType(planetType, physicsLabDataSources);
  const roverMissions = filterMissionsByPlanetType(planetType, roverDataSources);

  const missionCategories = [
    {
      id: 'zoodex',
      name: 'Zoodex Missions',
      missions: zoodexMissions.map((mission) => ({
        id: mission.id,
        title: mission.name,
        description: mission.description,
      })),
    },
    {
      id: 'telescope',
      name: 'Telescope Missions',
      missions: telescopeMissions.map((mission) => ({
        id: mission.id,
        title: mission.name,
        description: mission.description,
      })),
    },
    {
      id: 'lidar',
      name: 'Lidar Missions',
      missions: lidarMissions.map((mission) => ({
        id: mission.id,
        title: mission.name,
        description: mission.description,
      })),
    },
    {
      id: 'physicsLab',
      name: 'Physics Lab Missions',
      missions: physicsLabMissions.map((mission) => ({
        id: mission.id,
        title: mission.name,
        description: mission.description,
      })),
    },
    {
      id: 'rover',
      name: 'Rover Missions',
      missions: roverMissions.map((mission) => ({
        id: mission.id,
        title: mission.name,
        description: mission.description,
      })),
    },
  ];

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