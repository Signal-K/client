'use client';

import React, { useState, useEffect } from "react";
import { Bird, PawPrint } from "lucide-react";
import { BurrowingOwl } from "@/components/Projects/Zoodex/burrowingOwls";
import { ZoodexIguanas } from "@/components/Projects/Zoodex/iguanasFromAbove";
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
};

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
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />
      <Navbar />
      <div className="relative z-10 flex flex-col bg-black bg-opacity-60 p-5 md:p-10 rounded-lg overflow-hidden">
        {/* <h1 className="text-3xl font-bold text-white text-center">Desert Station</h1> */}

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

          {/* <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-400">Location</h3>
            <p className="text-white">{activeStation.location.coordinates}</p>
            {activeStation.location.depth && (
              <p className="text-white">{activeStation.location.depth}</p>
            )}
            {activeStation.location.altitude && (
              <p className="text-white">{activeStation.location.altitude}</p>
            )}
          </div> */}

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

export default DesertBaseEarthScene;