"use client";

import { useState } from "react";
import { cn } from "@/src/shared/utils";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import {
  Telescope,
  Globe,
  Cloud,
  Car,
  Snowflake,
  Sun,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ProjectType } from "@/src/hooks/useUserPreferences";

interface Project {
  id: ProjectType;
  title: string;
  shortTitle: string;
  description: string;
  detailedDescription: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  structure: "telescope" | "satellite" | "rover" | "solar";
}

const PROJECTS: Project[] = [
  {
    id: "planet-hunting",
    title: "Discover Exoplanets",
    shortTitle: "Planets",
    description: "Find planets orbiting distant stars",
    detailedDescription:
      "Use your telescope to analyze light curves from NASA's TESS mission. When a planet passes in front of its star, it causes a tiny dip in brightness. By identifying these patterns, you help discover new worlds that could harbor life!",
    icon: <Globe className="w-6 h-6" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20 border-blue-500/30",
    structure: "telescope",
  },
  {
    id: "asteroid-hunting",
    title: "Hunt Asteroids",
    shortTitle: "Asteroids",
    description: "Track asteroids and minor planets",
    detailedDescription:
      "Compare sequences of telescope images to spot moving objects. Asteroids shift position between frames while stars stay fixed. Your discoveries help track potentially hazardous asteroids and find future exploration targets!",
    icon: <Telescope className="w-6 h-6" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
    structure: "telescope",
  },
  {
    id: "cloud-tracking",
    title: "Track Clouds & Storms",
    shortTitle: "Clouds",
    description: "Study alien atmospheres",
    detailedDescription:
      "Deploy satellites to orbit planets you've discovered. Identify cloud formations on Mars and massive storms on gas giants like Jupiter. Your classifications help scientists understand climate patterns across the solar system!",
    icon: <Cloud className="w-6 h-6" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
    structure: "satellite",
  },
  {
    id: "rover-training",
    title: "Train AI Rovers",
    shortTitle: "Rovers",
    description: "Help rovers navigate terrain",
    detailedDescription:
      "Classify Martian terrain to train autonomous rovers. Identify sand, rocks, and soil in rover images. Your work directly helps NASA's rovers navigate safely and discover mineral deposits for future mining operations!",
    icon: <Car className="w-6 h-6" />,
    color: "text-green-400",
    bgColor: "bg-green-500/20 border-green-500/30",
    structure: "rover",
  },
  {
    id: "ice-tracking",
    title: "Track Seasonal Ice",
    shortTitle: "Ice",
    description: "Monitor planetary ice behavior",
    detailedDescription:
      "Study how ice sublimates (turns directly to gas) on Mars. Identify 'fans' and 'blotches' - dark patterns that appear as CO₂ ice evaporates in spring. This helps us understand Martian seasons and find water resources!",
    icon: <Snowflake className="w-6 h-6" />,
    color: "text-sky-300",
    bgColor: "bg-sky-500/20 border-sky-500/30",
    structure: "satellite",
  },
  {
    id: "solar-monitoring",
    title: "Monitor Solar Activity",
    shortTitle: "Solar",
    description: "Track sunspots and solar flares",
    detailedDescription:
      "Count and classify sunspots to monitor our Sun's health. Solar activity can cause electrical outages on Earth and affects space weather throughout the solar system. Your observations help predict dangerous solar storms!",
    icon: <Sun className="w-6 h-6" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20 border-yellow-500/30",
    structure: "solar",
  },
];

interface ProjectPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interests: ProjectType[]) => void;
  initialInterests?: ProjectType[];
}

export default function ProjectPreferencesModal({
  isOpen,
  onClose,
  onSave,
  initialInterests = [],
}: ProjectPreferencesModalProps) {
  const [selectedProjects, setSelectedProjects] = useState<ProjectType[]>(initialInterests);
  const [expandedProject, setExpandedProject] = useState<ProjectType | null>(null);

  const toggleProject = (projectId: ProjectType) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((p) => p !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSave = () => {
    // If nothing selected, default to all projects
    const interests = selectedProjects.length > 0 ? selectedProjects : PROJECTS.map((p) => p.id);
    onSave(interests);
    onClose();
  };

  const selectAll = () => {
    setSelectedProjects(PROJECTS.map((p) => p.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            What interests you most?
          </DialogTitle>
          <DialogDescription>
            Choose the projects you'd like to focus on. We'll highlight these on your
            dashboard and tailor your experience. You can change this anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {PROJECTS.map((project) => {
            const isSelected = selectedProjects.includes(project.id);
            const isExpanded = expandedProject === project.id;

            return (
              <div
                key={project.id}
                className={cn(
                  "relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden",
                  isSelected
                    ? project.bgColor
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4"
                  onClick={() => toggleProject(project.id)}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      isSelected ? project.bgColor : "bg-muted"
                    )}
                  >
                    <span className={isSelected ? project.color : "text-muted-foreground"}>
                      {project.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </div>

                {/* Learn more button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedProject(isExpanded ? null : project.id);
                  }}
                  className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors border-t border-border/30"
                >
                  {isExpanded ? "Show less" : "Learn more about this project"}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3 bg-background/30">
                    {project.detailedDescription}
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Uses: </span>
                      <span className={project.color}>
                        {project.structure.charAt(0).toUpperCase() + project.structure.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={selectAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Select all projects
          </button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Skip for now
            </Button>
            <Button onClick={handleSave} className="gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Selection summary */}
        {selectedProjects.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            {selectedProjects.length} project{selectedProjects.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
