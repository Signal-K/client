"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProjects(initialInterests);
    setExpandedProject(null);
  }, [initialInterests, isOpen]);

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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border-border/60 bg-background/95 p-0 shadow-2xl">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 star-field opacity-25" />
          <div className="pointer-events-none absolute inset-0 sunburst-bg opacity-30" />

          <DialogHeader className="relative border-b border-border/40 px-6 pb-5 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Mission Focus
            </span>
            <DialogTitle className="mt-2 flex items-center gap-2 text-2xl font-black tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              Select your project roster
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Choose the science tracks you want surfaced in the hub. We will use these
              preferences to keep deployments and prompts aligned with your current mission goals.
            </DialogDescription>
          </DialogHeader>

          <div className="relative max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {selectedProjects.length || PROJECTS.length} tracks armed
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Select all projects
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {PROJECTS.map((project) => {
                const isSelected = selectedProjects.includes(project.id);
                const isExpanded = expandedProject === project.id;

                return (
                  <div
                    key={project.id}
                    className={cn(
                      "sci-fi-panel relative overflow-hidden p-0 transition-all duration-300",
                      isSelected
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_rgba(129,161,193,0.4)]"
                        : "hover:border-primary/30 hover:bg-muted/20"
                    )}
                  >
                    <button
                      type="button"
                      className="w-full px-5 py-4 text-left"
                      onClick={() => toggleProject(project.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                            isSelected ? project.bgColor : "border-border/50 bg-background/50"
                          )}
                        >
                          <span className={isSelected ? project.color : "text-muted-foreground"}>
                            {project.icon}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                                {project.structure}
                              </p>
                              <h3 className="mt-1 text-base font-bold text-foreground">
                                {project.title}
                              </h3>
                            </div>

                            <div
                              className={cn(
                                "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/50 text-transparent"
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          </div>

                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {project.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className={cn("text-[11px] font-semibold", project.color)}>
                              {project.shortTitle}
                            </span>
                            <span className="rounded-full border border-border/40 bg-background/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                              {isSelected ? "Selected" : "Optional"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <div className="border-t border-border/30 px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {isExpanded ? "Hide mission brief" : "Open mission brief"}
                        <ArrowRight
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 rounded-xl border border-border/40 bg-background/50 p-4 text-sm leading-relaxed text-muted-foreground">
                          {project.detailedDescription}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 border-t border-border/40 bg-background/90 px-6 py-4">
            <div className="text-xs text-muted-foreground">
              {selectedProjects.length > 0
                ? `${selectedProjects.length} projects selected`
                : "No project selected. Saving now will arm all tracks by default."}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onClose}>
                Skip for now
              </Button>
              <Button onClick={handleSave} className="btn-glow gap-2 rounded-full px-5 font-black uppercase tracking-[0.18em]">
                Save preferences
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
