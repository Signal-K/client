"use client";

import { SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import MissionList from "./availableMissions";
import { Button } from "antd";

const planetTypeColors: { [key: string]: string } = {
  Lush: "#4CAF50",    
  Arid: "#FF9800",      
  Hellhole: "#FF5722", 
  Frozen: "#03A9F4",     
  "GasGiant": "#9C27B0",
  Rocky: "#795548",     
  "IceGiant": "#00BCD4" 
}; 

interface Planet {
  id: number;
  name: string;
  color: string;
  stats: {
    gravity: string;
    temp: string;
  };
  anomaly: number;
  initialisationMissionId: number | null;
  planetType: string; 
}

const planets = [
  {
    id: 10,
    name: "Mercury",
    color: "bg-gray-400",
    stats: { gravity: "3.7 m/s²", temp: "430°C" },
    anomaly: 10,
    planetType: 'Arid',
    initialisationMissionId: 100001,
  },
  {
    id: 20,
    name: "Venus",
    color: "bg-yellow-200",
    stats: { gravity: "8.87 m/s²", temp: "462°C" },
    anomaly: 20,
    planetType: 'Arid',
    initialisationMissionId: 200001,
  },
  {
    id: 69,
    name: "Earth",
    color: "bg-blue-500",
    stats: { gravity: "9.8 m/s²", temp: "15°C" },
    anomaly: 69,
    planetType: 'Lush',
    initialisationMissionId: 300001,
  },
  // {
  //   id: 31,
  //   name: "Moon",
  //   color: "bg-gray-300",
  //   stats: { gravity: "1.62 m/s²", temp: "-53°C" },
  //   anomaly: 31,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  // },
  {
    id: 40,
    name: "Mars",
    color: "bg-red-500",
    stats: { gravity: "3.71 m/s²", temp: "-63°C" },
    anomaly: 40,
    planetType: 'Arid',
    initialisationMissionId: 400001,
  },
  {
    id: 50,
    name: "Jupiter",
    color: "bg-orange-300",
    stats: { gravity: "24.79 m/s²", temp: "-108°C" },
    anomaly: 50,
    planetType: 'Arid',
    initialisationMissionId: null,
  },
  {
    id: 55,
    name: "Europa",
    color: "bg-blue-200",
    stats: { gravity: "1.31 m/s²", temp: "-160°C" },
    anomaly: 51,
    planetType: 'Arid',
    initialisationMissionId: null,
  },
  {
    id: 52,
    name: "Io",
    color: "bg-yellow-400",
    stats: { gravity: "1.79 m/s²", temp: "-143°C" },
    anomaly: 52,
    planetType: 'Arid',
    initialisationMissionId: null,
  },
  {
    id: 51,
    name: "Amalthea",
    color: "bg-red-400",
    stats: { gravity: "0.026 m/s²", temp: "-113°C" },
    anomaly: 53,
    planetType: 'Arid',
    initialisationMissionId: null,
  },
  {
    id: 60,
    name: "Saturn",
    color: "bg-yellow-600",
    stats: { gravity: "10.44 m/s²", temp: "-139°C" },
    anomaly: 60,
    planetType: 'Arid',
    initialisationMissionId: 600001,
  },
  {
    id: 61,
    name: "Enceladus",
    color: "bg-white",
    stats: { gravity: "0.113 m/s²", temp: "-201°C" },
    anomaly: 61,
    planetType: 'Arid',
    initialisationMissionId: null,
  },
  {
    id: 70,
    name: "Uranus",
    color: "bg-cyan-300",
    stats: { gravity: "8.69 m/s²", temp: "-197°C" },
    anomaly: 70,
    planetType: 'Arid',
    initialisationMissionId: 700001,
  },
  {
    id: 80,
    name: "Neptune",
    color: "bg-blue-700",
    stats: { gravity: "11.15 m/s²", temp: "-214°C" },
    anomaly: 80,
    planetType: 'Arid',
    initialisationMissionId: 800001,
  },
];

const usePlanetSwitcher = (initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextPlanet = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % planets.length);
  };

  const prevPlanet = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + planets.length) % planets.length);
  };

  return {
    currentPlanet: planets[currentIndex],
    nextPlanet,
    prevPlanet,
    currentIndex,
  };
};

export function PlanetSwitcher() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet, updatePlanetLocation } = useActivePlanet();

  const [visitedPlanets, setVisitedPlanets] = useState<{ [key: number]: boolean }>({});
  const [planetStats, setPlanetStats] = useState<any[]>([]);
  const [classificationsByPlanet, setClassificationsByPlanet] = useState<Record<number, any[]>>({});
  const [hasRocket, setHasRocket] = useState<boolean>(false);
  const [availableMissions, setAvailableMissions] = useState<any[]>([]);

  const { currentPlanet, nextPlanet, prevPlanet, currentIndex } = usePlanetSwitcher();

  useEffect(() => {
    const fetchVisitedPlanets = async () => {
      if (session?.user?.id) {
        try {
          const { data: missions, error } = await supabase
            .from('missions')
            .select('mission')
            .eq('user', session.user.id);

          if (error) throw error;

          const visited = missions.reduce((acc: { [key: number]: boolean }, mission: { mission: number }) => {
            acc[mission.mission] = true;
            return acc;
          }, {});

          setVisitedPlanets(visited);
        } catch (error: any) {
          console.error('Error fetching missions:', error.message);
        }
      }
    };

    const fetchPlanetStats = async () => {
      try {
        const response = await fetch('/api/gameplay/missions/planets/solarsystem/stats');
        const data = await response.json();
        setPlanetStats(data);
      } catch (error) {
        console.error('Error fetching planet stats:', error);
      };
    };

    const fetchClassifications = async () => {
      if (session?.user?.id) {
        try {
          const { data: classificationsData, error } = await supabase
            .from('classifications')
            .select('classificationtype, classificationConfiguration')
            .eq('author', session.user.id);

          if (error) throw error;

          const classificationsByPlanetTemp: Record<number, any[]> = {};

          classificationsData.forEach((classification: any) => {
            const planetAnomaly = parseInt(classification.classificationConfiguration.activePlanet, 10);

            if (!classificationsByPlanetTemp[planetAnomaly]) {
              classificationsByPlanetTemp[planetAnomaly] = [];
            }

            classificationsByPlanetTemp[planetAnomaly].push(classification);
          });

          setClassificationsByPlanet(classificationsByPlanetTemp);
        } catch (error: any) {
          console.error('Error fetching classifications:', error.message);
        }
      }
    };

    const checkRocketInInventory = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('inventory')
            .select('id')
            .eq('item', 3108)
            .eq('anomaly', activePlanet?.id)
            .eq('owner', session.user.id);

          if (error) throw error;

          setHasRocket(data.length > 0);
        } catch (error: any) {
          console.error('Error checking inventory:', error.message);
        }
      }
    };

    fetchVisitedPlanets();
    fetchPlanetStats();
    fetchClassifications();
    checkRocketInInventory();
  }, [session, supabase, activePlanet]);

  const moveItemsToNewPlanet = async (newPlanetId: number) => {
    if (session?.user?.id) {
      const itemsToMove = [3108, 3107];

      try {
        await Promise.all(
          itemsToMove.map(async (itemId) => {
            const { data, error } = await supabase
              .from('inventory')
              .update({ anomaly: newPlanetId })
              .eq('item', itemId)
              .eq('owner', session.user.id);

            if (error) throw error;
            return data;
          })
        );
      } catch (error: any) {
        console.error('Error moving items:', error.message);
      }
    }
  };

  const handlePlanetClick = async (planet: any) => {
    if (planet.anomaly !== activePlanet?.id) {
      const { error: missonsError } = await supabase
        .from('missions')
        .insert([initialisePlanetMissionData]);

      await moveItemsToNewPlanet(planet.anomaly);
      updatePlanetLocation(planet.anomaly);
    };
  };

  const isVisited = classificationsByPlanet[currentPlanet.anomaly]?.length > 0;
  const planetDetails = planetStats?.find((planet) => planet.id === currentPlanet.initialisationMissionId);
  const initialisationMission = currentPlanet.initialisationMissionId;

  const initialisePlanetMissionData = {
    user: session?.user.id,
    time_of_completion: new Date().toISOString(),
    mission: initialisationMission,
};

  return (
    <div className="flex items-center justify-center text-white p-4">
      <div className="w-full max-w-md">
        <div className="">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlanet.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#303F51] rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevPlanet}
                  className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                  aria-label="Previous planet"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold flex items-center">
                  <Globe className={`mr-2 ${currentPlanet.color}`} />
                  {currentPlanet.name}
                </h2>
                <button
                  onClick={nextPlanet}
                  className="p-2 rounded-full bg-[#5FCBC3] hover:bg-[#FFD580] transition-colors"
                  aria-label="Next planet"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(currentPlanet.stats).map(([key, value]) => (
                  <div key={key} className="bg-[#2C4F64] p-2 rounded">
                    <p className="text-xs uppercase text-gray-200">{key}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <ul>
                  <li>
                    {currentPlanet.anomaly !== activePlanet?.id && (
                      <Button className="px-4 py-2 bg-cyan-500 text-white rounded-lg" onClick={() => handlePlanetClick(currentPlanet)}>Travel to {currentPlanet.name}</Button>
                    )}
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                {currentPlanet.anomaly === activePlanet?.id ? null : isVisited ? (
                  <div>
                    <h3 className="text-lg font-semibold">Planet Details</h3>
                    {planetDetails ? (
                      <ul>
                        <li>
                          <strong>Planet Type:</strong>{' '}
                          <span
                            style={{
                              backgroundColor: planetTypeColors[planetDetails.planetType] || '#607D8B',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#fff',
                            }}
                          >
                            {planetDetails.planetType || 'Unknown'}
                          </span>
                        </li>
                      </ul>
                    ) : (
                      <p>Loading planet details...</p>
                    )}
                  </div>
                ) : (
                  <p>You haven't visited this planet yet.</p>
                )}
              </div>
                            {planetDetails?.planetType ? (
  <MissionList planetType={planetDetails.planetType} />
) : (
  <p>Planet type information not available.</p>
)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}