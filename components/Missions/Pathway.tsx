"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { AdvancedTechTreeComponent } from "../Structures/Research/TechTree";
import { UnownedSurfaceStructures } from "../Structures/Build/EditMode";
import LaunchpadStatus from "../Structures/Launchpad/LaunchpadStatus";
import SwitchPlanet from "../(scenes)/travel/SolarSystem";
import { DataSourcesModal } from "../Data/unlockNewDataSources";
import Link from "next/link";
import { Button } from "../ui/button";

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
  routeId?: number[];
  mission?: string;
  researchStructureId?: number;
  inventoryStructureId?: number;
  route?: string;
  infoText?: string;
  component?: React.ReactNode;
  planet: string;
}; 

const planetColors: Record<Planet, string> = {
    Earth: "green",
    Mars: "red",
    Mercury: "grey",
    "New Planet": "#5FCBC3",
};

interface ShowState {
  [key: string]: boolean;    
}

type PlayStyle = 'biologist' | 'astronomer' | 'meteorologist';

const missionsData: Record<PlayStyle, Partial<Record<Planet, MissionRoute[]>>> = {
    biologist: {
      Earth: [
        { id: 'start', planet: "Earth", title: 'Start the game', routeId: [10000001],
          mission: '10000001',
         },
        { id: 'pick', planet: "Earth", title: 'Pick your first classification', routeId: [10000002], mission: '10000002' },
        { id: 'tutorial1', planet: "Earth", title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',
          infoText: "To complete classifications, return to your planet page and click on the structure icon to review the data", route: "/",},
        {
          id: 'researchStation', planet: "Earth", title: "Create a Research Station", component: <UnownedSurfaceStructures />, inventoryStructureId: 3106,
        },
        { id: 'research', planet: "Earth", title: 'Research the launchpad', routeId: [100000042], mission: '100000042', researchStructureId: 3107, component: <AdvancedTechTreeComponent />},
        { id: 'owl', planet: "Earth", title: 'Classify some burrowing owls', routeId: [100000035], mission: '100000035', component: <DataSourcesModal structureId="3104" structure="Zoodex" />,
          infoText: 'Return to the planet page and use the Zoodex structure to classify burrowing owls', route: "/",
         },
        { id: 'penguin', planet: "Earth", title: 'Take a look at some penguins', routeId: [200000010], mission: '200000010',  component: <DataSourcesModal structureId="3104" structure="Zoodex" />,
          infoText: 'Return to the planet page and use the Zoodex structure to classify penguins', route: "/",
         },
        { id: 'build', planet: "Earth", title: 'Build the launchpad', routeId: [100000044], mission: '100000044', inventoryStructureId: 3107, component: <UnownedSurfaceStructures />,    },
                { id: 'travel', planet: "Earth", title: 'Travel to Mars', routeId: [400001], mission: '400001', component: <SwitchPlanet /> },
      ],
      Mars: [
        { id: 'fuel', planet: "Mars", title: 'Collect fuel', routeId: [200000013], mission: '200000013', route: "/scenes/mining", },
        { id: 'fuels', planet: "Mars", title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', component: <LaunchpadStatus /> },
        { id: 'telescopeResearch', planet: "Mars", title: 'Research the telescope', routeId: [200000015], mission: '200000015', researchStructureId: 3103, component: <AdvancedTechTreeComponent />,   },
        { id: 'telescope', planet: "Mars", title: 'Build a telescope', routeId: [200000015], mission: '200000015', inventoryStructureId: 3103, component: <UnownedSurfaceStructures />,   },
        { id: 'research_ph', planet: "Mars", title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
      ],
      'New Planet': [
        { id: 'discover', planet: "New", title: 'Discover a new planet', routeId: [30000001], mission: '30000001',
          infoText: 'Return to the planet page and click on the telescope structure to discover new planets', route: "/",
         },
        { id: 'travel_new', planet: "New", title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', component: <SwitchPlanet />, },
      ],
    },
    astronomer: {
      Earth: [
        { id: 'start', planet: "Earth", title: 'Start the game', routeId: [10000001], mission: '10000001', },
        { id: 'pick', planet: "Earth", title: 'Pick your first classification', routeId: [10000002], mission: '10000002', },
        { id: 'tutorial1', planet: "Earth", title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',
          infoText: "To complete classifications, return to your planet page and click on the structure icon to review the data", route: "/", },
        {
          id: 'researchStation', planet: "Earth", title: "Create a Research Station", component: <UnownedSurfaceStructures />, inventoryStructureId: 3106,
        },
        { id: 'research', planet: "Earth", title: 'Research the launchpad', routeId: [100000042], mission: '100000042', researchStructureId: 3107, component: <AdvancedTechTreeComponent /> },
        { id: 'build', planet: "Earth", title: 'Build the launchpad', routeId: [100000044], mission: '100000044', inventoryStructureId: 3107, component: <UnownedSurfaceStructures />,    },
                { id: 'travel', planet: "Earth", title: 'Travel to Mars', routeId: [400001], mission: '400001', component: <SwitchPlanet /> },
      ],
      Mars: [
        { id: 'telescopeResearch', planet: "Mars", title: 'Research the telescope', routeId: [200000015], mission: '200000015', researchStructureId: 3103, component: <AdvancedTechTreeComponent />,   },
        { id: 'telescope', planet: "Mars", title: 'Build a telescope', routeId: [200000015], mission: '200000015', inventoryStructureId: 3103, component: <UnownedSurfaceStructures />,   },
        { id: 'minor_planet', planet: "Mars", title: 'Complete the Minor Planet classification', routeId: [20000004], mission: '20000004',
          infoText: "Return to the planet page and click on the telescope structure to discover asteroid anomalies", route: "/",
         },
      ],
      Mercury: [
        { id: 'travel_mercury', planet: "Mercury", title: 'Travel to Mercury', routeId: [100001], mission: '100001', component: <SwitchPlanet />, },
        { id: 'sunspots', planet: "Mercury", title: 'Discover sunspots', routeId: [3000003], mission: '3000003', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
        { id: 'fuel', planet: "Mercury", title: 'Collect fuel', routeId: [200000013], mission: '200000013', route: "/scenes/mining", },
        { id: 'fuels', planet: "Mercury", title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', component: <LaunchpadStatus /> },
        { id: 'research_ph', planet: "Mercury", title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
      ],
      'New Planet': [
        { id: 'discover', planet: "New", title: 'Discover a new planet', routeId: [30000001], mission: '30000001',
          infoText: 'Return to the planet page and click on the telescope structure to discover new planets', route: "/",
         },
        { id: 'travel_new', planet: "New", title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', component: <SwitchPlanet />, },
      ],
    },
    meteorologist: {
      Earth: [
        { id: 'start', planet: "Earth", title: 'Start the game', routeId: [10000001], mission: '10000001', },
        { id: 'pick', planet: "Earth", title: 'Pick your first classification', routeId: [10000002], mission: '10000002', },
        { id: 'tutorial1', planet: "Earth", title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',
          infoText: "To complete classifications, return to your planet page and click on the structure icon to review the data", route: "/"
        },
        { id: 'telescope', planet: "Earth", title: 'Build a LIDAR module', routeId: [200000017], mission: '200000017', component: <UnownedSurfaceStructures />, },
        { id: 'clouds', planet: "Earth", title: 'Classify clouds', routeId: [3000010], mission: '3000010', component: <DataSourcesModal structureId="3105" structure="LIDAR" />, },
      {
        id: 'researchStation', planet: "Earth", title: "Create a Research Station", component: <UnownedSurfaceStructures />, inventoryStructureId: 3106,
      },
        { id: 'research', planet: "Earth", title: 'Research the launchpad', routeId: [100000042], mission: '100000042', researchStructureId: 3107, component: <AdvancedTechTreeComponent /> },
        { id: 'build', planet: "Earth", title: 'Build the launchpad', routeId: [100000044], mission: '100000044', inventoryStructureId: 3107, component: <UnownedSurfaceStructures />,    },
                { id: 'travel', planet: "Earth", title: 'Travel to Mars', routeId: [400001], mission: '400001', component: <SwitchPlanet /> },
      ],
      Mars: [
        { id: 'cloud_data', planet: "Mars", title: 'Classify some Martian clouds', routeId: [100000034], mission: '100000034', component: <DataSourcesModal structureId="3105" structure="LIDAR" />, },
        { id: 'fuel', planet: "Mars", title: 'Collect fuel', routeId: [200000013], mission: '200000013', route: "/scenes/mining", },
        { id: 'fuels', planet: "Mars", title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', component: <LaunchpadStatus /> },
        { id: 'telescopeResearch', planet: "Mars", title: 'Research the telescope', routeId: [200000015], mission: '200000015', researchStructureId: 3103, component: <AdvancedTechTreeComponent />,  },
        { id: 'telescope', planet: "Mars", title: 'Build a telescope', routeId: [200000015], mission: '200000015', inventoryStructureId: 3103, component: <UnownedSurfaceStructures />,  },
        { id: 'research_ph', planet: "Mars", title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
      ],
      'New Planet': [
        { id: 'discover', planet: "New", title: 'Discover a new planet', routeId: [30000001], mission: '30000001',
          infoText: 'Return to the planet page and click on the telescope structure to discover new planets', route: "/",
         },
        { id: 'travel_new', planet: "New", title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', component: <SwitchPlanet />, },
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

export default function MissionPathway() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [allMissions, setAllMissions] = useState<MissionRoute[]>([]);
  const [selectedPlayStyle, setSelectedPlayStyle] = useState<PlayStyle | null>(null);
  const [filteredMissions, setFilteredMissions] = useState<MissionRoute[]>([]);
  const [showInfo, setShowInfo] = useState<ShowState>({}); 
  const [showComponent, setShowComponent] = useState<ShowState>({}); 

  const handlePlayStyleSelect = (playStyle: PlayStyle) => {
      setSelectedPlayStyle(playStyle);
  };

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

  const isMissionCompleted = (missionRoute: MissionRoute): boolean => {
      if (!missionRoute.mission) return false;
      return completedMissions.includes(Number(missionRoute.mission));
  };

  useEffect(() => {
      const fetchMissionsByPlayStyle = () => {
          if (!selectedPlayStyle) return;

          const missionsList = missionsData[selectedPlayStyle];
          if (missionsList) {
              const allMissionsList: MissionRoute[] = [];
              for (const planet in missionsList) {
                  const planetMissions = missionsList[planet as Planet];
                  if (planetMissions) {
                      allMissionsList.push(...planetMissions);
                  }
              }
              setFilteredMissions(allMissionsList);
          }
      };

      fetchMissionsByPlayStyle();
  }, [selectedPlayStyle]);

  return (
    <div className="bg-[#1D2833] text-[#F7F5E9] p-4 md:p-8 relative overflow-hidden">
      <h1 className="text-3xl font-bold mb-8 text-center">Mission Progression</h1>
  
      {!selectedPlayStyle ? (
        <div className="space-y-4 max-w-screen-sm mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Choose your play style:</h2>
          <button
            onClick={() => handlePlayStyleSelect('biologist')}
            className="block w-full p-4 bg-[#2C4F64] hover:bg-[#383F51] rounded-lg transition-colors"
          >
            Biologist
          </button>
          <button
            onClick={() => handlePlayStyleSelect('astronomer')}
            className="block w-full p-4 bg-[#2C4F64] hover:bg-[#383F51] rounded-lg transition-colors"
          >
            Astronomer
          </button>
          <button
            onClick={() => handlePlayStyleSelect('meteorologist')}
            className="block w-full p-4 bg-[#2C4F64] hover:bg-[#383F51] rounded-lg transition-colors"
          >
            Meteorologist
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-screen-md mx-auto">
{filteredMissions.map((mission) => (
  <div
    key={mission.id}
    className={`p-2 md:p-4 overflow-y-auto rounded-lg shadow-lg transition-all hover:shadow-xl relative border-l-4 md:border-l-8 ${
      showComponent[mission.id] ? 'flex flex-col' : 'flex flex-col md:flex-row items-center justify-between'
    }`} 
    style={{
      borderColor:
        mission.planet === 'Earth'
          ? 'green'
          : mission.planet === 'Mercury'
          ? 'lightgray'
          : mission.planet === 'Mars'
          ? 'red'
          : 'lightgreen',
    }}
  >
    {!showComponent[mission.id] && (
      <>
        <div className="flex-1 w-full md:w-auto flex flex-col items-center md:items-start">
          <h2
            className={`text-lg md:text-xl font-semibold text-center md:text-left ${
              isMissionCompleted(mission) ? 'line-through' : ''
            }`}
          >
            {mission.title}
          </h2>
          <div className="flex items-center justify-center md:justify-start mt-1 md:mt-2">
            {isMissionCompleted(mission) ? (
              <CheckCircle color="green" />
            ) : (
              <span className="text-red-500 font-bold">Incomplete</span>
            )}
          </div>
        </div>

        {mission.infoText && (
          <div className="flex-1 w-full md:w-auto text-center mt-2 md:mt-0 md:ml-4">
            <button
              onClick={() =>
                setShowInfo((prev) => ({
                  ...prev,
                  [mission.id]: !prev[mission.id],
                }))
              }
              className="mt-2 px-4 py-2 bg-gray-700 text-sm text-white rounded-full hover:bg-gray-600"
            >
              {showInfo[mission.id] ? 'Read less' : 'Read more'}
            </button>
            {showInfo[mission.id] && (
              <p className="mt-2 text-sm text-gray-300">{mission.infoText}</p>
            )}
          </div>
        )}
      </>
    )}

    <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:space-x-2">
      {mission.route && (
        <Link legacyBehavior href={mission.route}>
          <a>
            <button className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              Take me there
            </button>
          </a>
        </Link>
      )}

      {mission.component && (
        <button
  onClick={() => {
    setShowComponent((prev) => ({
      ...prev, 
      [mission.id]: !prev[mission.id], 
    }));
  }}
  className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 mt-2 md:mt-0"
>
  {showComponent[mission.id] ? 'Hide action' : 'Show action'}
</button>
      )}
    </div>

    {mission.component && showComponent[mission.id] && (
      <div className="w-full mt-6 flex justify-center">
        <div className="w-full md:max-w-lg">
          {mission.component}
        </div>
      </div>
    )}
  </div>
))}
        </div>
      )}
    </div>
  );  
};