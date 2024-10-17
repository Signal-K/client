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
        { id: 'tutorial1', title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',
          infoText: "To complete classifications, return to your planet page and click on the structure icon to review the data", route: "/",},
        {
          id: 'researchStation', title: "Create a Research Station", component: <UnownedSurfaceStructures />, inventoryStructureId: 3106,
        },
        { id: 'research', title: 'Research the launchpad', routeId: [100000042], mission: '100000042', researchStructureId: 3107, component: <AdvancedTechTreeComponent />},
        { id: 'owl', title: 'Classify some burrowing owls', routeId: [100000035], mission: '100000035',
          infoText: 'Return to the planet page and use the Zoodex structure to classify burrowing owls', route: "/",
         },
        { id: 'penguin', title: 'Take a look at some penguins', routeId: [200000010], mission: '200000010',
          infoText: 'Return to the planet page and use the Zoodex structure to classify penguins', route: "/",
         },
        { id: 'build', title: 'Build the launchpad', routeId: [100000044], mission: '100000044', inventoryStructureId: 3107, component: <UnownedSurfaceStructures />,    },
      ],
      Mars: [
        { id: 'travel', title: 'Travel to Mars', routeId: [400001], mission: '400001', },
        { id: 'fuel', title: 'Collect fuel', routeId: [200000013], mission: '200000013', route: "/mining", },
        { id: 'fuels', title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', component: <LaunchpadStatus /> },
        { id: 'telescopeResearch', title: 'Research the telescope', routeId: [200000015], mission: '200000015', researchStructureId: 3103, component: <AdvancedTechTreeComponent />,   },
        { id: 'telescope', title: 'Build a telescope', routeId: [200000015], mission: '200000015', inventoryStructureId: 3103, component: <UnownedSurfaceStructures />,   },
        { id: 'research_ph', title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
      ],
      'New Planet': [
        { id: 'discover', title: 'Discover a new planet', routeId: [30000001], mission: '30000001',
          infoText: 'Return to the planet page and click on the telescope structure to discover new planets', route: "/",
         },
        { id: 'travel_new', title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', component: <SwitchPlanet />, },
      ],
    },
    astronomer: {
      Earth: [
        { id: 'start', title: 'Start the game', routeId: [10000001], mission: '10000001', },
        { id: 'pick', title: 'Pick your first classification', routeId: [10000002], mission: '10000002', },
        { id: 'tutorial1', title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',
          infoText: "To complete classifications, return to your planet page and click on the structure icon to review the data", route: "/", },
        {
          id: 'researchStation', title: "Create a Research Station", component: <UnownedSurfaceStructures />, inventoryStructureId: 3106,
        },
        { id: 'research', title: 'Research the launchpad', routeId: [100000042], mission: '100000042', researchStructureId: 3107, component: <AdvancedTechTreeComponent /> },
        { id: 'build', title: 'Build the launchpad', routeId: [100000044], mission: '100000044', inventoryStructureId: 3107, component: <UnownedSurfaceStructures />,    },
      ],
      Mars: [
        { id: 'travel', title: 'Travel to Mars', routeId: [400001], mission: '400001', },
        { id: 'telescopeResearch', title: 'Research the telescope', routeId: [200000015], mission: '200000015', researchStructureId: 3103, component: <AdvancedTechTreeComponent />,   },
        { id: 'telescope', title: 'Build a telescope', routeId: [200000015], mission: '200000015', inventoryStructureId: 3103, component: <UnownedSurfaceStructures />,   },
        { id: 'minor_planet', title: 'Complete the Minor Planet classification', routeId: [20000004], mission: '20000004',
          infoText: "Return to the planet page and click on the telescope structure to discover asteroid anomalies", route: "/",
         },
      ],
      Mercury: [
        { id: 'travel_mercury', title: 'Travel to Mercury', routeId: [100001], mission: '100001', },
        { id: 'sunspots', title: 'Discover sunspots', routeId: [3000003], mission: '3000003', },
        { id: 'fuel', title: 'Collect fuel', routeId: [200000013], mission: '200000013', route: "/mining", },
        { id: 'fuels', title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', component: <LaunchpadStatus /> },
        { id: 'research_ph', title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
      ],
      'New Planet': [
        { id: 'discover', title: 'Discover a new planet', routeId: [30000001], mission: '30000001',
          infoText: 'Return to the planet page and click on the telescope structure to discover new planets', route: "/",
         },
        { id: 'travel_new', title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', component: <SwitchPlanet />, },
      ],
    },
    meteorologist: {
      Earth: [
        { id: 'start', title: 'Start the game', routeId: [10000001], mission: '10000001', },
        { id: 'pick', title: 'Pick your first classification', routeId: [10000002], mission: '10000002', },
        { id: 'tutorial1', title: "Complete a tutorial for your classification", routeId: [3000001, 3000003, 3000009, 3000002, 3000004, 30000027, 3000005], mission: '3000001',
          infoText: "To complete classifications, return to your planet page and click on the structure icon to review the data", route: "/"
        },
        { id: 'telescope', title: 'Build a LIDAR module', routeId: [200000017], mission: '200000017', },
        { id: 'clouds', title: 'Classify clouds', routeId: [3000010], mission: '3000010', },
      {
        id: 'researchStation', title: "Create a Research Station", component: <UnownedSurfaceStructures />, inventoryStructureId: 3106,
      },
        { id: 'research', title: 'Research the launchpad', routeId: [100000042], mission: '100000042', researchStructureId: 3107, component: <AdvancedTechTreeComponent /> },
        { id: 'build', title: 'Build the launchpad', routeId: [100000044], mission: '100000044', inventoryStructureId: 3107, component: <UnownedSurfaceStructures />,    },
      ],
      Mars: [
        { id: 'travel', title: 'Travel to Mars', routeId: [400001], mission: '400001', },
        { id: 'cloud_data', title: 'Classify some Martian clouds', routeId: [100000034], mission: '100000034', },
        { id: 'fuel', title: 'Collect fuel', routeId: [200000013], mission: '200000013', route: "/mining", },
        { id: 'fuels', title: 'Add fuel to your rocket', routeId: [200000014], mission: '200000014', component: <LaunchpadStatus /> },
        { id: 'telescopeResearch', title: 'Research the telescope', routeId: [200000015], mission: '200000015', researchStructureId: 3103, component: <AdvancedTechTreeComponent />,  },
        { id: 'telescope', title: 'Build a telescope', routeId: [200000015], mission: '200000015', inventoryStructureId: 3103, component: <UnownedSurfaceStructures />,  },
        { id: 'research_ph', title: 'Research the Planet Hunters module', routeId: [200000016], mission: '200000016', component: <DataSourcesModal structureId="3103" structure="Telescope" /> },
      ],
      'New Planet': [
        { id: 'discover', title: 'Discover a new planet', routeId: [30000001], mission: '30000001',
          infoText: 'Return to the planet page and click on the telescope structure to discover new planets', route: "/",
         },
        { id: 'travel_new', title: 'Travel to the new planet', routeId: [300000012], mission: '300000012', component: <SwitchPlanet />, },
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
          };
        };
      };
  
      setAllMissions(allMissionsList);
      fetchCompletedMissions();
    }, [session]);
  
    const isMissionCompleted = (missionRoute: MissionRoute): boolean => {
      if (!missionRoute.mission) return false;
      return completedMissions.includes(Number(missionRoute.mission));
    };    

    const [showComponent, setShowComponent] = useState(false);

    return (
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {Object.entries(missionsData).map(([playStyle, planets]) => (
          <div key={playStyle} style={{ marginBottom: "40px" }}>
            <h1 style={{ textTransform: "capitalize", marginBottom: "20px" }}>{playStyle}</h1>
    
            {Object.entries(planets || {}).map(([planet, missions]) => (
              <div key={planet} style={{ borderLeft: `5px solid ${planetColors[planet as Planet]}`, marginBottom: "20px", paddingLeft: "10px" }}>
                <h2>{planet}</h2>
                <ul>
                  {missions?.map((missionRoute) => {
                    const [showInfo, setShowInfo] = useState(false);
                    
                    return (
                      <li key={missionRoute.id} style={{ display: "flex", flexDirection: "column", marginBottom: '20px' }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: '10px' }}>
                          <span>{missionRoute.title}</span>
                          {isMissionCompleted(missionRoute) ? (
                            <CheckCircle color="green" />
                          ) : (
                            <span style={{ color: "red" }}>Incomplete</span>
                          )}
                        </div>
                        {missionRoute.infoText && (
                          <>
                            <button onClick={() => setShowInfo(!showInfo)} style={{ marginTop: '5px' }}>
                              {showInfo ? "Read less" : "Read more"}
                            </button>
                            {showInfo && <p style={{ marginTop: '5px', color: 'grey' }}>{missionRoute.infoText}</p>}
                          </>
                        )}
                        {missionRoute.route && (
                          <Link href={missionRoute.route}>
                            <Button
                              style={{ marginTop: '10px', backgroundColor: 'blue', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}
                            >
                              Take me there
                            </Button>
                          </Link>
                        )}
                      {missionRoute.component && (
                        <>
                          <Button 
                            onClick={() => setShowComponent(!showComponent)}
                            style={{ marginTop: '10px', backgroundColor: 'blue', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}
                          >
                            {showComponent ? "Hide Component" : "Show Component"}
                          </Button>
                          {showComponent && (
                            <div style={{ marginTop: '10px' }}>
                              {missionRoute.component}
                            </div>
                          )}
                        </>
                      )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    );    
};