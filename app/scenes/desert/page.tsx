'use client';

import React, { useState, useEffect, type ReactNode, type ReactElement } from "react";
import { BurrowingOwl } from "@/components/Projects/Zoodex/burrowingOwls";
import { ZoodexIguanas } from "@/components/Projects/Zoodex/iguanasFromAbove";
import { BiomePattern } from "@/components/Structures/Missions/Biologists/BiomePattern";
import { iconMap } from "@/components/Structures/Missions/Biologists/StationCard";
import Navbar from "@/components/Layout/Navbar";
import DesertGallery from "@/components/Structures/Missions/Biologists/gallery/desertGallery";
import DesertCounter from "@/components/Structures/Missions/Biologists/timer/desertTimer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Camera,
  Clock,
  Leaf,
  MapPin,
  Thermometer,
  Sprout,
  Droplets,
  Sun,
  Wind,
  Bird,
  ChevronLeft,
  Plus,
  PawPrint,
} from "lucide-react";
import { Bolt, BoltedCard, MetricItem } from "@/components/Structures/Greenhouses/Views";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    station: 3104001,
    biome: "Desert",
    title: "Burrowing Owls",
    icon: Bird,
    completedCount: 0,
    internalComponent: () => <BurrowingOwl />,
    color: "text-green-400",
  },
  {
    id: 2,
    station: 3104001,
    biome: "Desert",
    title: "Iguanas from Above",
    icon: PawPrint,
    completedCount: 5,
    internalComponent: () => <ZoodexIguanas />,
    color: "text-green-700",
  },
];

const DesertBaseEarthScene = () => {
  const [activeStation] = useState<any | null>({
    id: 3104001,
    name: "Desert Station",
    description: "A station located in the desert biome.",
    biome: "Desert",
    animals: [
      { name: "Burrowing Owl", icon: "Bird" },
      { name: "Iguana", icon: "PawPrint" },
    ],
    location: { coordinates: "23.6345° N, 46.8475° E", depth: "30m", altitude: "500m" },
  });

  useEffect(() => {
    if (activeStation) {
      setProjects(fetchProjects().filter((p) => p.station === Number(activeStation.id)));
    }
  }, [activeStation]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
    const [activeProject, setActiveProject] = useState<number | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

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
    <div className="relative w-full py-10 bg-black text-white">
      <Navbar />
      <div className="relative py-10 flex flex-col gap-6 p-6">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          src="/assets/Backdrops/Earth.png"
          alt="Earth Background"
        />

        {/* Station Overview */}
        <div className="relative flex flex-col gap-4 mb-4 bg-card rounded-md p-4 border border-border shadow-sm">
  <Bolt className="absolute top-3 left-3" />
  <Bolt className="absolute top-3 right-3" />
  <Bolt className="absolute bottom-3 left-3" />
  <Bolt className="absolute bottom-3 right-3" />

  <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_10px)]"></div>
  </div>

  <div className="flex items-center gap-4">
    <div className="relative bg-card p-3 rounded-full">
      <Sprout className="h-20 w-20 text-primary" />
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
    <h3 className="text-lg font-semibold text-blue-400">Biome</h3>
    <BiomePattern biome={activeStation.biome} className="w-10 h-10" />
    <span>{activeStation.biome}</span>
  </div>
</div>

<div className="flex-grow overflow-auto">
        {activeProject === null ? (
          <MainView projects={projects} onProjectClick={setActiveProject} /> // archiveImages={archiveImages}
        ) : (
          <ProjectDetailView
            project={projects.find((p) => p.id === activeProject)!}
            onBack={() => handleBack()} 
          />
        )}
      </div>

        {/* Dashboard Grid */}
        {/* <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Animals Section 
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
              <DesertGallery />
              <DesertCounter />
            </div>
          </div>

          {/* Projects Section 
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
      </div>
    </div>
  );
};

export default DesertBaseEarthScene;

interface MainViewProps {
  projects: Project[]
  archiveImages?: string[]
  onProjectClick: (id: number) => void
};

function MainView({ projects, archiveImages, onProjectClick }: MainViewProps): ReactElement {
    return (
      <div className="flex flex-col gap-4">
        {/* Projects Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Active Projects
            </h2>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Leaf className="h-4 w-4 mr-1" />2 Stations
            </Badge>
          </div>
  
          <div className="flex flex-col bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_10px)] gap-4">
            {projects.map((project: Project) => {
              const Icon = project.icon
              return (
                <BoltedCard key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2 pt-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 ${project.color}`} />
                        <span className="ml-2">{project.title}</span>
                        {project.completedCount > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {project.completedCount} completed
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onProjectClick(project.id)}>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
  
                  <CardContent className="p-4 pt-2">
                    <div className="flex gap-3 justify-start">
                      {project.images?.map((img: string, idx: number) => (
                        <div key={idx} className="w-16 h-16 rounded-sm overflow-hidden bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_10px)] border border-border">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Capture ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
  
                  <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <Badge variant="outline" className="text-xs">
                        {project.biome}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Station {project.station}
                      </span>
                    </div>
                  </CardFooter>
                </BoltedCard>
              )
            })}
  
            {/* <Button variant="outline" className="h-20 border-dashed flex flex-col gap-2 text-base">
              <Plus className="h-6 w-6" />
              <span>Load More Projects</span>
            </Button> */}
          </div>
        </div>
  
        {/* Archive Section */}
        {/* <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Archive
            </h2>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <span>142 Items</span>
            </Badge>
          </div>
  
          <BoltedCard>
            <CardContent className="p-4">
              <Tabs defaultValue="studied" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 mb-3">
                  <TabsTrigger value="studied" className="text-base">
                    Studied
                  </TabsTrigger>
                  <TabsTrigger value="community" className="text-base">
                    Community
                  </TabsTrigger>
                </TabsList>
  
                {["studied", "community"].map((tab: string) => (
                  <TabsContent key={tab} value={tab} className="mt-0 p-0">
                    <div className="grid grid-cols-5 grid-rows-2 gap-2">
                      {archiveImages.map((img: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-sm overflow-hidden bg-muted border border-border">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`${tab} image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </BoltedCard>
        </div> */}
      </div>
    );
};

interface ProjectDetailViewProps {
  project: Project
  onBack: () => void
};
  
function ProjectDetailView({ project, onBack }: ProjectDetailViewProps): ReactElement {
    const recentCaptures = Array(8).fill("/placeholder.svg?height=100&width=100")
    const Icon = project.icon
    const InternalComponent = project.internalComponent
  
    return (
      <div className="flex flex-col gap-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold flex items-center">
              <Icon className={`h-5 w-5 ${project.color}`} />
              <span className="ml-2">{project.title}</span>
            </h2>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            <span>Station ID: {project.station}</span>
          </Badge>
        </div>
  
        {InternalComponent && <InternalComponent />}
  
        {/* <BoltedCard>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Recent Captures</CardTitle>
          </CardHeader>
  
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-4 gap-3">
              {recentCaptures.map((img: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-sm overflow-hidden bg-muted border border-border">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Capture ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </BoltedCard>
  
        <BoltedCard>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Station Metrics</CardTitle>
          </CardHeader>
  
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-base">
              <StatItem label="Cameras" value={project.stats?.cameras || 0} />
              <StatItem label="Habitat Size" value={project.stats?.habitat || "N/A"} />
              <StatItem label="Temperature" value={project.stats?.temperature || "N/A"} />
              <StatItem label="Humidity" value={project.stats?.humidity || "N/A"} />
            </div>
          </CardContent>
        </BoltedCard> */}
  
        {/* <BoltedCard>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Biome: {project.biome}</CardTitle>
          </CardHeader>
  
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-base">
              <StatItem label="Birds" value="24 species" />
              <StatItem label="Mammals" value="12 species" />
              <StatItem label="Insects" value="36 species" />
              <StatItem label="Plants" value="48 species" />
            </div>
          </CardContent>
        </BoltedCard> */}
      </div>
    );
  };