"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const planets = [
  {
    name: "Mercury",
    color: "bg-gray-400",
    stats: { population: "0", gravity: "3.7 m/s²", temp: "430°C" },
    anomaly: 10,
    initialisationMissionId: 100001,
  },
  {
    name: "Venus",
    color: "bg-yellow-200",
    stats: { population: "0", gravity: "8.87 m/s²", temp: "462°C" },
    anomaly: 20,
    initialisationMissionId: 200001,
  },
  {
    name: "Earth",
    color: "bg-blue-500",
    stats: { population: "7.8 billion", gravity: "9.8 m/s²", temp: "15°C" },
    anomaly: 69,
    initialisationMissionId: 300001,
  },
  {
    name: "Mars",
    color: "bg-red-500",
    stats: { population: "0", gravity: "3.71 m/s²", temp: "-63°C" },
    anomaly: 40,
    initialisationMissionId: 400001,
  },
  {
    name: "Jupiter",
    color: "bg-orange-300",
    stats: { population: "0", gravity: "24.79 m/s²", temp: "-108°C" },
    anomaly: 50,
    initialisationMissionId: 500001,
  },
  {
    name: "Saturn",
    color: "bg-yellow-600",
    stats: { population: "0", gravity: "10.44 m/s²", temp: "-139°C" },
    anomaly: 60,
    initialisationMissionId: 600001,
  },
  {
    name: "Uranus",
    color: "bg-cyan-300",
    stats: { population: "0", gravity: "8.69 m/s²", temp: "-197°C" },
    anomaly: 70,
    initialisationMissionId: 700001,
  },
  {
    name: "Neptune",
    color: "bg-blue-700",
    stats: { population: "0", gravity: "11.15 m/s²", temp: "-214°C" },
    anomaly: 80,
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

  const [visitedPlanets, setVisitedPlanets] = useState<{ [key: number]: boolean }>({});
  const [planetStats, setPlanetStats] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  
  const { currentPlanet, nextPlanet, prevPlanet, currentIndex } = usePlanetSwitcher();

  useEffect(() => {
    const fetchVisitedPlanets = async () => {
      if (session?.user?.id) {
        try {
          const { data: missions, error } = await supabase
            .from("missions")
            .select("mission")
            .eq("user", session.user.id);

          if (error) throw error;

          const visited = missions.reduce((acc: { [key: number]: boolean }, mission: { mission: number }) => {
            acc[mission.mission] = true;
            return acc;
          }, {});

          setVisitedPlanets(visited);
        } catch (error: any) {
          console.error("Error fetching missions:", error.message);
        }
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
              .eq("author", session.user.id)
              .filter('classificationConfiguration->>activePlanet', 'eq', currentPlanet.anomaly.toString());
  
            if (error) throw error;
  
            // Process classification types
            const formattedClassifications = classificationsData.reduce((acc: Record<string, number>, classification: any) => {
              // Format the classificationtype
              const type = classification.classificationtype.startsWith("zoodex-")
                ? classification.classificationtype.substring(7) // Remove "zoodex-"
                : classification.classificationtype;
              const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize the first letter
              
              // Count occurrences
              acc[capitalizedType] = (acc[capitalizedType] || 0) + 1;
              return acc;
            }, {});
  
            setClassifications(Object.entries(formattedClassifications).map(([key, count]) => `${key} x${count}`));
          } catch (error: any) {
            console.error("Error fetching classifications:", error.message);
          }
        }
      };   

    fetchVisitedPlanets();
    fetchPlanetStats();
    fetchClassifications();
  }, [session, supabase, currentPlanet.anomaly]);

  const hasVisited = visitedPlanets[currentPlanet.initialisationMissionId];
  const planetDetails = planetStats?.find((planet) => planet.id === currentPlanet.initialisationMissionId);

  return (
    <div className="flex items-center justify-center text-white p-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlanet.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
              <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.entries(currentPlanet.stats).map(([key, value]) => (
                  <div key={key} className="bg-[#2C4F64] p-2 rounded">
                    <p className="text-xs uppercase text-gray-200">{key}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Discoveries</h3>
                {classifications.length > 0 ? (
                  <ul className="list-disc list-inside">
{classifications.map((classification, index) => (
                      <li key={index} className="text-sm">{classification}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No classifications recorded yet.</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center mt-4">
          {planets.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};