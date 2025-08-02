"use client"

import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { projects } from "@/src/shared/data/projects"
import { Telescope, Archive, TreePine, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"

interface MobileMenuProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  viewMode: string
  setViewMode: (mode: "viewport" | "discoveries" | "skill-tree") => void
  selectedProject: any | null
  selectProject: (project: any | null) => void
  handleNavigate: (direction: "up" | "down" | "left" | "right") => void
};

export function MobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  viewMode,
  setViewMode,
  selectedProject,
  selectProject,
  handleNavigate,
}: MobileMenuProps) {
  if (!mobileMenuOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 bg-[#002439]/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#78cce2]/30">
        <h2 className="text-[#e4eff0] font-bold text-lg">Observatory Control</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(false)}
          className="text-[#78cce2] hover:bg-[#4e7988]/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* View Mode Selection */}
        <div className="space-y-3">
          <h3 className="text-[#78cce2] font-semibold text-sm uppercase tracking-wider">View Mode</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={viewMode === "viewport" ? "default" : "outline"}
              onClick={() => {
                setViewMode("viewport")
                setMobileMenuOpen(false)
              }}
              className={`justify-start ${
                viewMode === "viewport"
                  ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                  : "border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              }`}
            >
              <Telescope className="h-4 w-4 mr-2" />
              Telescope View
            </Button>
            <Button
              variant={viewMode === "discoveries" ? "default" : "outline"}
              onClick={() => {
                setViewMode("discoveries")
                setMobileMenuOpen(false)
              }}
              className={`justify-start ${
                viewMode === "discoveries"
                  ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                  : "border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              }`}
            >
              <Archive className="h-4 w-4 mr-2" />
              Discoveries
            </Button>
            <Button
              variant={viewMode === "skill-tree" ? "default" : "outline"}
              onClick={() => {
                setViewMode("skill-tree")
                setMobileMenuOpen(false)
              }}
              className={`justify-start ${
                viewMode === "skill-tree"
                  ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                  : "border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              }`}
            >
              <TreePine className="h-4 w-4 mr-2" />
              Skill Tree
            </Button>
          </div>
        </div>

        {/* Navigation Controls */}
        {viewMode === "viewport" && (
          <div className="space-y-3">
            <h3 className="text-[#78cce2] font-semibold text-sm uppercase tracking-wider">Navigation</h3>
            <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate("up")}
                className="border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate("left")}
                className="border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-[#78cce2] rounded-full"></div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate("right")}
                className="border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate("down")}
                className="border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div></div>
            </div>
          </div>
        )}

        {/* Project Selection */}
        <div className="space-y-3">
          <h3 className="text-[#78cce2] font-semibold text-sm uppercase tracking-wider">Active Project</h3>
          <div className="space-y-2">
            <Button
              variant={!selectedProject ? "default" : "outline"}
              onClick={() => selectProject(null)}
              className={`w-full justify-start ${
                !selectedProject
                  ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                  : "border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
              }`}
            >
              All Projects
            </Button>
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={selectedProject?.id === project.id ? "default" : "outline"}
                onClick={() => selectProject(project)}
                className={`w-full justify-between ${
                  selectedProject?.id === project.id
                    ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                    : "border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/10 hover:text-[#e4eff0]"
                }`}
              >
                <span className="truncate">{project.name}</span>
                <Badge variant="secondary" className="ml-2 bg-[#78cce2]/20 text-[#78cce2] text-xs">
                  {/* {project.anomalyCount || 0} */}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};