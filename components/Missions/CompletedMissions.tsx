"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

type Planet = "Earth" | "Mars" | "Mercury" | "New Planet";
type Mission = {
  mission: string;
  id: string;
  name: string;
  planet: Planet;
};

type MissionRoute = {
    id: string;
    title: string;
    routeId: number[];
    mission: string;
}; 

const planetColors: Record<Planet, string> = {
    Earth: "green",
    Mars: "red",
    Mercury: "grey",
    "New Planet": "#5FCBC3",
  };

type PlayStyle = 'biologist' | 'astronomer' | 'meteorologist';

const missionsData: Record<PlayStyle, Partial<Record<Planet, MissionRoute[]>>> = {
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
        { id: 'travel', title: 'Travel to Mars', routeId: [400001], mission: '400001', },
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
        { id: 'travel', title: 'Travel to Mars', routeId: [400001], mission: '400001', },
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
        { id: 'travel', title: 'Travel to Mars', routeId: [400001], mission: '400001', },
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

const PlanetIcon: React.FC<{ planet: Planet }> = ({ planet }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill={planetColors[planet]}
      stroke="#F7F5E9"
      strokeWidth="2"
    />
    {planet === "Earth" && (
      <path
        d="M6 12 Q12 6, 18 12 Q12 18, 6 12"
        fill="none"
        stroke="#85DDA2"
        strokeWidth="2"
      />
    )}
    {planet === "Mars" && <circle cx="9" cy="9" r="3" fill="#FFE3BA" />}
    {planet === "Mercury" && (
      <path d="M9 9 L15 15 M15 9 L9 15" stroke="#303F51" strokeWidth="2" />
    )}
    {planet === "New Planet" && (
      <path d="M12 6 L12 18 M6 12 L18 12" stroke="#F7F5E9" strokeWidth="2" />
    )}
  </svg>
);

export default function CompletedMissions() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [allMissions, setAllMissions] = useState<MissionRoute[]>([]);
  
    useEffect(() => {
      const fetchCompletedMissions = async () => {
        if (!session) return;
        try {
          const { data, error } = await supabase
            .from('missions')
            .select('mission')
            .eq('user', session.user.id);
  
          if (error) throw error;
  
          const completedMissionIds = data.map((missionEntry: { mission: number }) => missionEntry.mission);
          setCompletedMissions(completedMissionIds);
        } catch (error) {
          console.error("Error fetching completed missions", error);
        }
      };
  
      const allMissionsList: MissionRoute[] = [];
      for (const playStyle in missionsData) {
        for (const planet in missionsData[playStyle as PlayStyle]) {
          const planetMissions = missionsData[playStyle as PlayStyle][planet as Planet];
          if (planetMissions) {
            allMissionsList.push(...planetMissions);
          }
        }
      }
  
      setAllMissions(allMissionsList);
      fetchCompletedMissions();
    }, [session]);
  
    const getMissionStatus = (mission: MissionRoute) => {
      const isCompleted = completedMissions.includes(parseInt(mission.mission));
      return {
        title: mission.title,
        isCompleted,
        missionId: mission.id,
      };
    };
  
    const renderMission = (mission: MissionRoute, planet: Planet) => {
        const missionStatus = getMissionStatus(mission);
        return (
          <li
            key={`${planet}-${missionStatus.missionId}`}
            style={{
              color: planetColors[planet],
              textDecoration: missionStatus.isCompleted ? 'line-through' : 'none',
              padding: "5px 0",
            }}
          >
            {missionStatus.isCompleted ? (
              <CheckCircle color="green" style={{ marginRight: "8px" }} />
            ) : (
              <CheckCircle color="gray" style={{ marginRight: "8px" }} />
            )}
            {missionStatus.title}
          </li>
        );
    };      
  
    return (
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {Object.keys(missionsData).map((playStyleKey) => (
          <div key={playStyleKey} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>{playStyleKey.toUpperCase()}</h2>
            {Object.keys(missionsData[playStyleKey as PlayStyle] ?? {}).map((planetKey) => (
              <div key={planetKey} style={{ marginBottom: '15px' }}>
                <h3 style={{ color: planetColors[planetKey as Planet], textAlign: 'center', marginBottom: '5px' }}>
                  {planetKey}
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {missionsData[playStyleKey as PlayStyle][planetKey as Planet]?.map((mission) =>
                    renderMission(mission, planetKey as Planet)
                  )}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
};