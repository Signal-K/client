"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, ThermometerSun, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { lidarDataSources, physicsLabDataSources, roverDataSources, telescopeDataSources, zoodexDataSources } from "@/components/Data/ZoodexDataSources";

const planets = {
    solarSystem: [
        {
            id: 10,
            name: "Mercury",
            color: "bg-[#2C3A4A]",
            stats: { gravity: "3.7 m/s²", temp: "430°C" },
            anomaly: 10,
            planetType: 'Arid',
            initialisationMissionId: 100001,
            travelTime: '30 seconds',
            description: '', 
            image: '/assets/Planets/Mercury.png',
        },
        {
            id: 20,
            name: "Venus",
            color: "bg-yellow-200",
            stats: { gravity: "8.87 m/s²", temp: "462°C" },
            anomaly: 20,
            planetType: 'Arid',
            initialisationMissionId: 200001,
            travelTime: '30 seconds',
            description: '',
            image: '/assets/Planets/Venus.png',
        },
        {
            id: 69,
            name: "Earth",
            color: "bg-blue-500",
            stats: { gravity: "9.8 m/s²", temp: "15°C" },
            anomaly: 69,
            planetType: 'Lush',
            initialisationMissionId: 300001,
            travelTime: '30 seconds',
            description: '', 
            image: '/assets/Planets/Earth.png',
        },
        {
            id: 40,
            name: "Mars",
            color: "bg-red-500",
            stats: { gravity: "3.71 m/s²", temp: "-63°C" },
            anomaly: 40,
            planetType: 'Arid',
            initialisationMissionId: 400001,
            travelTime: '30 seconds',
            description: '', 
            image: '/assets/Planets/Mars.png',
        },
    ],
    exoplanets: [
        // should only show `anomalies` discovered by user
    ],
};

// ^^ update this to pull from `anomalies` table
export default function SwitchPlanet() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet, updatePlanetLocation } = useActivePlanet();

  const [activeTab, setActiveTab] = useState<"solarSystem" | "exoplanets">("solarSystem");
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPlanets = planets[activeTab];
  const currentPlanet = currentPlanets[currentIndex];

  const [planetStats, setPlanetStats] = useState<any[]>([]);
  const [visitedPlanets, setVisitedPlanets] = useState<{ [key: number]: boolean }>({});
  const [classificationsByPlanet, setClassificationsByPlanet] = useState<Record<number, any[]>>({});
  const [hasRocket, setHasRocket] = useState<boolean>(false);

  const [showMissions, setShowMissions] = useState<boolean>(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [compatibleMissions, setCompatibleMissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchVisitedPlanets = async () => {
      if (!session) return;

      try {
        const { data: missionsData, error } = await supabase
          .from("missions")
          .select("mission")
          .eq("user", session.user.id);

        if (error) throw error;

        const visited = missionsData.reduce(
          (acc: { [key: number]: boolean }, mission: { mission: number }) => {
            acc[mission.mission] = true;
            return acc;
          },
          {}
        );

        setVisitedPlanets(visited);
      } catch (error: any) {
        console.error("Error fetching visited planets: ", error.message);
      }
    };

    const fetchPlanetStats = async () => {
      try {
        const response = await fetch("/api/gameplay/missions/planets/solarsystem/stats");
        const data = await response.json();
        setPlanetStats(data);
      } catch (error) {
        console.error("Error fetching planet stats:", error);
      }
    };

    const fetchClassifications = async () => {
      if (session?.user?.id) {
        try {
          const { data: classificationsData, error } = await supabase
            .from("classifications")
            .select("classificationtype, classificationConfiguration")
            .eq("author", session.user.id);

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
          console.error("Error fetching classifications:", error.message);
        }
      }
    };

    const checkRocketInInventory = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from("inventory")
            .select("id")
            .eq("item", 3108)
            .eq("anomaly", activePlanet?.id)
            .eq("owner", session.user.id);

          if (error) throw error;

          setHasRocket(data.length > 0);
        } catch (error: any) {
          console.error("Error checking inventory:", error.message);
        }
      }
    };

    fetchVisitedPlanets();
    fetchPlanetStats();
    fetchClassifications();
    checkRocketInInventory();
  }, [session, supabase, activePlanet]);

  useEffect(() => {
    const planetType = currentPlanet?.planetType;

    if (planetType) {
      const filterCompatibleMissions = () => {
        const zoodexMissions = zoodexDataSources.flatMap((category) =>
          category.items.filter((item) => item.compatiblePlanetTypes.includes(planetType))
        );
        const physicsLabMissions = physicsLabDataSources.flatMap((category) =>
          category.items.filter((item) => item.compatiblePlanetTypes.includes(planetType))
        );
        const telescopeMissions = telescopeDataSources.flatMap((category) =>
          category.items.filter((item) => item.compatiblePlanetTypes.includes(planetType))
        );
        const roverMissions = roverDataSources.flatMap((category) =>
          category.items.filter((item) => item.compatiblePlanetTypes.includes(planetType))
        );
        const lidarMissions = lidarDataSources.flatMap((category) =>
          category.items.filter((item) => item.compatiblePlanetTypes.includes(planetType))
        );
        setCompatibleMissions([
          ...zoodexMissions,
          ...physicsLabMissions,
          ...telescopeMissions,
          ...roverMissions,
          ...lidarMissions,
        ]);
      };

      filterCompatibleMissions();
    }
  }, [currentPlanet]);

  const nextPlanet = () => {
    setCurrentIndex((currentIndex + 1) % currentPlanets.length);
    setShowMissions(false);
    setSelectedMission(null);
  };

  const prevPlanet = () => {
    setCurrentIndex((currentIndex - 1 + currentPlanets.length) % currentPlanets.length);
    setShowMissions(false);
    setSelectedMission(null);
  };

  const handleSelectMission = () => {
    setShowMissions(true);
  };

  const handleMissionClick = (mission: any) => {
    setSelectedMission(mission);
    setMissionSelected(true);
  };

  const handleVisitPlanet = async () => {
    if (currentPlanet.anomaly !== activePlanet?.id) {
      const initialisationMission = currentPlanet.initialisationMissionId;
      const initialisePlanetMissionData = {
        user: session?.user.id,
        time_of_completion: new Date().toISOString(),
        mission: initialisationMission,
      };
  
      const { error: missionsError } = await supabase
        .from("missions")
        .insert([initialisePlanetMissionData]);
  
      if (missionsError) {
        console.error("Error inserting mission data:", missionsError);
        return;
      }
  
      // Add mission's structure to inventory when planet is visited
      if (selectedMission?.activeStructure) {
        const structureId = selectedMission.activeStructure;
  
        // Check if the structure already exists in the inventory
        const { data: existingInventory, error: fetchError } = await supabase
          .from("inventory")
          .select("*")
          .eq("item", structureId)
          .eq("owner", session?.user?.id)
          .eq("anomaly", currentPlanet.anomaly);
  
        if (fetchError) {
          console.error("Error fetching inventory data:", fetchError);
          return;
        }
  
        // If no data is returned, create a new entry in the inventory
        if (!existingInventory || existingInventory.length === 0) {
          const newConfig = {
            Uses: 1,
            "missions unlocked": [selectedMission?.identifier]
          };
  
          const inventoryData = {
            item: structureId, // the structure id from the mission
            owner: session?.user?.id,
            quantity: 1, // always 1 for new missions
            anomaly: currentPlanet.anomaly, // id of the planet being visited
            configuration: newConfig, // new configuration including missions unlocked
          };
  
          const { error: inventoryError } = await supabase
            .from("inventory")
            .insert([inventoryData]);
  
          if (inventoryError) {
            console.error("Error inserting inventory data:", inventoryError);
            return;
          }
        } else {
          // If the structure exists, update the configuration to add the new mission
          const currentConfig = existingInventory[0].configuration || { Uses: 1, "missions unlocked": [] };
          
          // Add the new mission if it doesn't exist in the configuration already
          const newMission = selectedMission?.identifier;
          if (!currentConfig["missions unlocked"].includes(newMission)) {
            currentConfig["missions unlocked"].push(newMission);
          }
  
          const { error: updateError } = await supabase
            .from("inventory")
            .update({ configuration: currentConfig })
            .eq("id", existingInventory[0].id);
  
          if (updateError) {
            console.error("Error updating inventory configuration:", updateError);
            return;
          }
        }
      }
  
      // Continue with other actions like moving items and updating planet location
      await moveItemsToNewPlanet(currentPlanet.anomaly);
      updatePlanetLocation(currentPlanet.anomaly);
    }
  };
  

  const [missionSelected, setMissionSelected] = useState<boolean>(false);

  const moveItemsToNewPlanet = async (newPlanetId: number) => {
    if (session?.user?.id) {
      const itemsToMove = [3108, 3107];

      try {
        await Promise.all(
          itemsToMove.map(async (itemId) => {
            const { data, error } = await supabase
              .from("inventory")
              .update({ anomaly: newPlanetId })
              .eq("item", itemId)
              .eq("owner", session.user.id);

            if (error) throw error;
            return data;
          })
        );
      } catch (error: any) {
        console.error("Error moving items:", error.message);
      };
    };
  };

  const isVisited = classificationsByPlanet[currentPlanet.anomaly]?.length > 0;

  return (
    <div className="items-center justify-center text-[#CFD1D1] p-4">
      <div className="w-full max-w-md bg-[#2C3A4A] rounded-3xl shadow-xl overflow-hidden border border-[#5FCBC3]">
        <div className="flex justify-around bg-[#5FCBC3] text-[#2C3A4A] p-4">
          <button
            className={`px-4 py-2 rounded-full ${activeTab === "solarSystem" ? "bg-[#2C3A4A] text-[#5FCBC3]" : ""}`}
            onClick={() => setActiveTab("solarSystem")}
          >
            Solar System
          </button>
          <button
            className="px-4 py-2 rounded-full cursor-not-allowed opacity-50"
            disabled
          >
            Exoplanets
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentPlanets.length > 0 && (
            <motion.div
              key={currentPlanet.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={currentPlanet.image}
                alt={currentPlanet.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex flex-col justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{currentPlanet.name}</h3>
                  <p className="text-sm">{currentPlanet.description}</p>
                  <button
                    onClick={handleSelectMission}
                    className="bg-[#5FCBC3] hover:bg-[#4BB3A5] text-white py-2 px-4 rounded-lg mt-2"
                  >
                    Select Mission
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={prevPlanet}>
                    <ChevronLeft className="text-[#CFD1D1]" />
                  </button>
                  <button onClick={nextPlanet}>
                    <ChevronRight className="text-[#CFD1D1]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center">
              {showMissions && (
        <div className="mt-4 p-4">
          <h4 className="text-lg font-semibold mb-2">Compatible Missions</h4>
          {compatibleMissions.length > 0 ? (
            <ul>
              {compatibleMissions.map((mission) => (
                <li
                  key={mission.id}
                  className={`cursor-pointer hover:bg-gray-700 p-2 rounded ${
                    selectedMission?.id === mission.id ? "bg-gray-600" : ""
                  }`}
                  onClick={() => handleMissionClick(mission)}
                >
                  {mission.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No compatible missions found for this planet.</p>
          )}

          {selectedMission && (
            <div className="mt-4">
              <h5 className="font-semibold">Selected Mission:</h5>
              <p>{selectedMission.name}</p>
            </div>
          )}
        </div>
      )}

      {missionSelected && (
        <div className="m-1">
                            <button
                    onClick={handleVisitPlanet}
                    className="bg-[#5FCBC3] hover:bg-[#4BB3A5] text-white py-2 px-4 rounded-lg mt-2"
                  >
                    Visit
                  </button>
        </div>
      )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};