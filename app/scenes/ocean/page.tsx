'use client';

import React, { useState, useEffect } from "react";
import { Anchor, Camera, Clock, Droplets, Fish, GlassWater, Sun, Thermometer, Wind } from "lucide-react";
import { PlanktonPortalFrame } from "@/components/Projects/Zoodex/planktonPortal";
import { ClickACoral } from "@/components/Projects/Zoodex/click-a-coral";
import { BiomePattern } from "@/components/Structures/Missions/Biologists/BiomePattern";
import { iconMap } from "@/components/Structures/Missions/Biologists/StationCard";
import Navbar from "@/components/Layout/Navbar";
import OceanGallery from "@/components/Structures/Missions/Biologists/gallery/oceanGallery";
import OceanCounter from "@/components/Structures/Missions/Biologists/timer/oceanTimer";
import { Bolt, MainView, MetricItem, ProjectDetailView } from "@/components/Structures/Greenhouses/Views";
import { Badge } from "@/components/ui/badge";
import GameNavbar from "@/components/Layout/Tes";

interface Project {
  id: number
  station: number
  biome: string
  title: string
  icon: React.ElementType
  completedCount: number
  internalComponent?: React.ElementType
  color: string
  images?: string[]
  stats?: {
    cameras: number
    habitat: string
    temperature: string
    humidity: string
  };
};

interface Animal {
  name: string;
  icon: string;
};

const fetchProjects = (): Project[] => [
  {
    id: 1,
    station: 3104002,
    biome: "Ocean",
    title: "Plankton Portal",
    icon: Fish,
    completedCount: 0,
    internalComponent: () => <PlanktonPortalFrame />,
    color: "text-blue-400",
  },
  {
    id: 2,
    station: 3104002,
    biome: "Ocean",
    title: "Click a Coral",
    icon: Anchor,
    completedCount: 0,
    internalComponent: () => <ClickACoral />,
    color: "text-red-200",
  },
];

const OceanBaseEarthScene = () => {
  const [activeStation] = useState<any | null>({
    id: 3104002,
    name: "Ocean Station",
    description: "A station located in the ocean biome focused on plankton research.",
    biome: "Ocean",
    animals: [
      { name: "Plankton", icon: "Fish" },
    ],
    location: { coordinates: "3.123° N, 51.567° W", depth: "200m" },
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (activeStation) {
      setProjects(fetchProjects().filter((p) => p.station === Number(activeStation.id)));
    };
  }, [activeStation]);

    const [timeLeft, setTimeLeft] = useState<number>(0);
      const [activeProject, setActiveProject] = useState<number | null>(null);
  
    const getTimeUntilNextSunday = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7); // Next Sunday
      nextSunday.setHours(10, 1, 0, 0); // Set to 00:01 AEST (UTC+10)
      return nextSunday.getTime() - now.getTime(); // Milliseconds until next Sunday
    };
  
    const handleBack = () => {
      console.log('Back button clicked');
      setActiveProject(null);  // Reset activeProject
    };
  
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const time = Math.max(getTimeUntilNextSunday() / 1000, 300); // Ensure it's always at least 5 minutes
          return Math.floor(time);
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }, []);
  
    const formatTime = (timeInSeconds: number) => {
      const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(timeInSeconds % 60).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    return (
      <div className="relative w-full py-10 h-full bg-[#ECEFF4] text-[#2E3440]">
        <GameNavbar />
        <div className="relative py-10 flex flex-col gap-6 p-6">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            src="/assets/Backdrops/Ocean.png"
            alt="Ocean Background"
          />
    
          {/* Station Overview */}
          <div className="relative flex flex-col gap-4 mb-4 bg-[#E5E9F0] text-[#2E3440] rounded-xl p-4 border border-[#D8DEE9] shadow-md">
            <Bolt className="absolute top-3 left-3 text-primary" />
            <Bolt className="absolute top-3 right-3 text-primary" />
            <Bolt className="absolute bottom-3 left-3 text-primary" />
            <Bolt className="absolute bottom-3 right-3 text-primary" />
            <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
              <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_10px)]"></div>
            </div>
    
            <div className="flex items-center gap-4">
              <div className="relative bg-primary/10 p-3 rounded-full">
                <GlassWater className="h-20 w-20 text-primary" />
              </div>
    
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{activeStation.name} | {activeStation.id}</h1>
                <p className="text-base text-muted-foreground">{activeStation.description}</p>
    
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Next: {formatTime(timeLeft)}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">12 Active</span>
                  </Badge>
                </div>
              </div>
            </div>
    
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MetricItem icon={Thermometer} label="Temperature" value="22°C Average" />
              <MetricItem icon={Droplets} label="Moisture" value="68% Humidity" />
              <MetricItem icon={Sun} label="Light" value="12.4k lux" />
              <MetricItem icon={Wind} label="Wind" value="8 km/h" />
            </div>
    
            <div className="mt-4 flex items-center gap-4">
              <h3 className="text-lg font-semibold text-primary">Biome</h3>
              <BiomePattern biome={activeStation.biome} className="w-10 h-10" />
              <span>{activeStation.biome}</span>
            </div>
          </div>
    
          <div className="flex-grow overflow-auto">
            {activeProject === null ? (
              <MainView projects={projects} onProjectClick={setActiveProject} />
            ) : (
              <ProjectDetailView
                project={projects.find((p) => p.id === activeProject)!}
                onBack={() => handleBack()}
              />
            )}
          </div>
      </div>
    </div>
  );
};

export default OceanBaseEarthScene;

{/* Dashboard Grid */}
        {/* <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-400">Animals available for study</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {activeStation.animals.map((animal: Animal) => {
                const AnimalIcon = iconMap[animal.icon as keyof typeof iconMap];
                return (
                  <div key={animal.name} className="flex items-center gap-2">
                    {AnimalIcon && <AnimalIcon className="w-6 h-6 text-blue-400" />}
                    <span>{animal.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="p-12">
              <h3 className="text-l font-semibold text-blue-600">Your discoveries</h3>
              <OceanGallery />
              <OceanCounter />
            </div>
          </div>

          <div className="bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-white">Projects</h3>
            {projects.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-lg">{project.title}</h4>
                    <p className="text-sm text-gray-400">Completed: {project.completedCount}</p>
                    <div className="mt-4">
                      {project.internalComponent && <project.internalComponent />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-400">No projects available</p>
            )}
          </div>
</div> */}