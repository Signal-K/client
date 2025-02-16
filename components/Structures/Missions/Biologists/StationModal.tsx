import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bird, Fish, PawPrint, Sun, Trees } from "lucide-react";
import { BurrowingOwl } from "@/components/Projects/Zoodex/burrowingOwls";
import { BiomePattern } from "./BiomePattern";
import { iconMap } from "./StationCard";
import { PlanktonPortalFrame } from "@/components/Projects/Zoodex/planktonPortal";
import { ZoodexIguanas } from "@/components/Projects/Zoodex/iguanasFromAbove";

interface Animal {
  name: string;
  icon: string;
};

interface Project {
  id: number;
  station: number;
  biome: string;
  title: string;
  icon: React.ElementType;
  completedCount: number;
  internalComponent?: React.ElementType;
  color: string;
};

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
    {
      id: 3,
      station: 3104002,
      biome: "Ocean",
      title: "Plankton Portal",
      icon: Fish,
      completedCount: 0,
      color: "text-blue-400",
      internalComponent: () => <PlanktonPortalFrame />,
    },
  ];
};

interface StationModalProps {
  station: any;
  setActiveStation: (station: any | null) => void;
};

export default function StationModal({ station, setActiveStation }: StationModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (station) {
      const filteredProjects = fetchProjects().filter((p) => p.station === Number(station.id));
      setProjects(filteredProjects);
    }
  }, [station]);

  const renderProject = (project: Project) => {
    const completedCount = project.completedCount ?? 0;

    return (
      <div
        key={project.id}
        className={`flex items-center p-6 rounded-2xl cursor-pointer${
          project.id > 2
            ? "bg-[#74859A]"
            : project.id < 3
            ? "bg-gray-000"
            : completedCount > 0
            ? "bg-gray-700"
            : ""
        }`}
        onClick={() => setSelectedProject(project)}
      >
        <project.icon className={`w-10 h-10 ${project.color}`} />
        <div className="ml-4">
          <h2 className={`text-lg font-bold ${project.color}`}>{project.title}</h2>
          <p className={`text-sm ${project.color}`}>{project.biome}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs">Completed: {completedCount}</p>
        </div>
      </div>
    );
  };

  const scrollToProject = (projectId: number) => {
    const projectElement = document.getElementById(`project-${projectId}`);
    if (projectElement) {
      projectElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-white">{station.name} | {station.id}</h2>
        <p className="text-gray-400">{station.description}</p>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-blue-400">Biome</h3>
          <div className="flex items-center gap-2">
            <BiomePattern biome={station.biome} className="w-12 h-12" />
            <span className="text-white">{station.biome.name}</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-blue-400">Animals</h3>
          <div className="grid grid-cols-2 gap-4">
            {station.animals.map((animal: Animal) => {
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

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-blue-400">Location</h3>
          <p className="text-white">{station.location.coordinates}</p>
          {station.location.depth && (
            <p className="text-white">{station.location.depth}</p>
          )}
          {station.location.altitude && (
            <p className="text-white">{station.location.altitude}</p>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Button onClick={() => setActiveStation(null)}>Close</Button>
        </div>

        <div>
          <h3 className="text-xl">Projects</h3>
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id}>
                <h4>{project.title}</h4>
                <p>Completed: {project.completedCount}</p>
                <Button onClick={() => { setSelectedProject(project); scrollToProject(project.id); }}>
                  View Project
                </Button>
              </div>
            ))
          ) : (
            <p className="text-white">No projects available</p>
          )}
        </div>

        {selectedProject && (
          <div id={`project-${selectedProject.id}`} className="mt-8">
            <h3 className="text-xl">{selectedProject.title}</h3>
            {selectedProject.internalComponent && <selectedProject.internalComponent />}
          </div>
        )}
      </div>
    </div>
  );
};


    // StationCard should show this modal/view if it's built

    // Show biomass discovered here

    // Maybe there should be a grid view when you build these stations.