"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, ThermometerSun, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

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
            description: '', // replace with classification list
            image: '/images/mercury.jpg'
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
            description: '', // replace with classification list
            image: '/images/venus.jpg' 
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
            description: '', // replace with classification list
            image: '/images/earth.jpg' 
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
            description: '', // replace with classification list
            image: '/images/mars.jpg' 
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

  const [activeTab, setActiveTab] = useState<"solarSystem" | "exoplanets">(
    "solarSystem"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPlanets = planets[activeTab];
  const currentPlanet = currentPlanets[currentIndex];

  const [planetStats, setPlanetStats] = useState<any[]>([]);
  const [visitedPlanets, setVisitedPlanets] = useState<{
    [key: number]: boolean;
  }>({});
  const [classificationsByPlanet, setClassificationsByPlanet] = useState<
    Record<number, any[]>
  >({});
  const [hasRocket, setHasRocket] = useState<boolean>(false);

  // Where has the user been, based on missions completed
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
        const response = await fetch(
          "/api/gameplay/missions/planets/solarsystem/stats"
        );
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
            const planetAnomaly = parseInt(
              classification.classificationConfiguration.activePlanet,
              10
            );

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

  const nextPlanet = () => {
    setCurrentIndex((currentIndex + 1) % currentPlanets.length);
  };

  const prevPlanet = () => {
    setCurrentIndex((currentIndex - 1 + currentPlanets.length) % currentPlanets.length);
  };

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
      }
    }
  };

  const handlePlanetClick = async (planet: any) => {
    if (planet.anomaly !== activePlanet?.id) {
      const { error: missionsError } = await supabase
        .from("missions")
        .insert([initialisePlanetMissionData]);

      await moveItemsToNewPlanet(planet.anomaly);
      updatePlanetLocation(planet.anomaly);
    }
  };

  const isVisited =
    classificationsByPlanet[currentPlanet.anomaly]?.length > 0;
  const planetDetails = planetStats?.find(
    (planet) => planet.id === currentPlanet.initialisationMissionId
  );
  const initialisationMission = currentPlanet.initialisationMissionId;

  const initialisePlanetMissionData = {
    user: session?.user.id,
    time_of_completion: new Date().toISOString(),
    mission: initialisationMission,
  };

  return (
    <div className="items-center justify-center text-[#CFD1D1] p-4">
      <div className="w-full max-w-md bg-[#2C3A4A] rounded-3xl shadow-xl overflow-hidden border border-[#5FCBC3]">
        <div className="flex justify-around bg-[#5FCBC3] text-[#2C3A4A] p-4">
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "solarSystem" ? "bg-[#2C3A4A] text-[#5FCBC3]" : ""
            }`}
            onClick={() => setActiveTab("solarSystem")}
          >
            Solar System
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "exoplanets" ? "bg-[#2C3A4A] text-[#5FCBC3]" : ""
            }`}
            onClick={() => setActiveTab("exoplanets")}
          >
            Exoplanets
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentPlanets.length > 0 ? (
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">{currentPlanet.name}</h2>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star />
                      <span>{currentPlanet.planetType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin />
                      <span>{currentPlanet.stats.gravity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThermometerSun />
                      <span>{currentPlanet.stats.temp}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock />
                      <span>{currentPlanet.travelTime}</span>
                    </div>
                  </div>
                </div>
                <p className="mb-4">
                  {visitedPlanets[currentPlanet.id]
                    ? "You've already visited this planet!"
                    : "New planet to explore!"}
                </p>

                {isVisited ? (
                  <p className="text-[#5FCBC3]">
                    You've completed classifications on this planet.
                  </p>
                ) : (
                  <button
                    onClick={() => handlePlanetClick(currentPlanet)}
                    className="bg-[#5FCBC3] text-[#2C3A4A] px-4 py-2 rounded-md hover:bg-[#2C3A4A] hover:text-[#5FCBC3] border border-[#5FCBC3]"
                  >
                    Visit Planet
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <p className="text-center py-4">No planets available.</p>
          )}
        </AnimatePresence>

        <div className="flex justify-between px-6 pb-6">
          <button
            onClick={prevPlanet}
            className="px-4 py-2 bg-[#2C3A4A] text-[#5FCBC3] rounded-full hover:bg-[#5FCBC3] hover:text-[#2C3A4A]"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={nextPlanet}
            className="px-4 py-2 bg-[#2C3A4A] text-[#5FCBC3] rounded-full hover:bg-[#5FCBC3] hover:text-[#2C3A4A]"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};