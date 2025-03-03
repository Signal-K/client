'use client';

import React, { useState, useEffect } from "react";
import { Anchor, Fish } from "lucide-react";
import { PlanktonPortalFrame } from "@/components/Projects/Zoodex/planktonPortal";
import { ClickACoral } from "@/components/Projects/Zoodex/click-a-coral";
import { BiomePattern } from "@/components/Structures/Missions/Biologists/BiomePattern";
import { iconMap } from "@/components/Structures/Missions/Biologists/StationCard";
import Navbar from "@/components/Layout/Navbar";
import OceanGallery from "@/components/Structures/Missions/Biologists/gallery/oceanGallery";
import OceanCounter from "@/components/Structures/Missions/Biologists/timer/oceanTimer";

interface Project {
  id: number;
  station: number;
  biome: string;
  title: string;
  icon: React.ElementType;
  completedCount: number;
  internalComponent?: React.ElementType;
  color: string;
}

interface Animal {
  name: string;
  icon: string;
}

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
    }
  }, [activeStation]);

  return (
    <div className="relative w-full bg-black text-white">
      <Navbar />
      <div className="relative py-10 flex flex-col gap-6 p-6">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          src="/assets/Backdrops/Ocean.png"
          alt="Ocean Background"
        />

        {/* Station Overview */}
        <div className="relative z-10 bg-gray-900 bg-opacity-80 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold">{activeStation.name} | {activeStation.id}</h2>
          <p className="text-gray-400">{activeStation.description}</p>
          
          <div className="mt-4 flex items-center gap-4">
            <h3 className="text-lg font-semibold text-blue-400">Biome</h3>
            <BiomePattern biome={activeStation.biome} className="w-10 h-10" />
            <span>{activeStation.biome}</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Animals Section */}
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

          {/* Projects Section */}
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
        </div>
      </div>
    </div>
  );
};

export default OceanBaseEarthScene;