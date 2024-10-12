'use client'

import React, { useEffect, useState } from 'react'
import { ChevronRight, ChevronDown, X } from 'lucide-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

type PlayStyle = 'biologist' | 'astronomer' | 'meteorologist';
type Planet = 'Earth' | 'Mars' | 'Mercury' | 'New Planet';
type Mission = {
  id: string;
  title: string;
  routeId: number[];
  mission: string;
};

const missionsData: Record<PlayStyle, Partial<Record<Planet, Mission[]>>> = {
  biologist: {
    Earth: [
      { id: 'start', title: 'Start the game', routeId: [10000001],
        mission: '10000001',
       },
      { id: 'pick', title: 'Pick your first classification', routeId: [10000002], mission: '10000002' },
      { id: 'tutorial1', title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',},
      { id: 'research', title: 'Research the launchpad', routeId: [100000042], mission: '100000042'},
      { id: 'owl', title: 'Classify some burrowing owls', routeId: [100000035], mission: '100000035', },
      { id: 'penguin', title: 'Take a look at some penguins', routeId: [200000010], mission: '200000010', },
      { id: 'build', title: 'Build the launchpad', routeId: [100000044], mission: '100000044', },
    ],
    Mars: [
      { id: 'travel', title: 'Travel to Mars', routeId: [3000011], mission: '3000011', },
      { id: 'fuel', title: 'Collect fuel', routeId: [200000013], mission: '200000013' },
      { id: 'fuels', title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', },
      { id: 'telescope', title: 'Build a telescope', routeId: [200000015], mission: '200000015', },
      { id: 'research_ph', title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', },
    ],
    'New Planet': [
      { id: 'discover', title: 'Discover a new planet', routeId: [30000001], mission: '30000001', },
      { id: 'travel_new', title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', },
    ],
  },
  astronomer: {
    Earth: [
      { id: 'start', title: 'Start the game', routeId: [10000001], mission: '10000001', },
      { id: 'pick', title: 'Pick your first classification', routeId: [10000002], mission: '10000002', },
      { id: 'tutorial1', title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001', },
      { id: 'research', title: 'Research the launchpad', routeId: [100000042], mission: '100000042', },
      { id: 'build', title: 'Build the launchpad', routeId: [100000044], mission: '100000044', },
    ],
    Mars: [
      { id: 'travel', title: 'Travel to Mars', routeId: [3000011], mission: '3000011', },
      { id: 'telescope', title: 'Build a telescope', routeId: [200000015], mission: '200000015', },
      { id: 'minor_planet', title: 'Complete the Minor Planet classification', routeId: [20000004], mission: '20000004', },
    ],
    Mercury: [
      { id: 'travel_mercury', title: 'Travel to Mercury', routeId: [100001], mission: '100001', },
      { id: 'sunspots', title: 'Discover sunspots', routeId: [3000003], mission: '3000003', },
      { id: 'fuel', title: 'Collect fuel', routeId: [200000013], mission: '200000013', },
      { id: 'research_ph', title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', },
    ],
    'New Planet': [
      { id: 'discover', title: 'Discover a new planet', routeId: [30000001], mission: '30000001', },
      { id: 'travel_new', title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', },
    ],
  },
  meteorologist: {
    Earth: [
      { id: 'start', title: 'Start the game', routeId: [10000001], mission: '10000001', },
      { id: 'pick', title: 'Pick your first classification', routeId: [10000002], mission: '10000002', },
      { id: 'tutorial1', title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001'},
      { id: 'research', title: 'Research the launchpad', routeId: [100000042], mission: '100000042', },
      { id: 'build', title: 'Build the launchpad', routeId: [100000044], mission: '100000044', },
      { id: 'clouds', title: 'Classify clouds', routeId: [3000010], mission: '3000010', },
    ],
    Mars: [
      { id: 'travel', title: 'Travel to Mars', routeId: [3000011], mission: '3000011', },
      { id: 'telescope', title: 'Build a LIDAR module', routeId: [200000017], mission: '200000017', },
      { id: 'cloud_data', title: 'Classify some Martian clouds', routeId: [100000034], mission: '100000034', },
      { id: 'fuel', title: 'Collect fuel', routeId: [200000013], mission: '200000013', },
      { id: 'telescope', title: 'Build a telescope', routeId: [200000015], mission: '200000015', },
      { id: 'research_ph', title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', },
    ],
    'New Planet': [
      { id: 'discover', title: 'Discover a new planet', routeId: [30000001], mission: '30000001', },
      { id: 'travel_new', title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', },
    ],
  },
};

const planetColors: Record<Planet, string> = {
  Earth: '#2C4F64',
  Mars: '#B9E678',
  Mercury: '#FFE3BA',
  'New Planet': '#5FCBC3',
};

const PlanetIcon: React.FC<{ planet: Planet }> = ({ planet }) => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill={planetColors[planet]} stroke="#F7F5E9" strokeWidth="2" />
    {planet === 'Earth' && (
      <path
        d="M10 20 Q20 10, 30 20 Q20 30, 10 20"
        fill="none"
        stroke="#85DDA2"
        strokeWidth="2"
      />
    )}
    {planet === 'Mars' && (
      <circle cx="15" cy="15" r="5" fill="#FFE3BA" />
    )}
    {planet === 'Mercury' && (
      <path
        d="M15 15 L25 25 M25 15 L15 25"
        stroke="#303F51"
        strokeWidth="2"
      />
    )}
    {planet === 'New Planet' && (
      <path
        d="M20 10 L20 30 M10 20 L30 20"
        stroke="#F7F5E9"
        strokeWidth="2"
      />
    )}
  </svg>
);

export function MissionProgressionComponent() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [playStyle, setPlayStyle] = useState<PlayStyle | null>(null);
  const [missions, setMissions] = useState<Record<Planet, Mission[]> | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set()); // Track completed missions

  useEffect(() => {
    if (session) {
      fetchMissions();
      fetchCompletedMissions();
    }
  }, [session]);

  const handlePlayStyleSelect = (style: PlayStyle) => {
    setPlayStyle(style);
    const selectedMissions = missionsData[style] || {}; 
    setMissions(selectedMissions as Record<Planet, Mission[]>); 
    setSelectedMission(null);
  };

  const handleMissionClick = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleSwitchPlayStyle = () => {
    setPlayStyle(null);
    setSelectedMission(null);
  };

  const handleCloseSecondary = () => {
    setSelectedMission(null);
  };

  const fetchMissions = async () => {
    if (!session || !playStyle) return;

    const { data: fetchedMissions, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user', session.user.id);

    if (error) {
      console.error('Error fetching missions:', error);
      return;
    }

    if (fetchedMissions) {
      const missionsByPlanet: Record<Planet, Mission[]> = {
        Earth: [],
        Mars: [],
        Mercury: [],
        'New Planet': [],
      };

      // Merging fetched missions with existing play style data
      fetchedMissions.forEach((mission: Mission) => {
        // const planet = mission.routeId[0] as unknown as Planet;
        const planet = mission.mission as unknown as Planet;
        if (missionsByPlanet[planet]) {
          const updatedMission = missionsData[playStyle]?.[planet]?.find(m => m.id === mission.id);
          if (updatedMission) {
            missionsByPlanet[planet].push(updatedMission);
          }
        }
      });

      setMissions(missionsByPlanet);
    }
  };

  // Fetch completed missions for the user
  const fetchCompletedMissions = async () => {
    if (!session) return;

    const { data: inventoryData, error } = await supabase
      .from('missions')
      .select('mission')
      .eq('user', session.user.id);

    if (error) {
      console.error('Error fetching inventory data:', error);
      return;
    }

    if (inventoryData) {
      const completed = new Set(inventoryData.map((item: { mission: string }) => item.mission));
      setCompletedMissions(completed);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D2833] text-[#F7F5E9] p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q50,0 100,50 T200,50" fill="none" stroke="#2C3A4A" strokeWidth="2" />
          <path d="M0,100 Q50,50 100,100 T200,100" fill="none" stroke="#5FCBC3" strokeWidth="2" />
          <circle cx="80%" cy="20%" r="50" fill="#303F51" opacity="0.5" />
          <rect x="10%" y="70%" width="100" height="100" fill="#74859A" opacity="0.3" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-8 relative z-10">Mission Progression</h1>

      {!playStyle ? (
        <div className="space-y-4 relative z-10">
          <h2 className="text-xl font-semibold mb-4">Choose your play style:</h2>
          <button
            onClick={() => handlePlayStyleSelect('biologist')}
            className="block w-full p-4 bg-[#2C4F64] hover:bg-[#303F51] rounded-lg transition-colors"
          >
            Biologist
          </button>
          <button
            onClick={() => handlePlayStyleSelect('astronomer')}
            className="block w-full p-4 bg-[#2C4F64] hover:bg-[#303F51] rounded-lg transition-colors"
          >
            Astronomer
          </button>
          <button
            onClick={() => handlePlayStyleSelect('meteorologist')}
            className="block w-full p-4 bg-[#2C4F64] hover:bg-[#303F51] rounded-lg transition-colors"
          >
            Meteorologist
          </button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="flex-1 space-y-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{playStyle.charAt(0).toUpperCase() + playStyle.slice(1)} Missions</h2>
              <button
                onClick={handleSwitchPlayStyle}
                className="px-4 py-2 bg-[#2C4F64] text-white rounded-full hover:bg-[#303F51]"
              >
                Switch Playstyle
              </button>
            </div>
            {missions && Object.keys(missions).map((planetKey) => {
              const planet = planetKey as Planet;
              return (
                <div key={planet}>
                  <h3 className="text-xl font-bold">{planet}</h3>
                  <div className="space-y-4">
                    {missions[planet]?.map((mission) => {
                      const isCompleted = completedMissions.has(mission.id);
                      return (
                        <div
                          key={mission.id}
                          onClick={() => handleMissionClick(mission)}
                          className={`flex items-center justify-between p-4 rounded-lg cursor-pointer ${isCompleted ? 'bg-green-600' : 'bg-gray-600'} transition-colors`}
                        >
                          <div className="flex items-center">
                            <span className={`mr-2 ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                              {isCompleted ? '✔️' : '❌'}
                            </span>
                            <span>{mission.title}</span>
                          </div>
                          <ChevronRight />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}