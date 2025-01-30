import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Sun } from "lucide-react";
import { BurrowingOwl } from "@/components/Projects/Zoodex/burrowingOwls";

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
      icon: Sun,
      completedCount: 0,
      internalComponent: () => <BurrowingOwl />,
      color: "text-green-400",
    },
  ];
};

interface StationModalProps {
  station: any;
  setActiveStation: (station: any | null) => void;
}

export default function StationModal({ station, setActiveStation }: StationModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (station) {
      setProjects(fetchProjects().filter((p) => p.station === station.id));
    }
  }, [station]);

  const renderProject = (project: Project) => (
    <div
      key={project.id}
      className="flex items-center p-6 rounded-2xl cursor-pointer bg-gray-700"
      onClick={() => setSelectedProject(project)}
    >
      <project.icon className={`w-10 h-10 ${project.color}`} />
      <div className="ml-4">
        <h2 className={`text-lg font-bold ${project.color}`}>{project.title}</h2>
        <p className="text-sm text-gray-400">Biome: {project.biome}</p>
        <p className="text-sm text-gray-400">Completed: {project.completedCount}</p>
      </div>
    </div>
  );

  return (
    <Card className="w-full p-4">
      <CardContent>
        <AnimatePresence>
          {!selectedProject ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h2 className="text-xl font-bold">{station.name}</h2>
              <p className="text-gray-600">{station.description}</p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Projects</h3>
                <div className="grid gap-4 mt-2">{projects.map(renderProject)}</div>
              </div>
              <Button className="mt-4" onClick={() => setActiveStation(null)}>
                Back to Stations
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="text-xl font-bold">{selectedProject.title}</h3>
              {selectedProject.internalComponent && <selectedProject.internalComponent />}
              <Button className="mt-4" onClick={() => setSelectedProject(null)}>
                Back to Projects
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};


    // StationCard should show this modal/view if it's built

    // Show biomass discovered here

    // Maybe there should be a grid view when you build these stations.