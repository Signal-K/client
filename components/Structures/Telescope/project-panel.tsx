"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, X } from "lucide-react"
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
  anomalies: Anomaly[]
};

export function ProjectPanel({
  projects,
  selectedProject,
  selectProject,
  showProjectPanel,
  onClose,
  anomalies,
}: ProjectPanelProps) {
  if (!showProjectPanel) return null

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