'use client';

import React, { useState, useEffect } from "react";
import { Fish } from "lucide-react";
import { PlanktonPortalFrame } from "@/components/Projects/Zoodex/planktonPortal";
import { BiomePattern } from "@/components/Structures/Missions/Biologists/BiomePattern";
import { iconMap } from "@/components/Structures/Missions/Biologists/StationCard";
import Navbar from "@/components/Layout/Navbar";

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

const fetchProjects = (): Project[] => {
  return [
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
  ];
};

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
      const filteredProjects = fetchProjects().filter(
        (p) => p.station === Number(activeStation.id)
      );
      setProjects(filteredProjects);
    }
  }, [activeStation]);

  return (
    <div className="relative h-screen w-full grid grid-rows-[auto_1fr_auto]">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Ocean.png"
        alt="Ocean Background"
      />
      <Navbar />
      <div className="relative z-10 flex flex-col bg-black bg-opacity-60 p-5 md:p-10 rounded-lg overflow-hidden">
        <h1 className="text-3xl font-bold text-white text-center">Ocean Station</h1>

        <div className="mt-8 bg-gray-800 p-8 rounded-lg overflow-auto">
          <h2 className="text-3xl font-bold text-white">{activeStation.name} | {activeStation.id}</h2>
          <p className="text-gray-400 mt-2">{activeStation.description}</p>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-400">Biome</h3>
            <div className="flex items-center gap-2">
              <BiomePattern biome={activeStation.biome} className="w-12 h-12" />
              <span className="text-white">{activeStation.biome}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-400">Animals available for study</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeStation.animals.map((animal: Animal) => {
                const AnimalIcon = iconMap[animal.icon as keyof typeof iconMap];
                return (
                  <div key={animal.name} className="flex items-center gap-2">
                    {AnimalIcon && <AnimalIcon className="w-6 h-6 text-blue-400" />}
                    <span className="text-white">{animal.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold text-white">Projects</h3>
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="mt-6">
                  <h4 className="text-lg text-white">{project.title}</h4>
                  <p className="text-sm text-white">Completed: {project.completedCount}</p>
                  <div id={`project-${project.id}`} className="mt-8">
                    <h3 className="text-xl">{project.title}</h3>
                    {project.internalComponent && <project.internalComponent />}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white">No projects available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanBaseEarthScene;