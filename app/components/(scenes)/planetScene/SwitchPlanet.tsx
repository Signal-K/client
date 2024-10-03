"use client";

import { SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { zoodexDataSources, telescopeDataSources, lidarDataSources, roverDataSources } from "@/app/components/(structures)/Data/ZoodexDataSources";

const planetTypeColors: { [key: string]: string } = {
  Lush: "#4CAF50",    
  Arid: "#FF9800",      
  Hellhole: "#FF5722", 
  Frozen: "#03A9F4",     
  "Gas Giant": "#9C27B0",
  Rocky: "#795548",     
  "Ice Giant": "#00BCD4" 
}; 

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
    name: "Moon",
    color: "bg-gray-300",
    stats: { population: "0", gravity: "1.62 m/s²", temp: "-53°C" },
    anomaly: 31,
    initialisationMissionId: null,
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
    initialisationMissionId: null,
  },
  {
    name: "Europa",
    color: "bg-blue-200",
    stats: { population: "0", gravity: "1.31 m/s²", temp: "-160°C" },
    anomaly: 51,
    initialisationMissionId: null,
  },
  {
    name: "Io",
    color: "bg-yellow-400",
    stats: { population: "0", gravity: "1.79 m/s²", temp: "-143°C" },
    anomaly: 52,
    initialisationMissionId: null,
  },
  {
    name: "Amalthea",
    color: "bg-red-400",
    stats: { population: "0", gravity: "0.026 m/s²", temp: "-113°C" },
    anomaly: 53,
    initialisationMissionId: null,
  },
  {
    name: "Saturn",
    color: "bg-yellow-600",
    stats: { population: "0", gravity: "10.44 m/s²", temp: "-139°C" },
    anomaly: 60,
    initialisationMissionId: 600001,
  },
  {
    name: "Enceladus",
    color: "bg-white",
    stats: { population: "0", gravity: "0.113 m/s²", temp: "-201°C" },
    anomaly: 61,
    initialisationMissionId: null,
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
        };
      };
    };

    const fetchPlanetStats = async () => {
      try {
        const response = await fetch("/api/gameplay/missions/planets/solarsystem/stats");
        const data = await response.json();
        setPlanetStats(data);
      } catch (error) {
        console.error("Error fetching planet stats:", error);
      };
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

    const filterMissionsByPlanetType = () => {
      const planetType = planetDetails.planetType; 
      const compatibleMissions: SetStateAction<any[]> = [];
  
      const allMissions = [
        ...zoodexDataSources.flatMap((dataSource) => dataSource.items),
        ...telescopeDataSources.flatMap((dataSource) => dataSource.items),
        ...lidarDataSources.flatMap((dataSource) => dataSource.items),
        ...roverDataSources.flatMap((dataSource) => dataSource.items),
      ];
  
      allMissions.forEach((mission) => {
        if (mission.compatiblePlanetTypes.includes(planetType)) {
          compatibleMissions.push(mission);
        }
      });
  
      setAvailableMissions(compatibleMissions);
    };

    const checkRocketInInventory = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from("inventory")
            .select("id")
            .eq("item", 3108)
            .eq("anomaly", activePlanet.id)
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
  
  const handlePlanetClick = (planet: any) => {
    if (planet.anomaly !== activePlanet.id) {
      updatePlanetLocation(planet.anomaly);
    }
  };

  // const hasVisited = visitedPlanets[currentPlanet.initialisationMissionId || 0];
  const isVisited = classificationsByPlanet[currentPlanet.anomaly]?.length > 0;
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

              <div className="mt-4">
                <h3 className="text-lg font-semibold">Switch Planets:</h3>
                <ul>
                  <li>
                  {currentPlanet.anomaly !== activePlanet.id && (
          <button onClick={() => handlePlanetClick(currentPlanet)}>
            Travel to {currentPlanet.name}
          </button>
        )}
                  </li>
                </ul>
              </div>

              <div className="missions">
        <h3>Available Missions</h3>
        <ul>
          {availableMissions.map((mission) => (
            <li key={mission.identifier}>
              <h4>{mission.name}</h4>
              <p>{mission.description}</p>
            </li>
          ))}
        </ul>
      </div>

              {isVisited ? (
                <div>
                  <h3 className="text-lg font-semibold">Planet Details</h3>
                  {planetDetails ? (
  <ul>
    <li>
      <strong>Population:</strong> {planetDetails.population}
    </li>
    <li>
      <strong>Resources:</strong> {Array.isArray(planetDetails.resources) ? planetDetails.resources.join(", ") : "No resources available"}
    </li>
    <li>
      <strong>Planet Type:</strong>{" "}
      <span
        style={{
          backgroundColor: planetTypeColors[planetDetails.planetType] || "#607D8B", 
          padding: "4px 8px",
          borderRadius: "4px",
          color: "#fff"
        }}
      >
        {planetDetails.planetType || "Unknown"}
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

              <p className="mt-4">
                {hasRocket
                  ? "You have a rocket to travel to this planet!"
                  : "You need a rocket to travel to this planet."}
              </p>

              <div className="mt-4">
          <h3>Classifications:</h3>
          {classificationsByPlanet[currentPlanet.anomaly]?.length > 0 ? (
            classificationsByPlanet[currentPlanet.anomaly].map((classification, index) => (
              <div key={index}>
                {classification.classificationtype}
              </div>
            ))
          ) : (
            <p>No classifications for this planet.</p>
          )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};