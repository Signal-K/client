'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import AvailableMissionsListForPlanet from './availableMissions';

const planets = [
  { name: 'Mercury', color: 'bg-[#2C3A4A]', image: '/assets/Planets/Mercury.png', link: '/scenes/mercury', anomaly: 10, initialisationMissionId: 100001 },
  { name: 'Venus', color: 'bg-yellow-200', image: '/assets/Planets/Venus.png', link: '/scenes/venus', anomaly: 20, initialisationMissionId: 200001 },
  { name: 'Earth', color: 'bg-blue-500', image: '/assets/Planets/Earth.png', link: '/scenes/earth', anomaly: 69, initialisationMissionId: 300001 },
  { name: 'Mars', color: 'bg-red-500', image: '/assets/Planets/Mars.png', link: '/scenes/mars', anomaly: 40, initialisationMissionId: 400001 },
  { name: 'Jupiter', color: 'bg-orange-300', image: '/assets/Planets/Jupiter.png', link: '/scenes/jupiter', anomaly: 50, initialisationMissionId: 500001 },
  { name: 'Saturn', color: 'bg-yellow-600', image: '/assets/Planets/Saturn.png', link: '/scenes/saturn', anomaly: 60, initialisationMissionId: 600001 },
  { name: 'Uranus', color: 'bg-cyan-300', image: '/assets/Planets/Uranus.png', link: '/scenes/uranus', anomaly: 70, initialisationMissionId: 700001 },
  { name: 'Neptune', color: 'bg-blue-700', image: '/assets/Planets/Neptune.png', link: '/scenes/neptune', anomaly: 80, initialisationMissionId: 800001 },
];

export default function PlanetSelector() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visitedPlanets, setVisitedPlanets] = useState<{ [key: number]: boolean }>({});
  const [planetStats, setPlanetStats] = useState<any[]>([]);

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

    fetchVisitedPlanets();

    const fetchPlanetStats = async () => {
      try {
        const response = await fetch('/api/gameplay/missions/planets/solarsystem/stats');
        const data = await response.json();
        setPlanetStats(data);
        console.log(planetStats);
      } catch (error) {
        console.error('Error fetching planet stats:', error);
      };
    };

    fetchPlanetStats();
  }, [session, supabase]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev === 0 ? planets.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev === planets.length - 1 ? 0 : prev + 1));
    };
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedPlanet = planets[selectedIndex];

  const getPosition = (index: number) => {
    const totalPlanets = planets.length;
    const angle = ((index - selectedIndex + totalPlanets) % totalPlanets) / totalPlanets * Math.PI;
    const x = 50 - Math.cos(angle) * 50;
    const y = 50 - Math.sin(angle) * 25;
    return { x, y };
  };

  const hasVisited = visitedPlanets[selectedPlanet.initialisationMissionId];
  const planetDetails = planetStats?.find((planet) => planet.id === selectedPlanet.initialisationMissionId);

  return (
    <div className="flex flex-col h-screen bg-[#2C3A4A] text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Let's book your trip to</h1>
      <div className="relative h-32 mb-8">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
          <path d="M0,50 Q50,0 100,50" fill="none" stroke="#4B5563" strokeWidth="0.5" />
        </svg>
        <div className="absolute inset-0">
          {planets.map((planet, index) => {
            const { x, y } = getPosition(index);
            return (
              <motion.div
                key={planet.name}
                className={`absolute w-6 h-6 rounded-full ${planet.color} flex items-center justify-center`}
                animate={{ left: `${x}%`, top: `${y}%` }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <motion.div
                  animate={{
                    scale: index === selectedIndex ? 1.5 : 1,
                    zIndex: index === selectedIndex ? 10 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <span className="text-xs font-bold">{planet.name[0]}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        <button
          onClick={() => setSelectedIndex((prev) => (prev === 0 ? planets.length - 1 : prev - 1))}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20"
          aria-label="Previous planet"
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button
          onClick={() => setSelectedIndex((prev) => (prev === planets.length - 1 ? 0 : prev + 1))}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20"
          aria-label="Next planet"
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPlanet.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-5xl font-bold mb-2">{selectedPlanet.name.toUpperCase()}</h2>
          {planetDetails ? (
            <div className="text-sm">
              <p><strong>Mass:</strong> {planetDetails.mass}</p>
              {/* <p><strong>Radius:</strong> {planetDetails.radius}</p>
              <p><strong>Average Temperature:</strong> {planetDetails.temperature.average}</p>
              <p><strong>Orbital Period:</strong> {planetDetails.orbitalPeriod}</p>
              <p><strong>Distance from Sun:</strong> {planetDetails.distanceFromSunOrPlanet}</p> */}
              <p>Planet type: {planetDetails.planetType}</p>

              <p className="text-lg">
                {hasVisited ? "You've already visited this planet!" : "You haven't visited this planet yet."}
              </p>

              <p><strong>Available missions:</strong></p><br />
              <AvailableMissionsListForPlanet planetType={planetDetails.planetType} />
            </div>
          ) : (
            <p>Loading planet details...</p>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="flex-grow relative overflow-hidden rounded-t-3xl">
        <AnimatePresence>
          <motion.img
            key={selectedPlanet.image}
            src={selectedPlanet.image}
            alt={selectedPlanet.name}
            className="absolute bottom-0 left-0 w-full object-cover"
            style={{ height: '100%' }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>
      <a href={selectedPlanet.link}>
        <button className="mt-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Explore {selectedPlanet.name}
        </button>
      </a>
    </div>
  );
};