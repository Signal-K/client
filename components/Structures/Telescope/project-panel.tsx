"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Star, X } from "lucide-react"
import type { Project } from "@/types/Structures/telescope"

interface Anomaly {
  id: string
  name: string
  description?: string
  project: string // should match Project.id
  severity?: "low" | "medium" | "high"
  timestamp?: string
  // add any other fields relevant to your anomaly data
}

interface ProjectPanelProps {
  projects: Project[]
  selectedProject: Project | null
  selectProject: (project: Project | null) => void
  showProjectPanel: boolean
  onClose: () => void
  anomalies: Anomaly[];
  onNavigate?: (direction: "up" | "down" | "left" | "right") => void;
};

export function ProjectPanel({
  projects,
  selectedProject,
  selectProject,
  showProjectPanel,
  onClose,
  onNavigate,
  anomalies,
}: ProjectPanelProps) {
  if (!showProjectPanel) return null;

  const handleNavigation = ( direction: "up" | "down" | "left" | "right" ) => {
    if (onNavigate) {
      onNavigate(direction);
    };
  };

  return (
    <div className="absolute top-20 right-4 z-50 w-80 bg-gradient-to-br from-[#3B4252] to-[#2E3440] border-2 border-[#5E81AC] rounded-lg shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-[#4C566A] flex justify-between items-center">
        <h3 className="font-bold text-[#ECEFF4]">Mission Control</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[#D8DEE9] hover:text-[#ECEFF4] hover:bg-[#434C5E]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation controls - sector */}
      <div className="p-4 border-b border-[#4C566A]">
        <div className="text-xs text-[#88C0D0] mb-2 font-medium">Sector Navigation</div>
        <div className="grid grid-cols-3 gap-1">
          <div></div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNavigation("up")}
            className="bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A] p-2"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div></div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNavigation("left")}
            className="bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A] p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-[#5E81AC] rounded-full"></div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNavigation("right")}
            className="bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A] p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div></div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNavigation("down")}
            className="bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A] p-2"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <Button
          variant={!selectedProject ? "default" : "outline"}
          className={`w-full justify-start ${
            !selectedProject
              ? "bg-[#5E81AC] text-white hover:bg-[#81A1C1]"
              : "bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A]"
          }`}
          onClick={() => selectProject(null)}
        >
          <Star className="h-4 w-4 mr-2" />
          <span>All Projects</span>
        </Button>

        {projects.map((project) => {
          const count = anomalies.filter((a) => a.project === project.id).length

          return (
            <div key={project.id} className="space-y-2">
              <Button
                variant={selectedProject?.id === project.id ? "default" : "outline"}
                className={`w-full justify-start ${
                  selectedProject?.id === project.id
                    ? "bg-[#5E81AC] text-white hover:bg-[#81A1C1]"
                    : "bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A]"
                }`}
                onClick={() => selectProject(project)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: project.bgGradient }}
                  >
                    {project.icon}
                  </div>
                  <span className="flex-1 text-left">{project.name}</span>
                  <span className="text-xs text-[#D8DEE9]">({count})</span> {/* ✅ Show anomaly count */}
                </div>
              </Button>

              {/* Progress Bar */}
              {/* <div className="ml-8 space-y-1">
                <div className="flex justify-between text-xs text-[#D8DEE9]">
                  <span>Progress</span>
                  <span>
                    {project.completed}/{project.total}
                  </span>
                </div>
                <Progress value={(project.completed / project.total) * 100} className="h-2 bg-[#434C5E]" />
              </div> */}
            </div>
          )
        })}
      </div>
    </div>
  );
};