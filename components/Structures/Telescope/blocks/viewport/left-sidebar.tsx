"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { projects } from "@/data/projects"
import {
  Telescope,
  Archive,
  TreePine,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Star,
} from "lucide-react"

interface LeftSidebarProps {
  currentSectorName: string
  filteredAnomalies: any[]
  classifications: any[]
  viewMode: string
  setViewMode: (mode: "viewport" | "discoveries" | "skill-tree") => void
  selectedProject: any | null
  selectProject: (project: any | null) => void
  handleNavigate: (direction: "up" | "down" | "left" | "right") => void
  getSectorAnomaliesForProject: (projectId: string | null) => any[]
};

export function LeftSidebar({
  currentSectorName,
  filteredAnomalies,
  classifications,
  viewMode,
  setViewMode,
  selectedProject,
  selectProject,
  handleNavigate,
  getSectorAnomaliesForProject,
}: LeftSidebarProps) {
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-80 bg-[#2E3440] border-r border-[#4C566A] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#4C566A] flex-shrink-0">
        <h1 className="text-[#ECEFF4] font-bold text-xl tracking-wider mb-1">DEEP SPACE OBSERVATORY</h1>
        <p className="text-[#88C0D0] text-sm font-mono">{currentSectorName}</p>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-[#88C0D0]" />
            <span className="text-[#D8DEE9]">{filteredAnomalies.length} targets</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-[#88C0D0]" />
            <span className="text-[#D8DEE9]">{classifications.length} classified</span>
          </div>
        </div>
      </div>

      {/* View Mode Selection */}
      <div className="p-4 border-b border-[#4C566A] flex-shrink-0">
        <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">View Mode</h3>
        <div className="space-y-2">
          <Button
            variant={viewMode === "viewport" ? "default" : "outline"}
            onClick={() => setViewMode("viewport")}
            className={`w-full justify-start ${
              viewMode === "viewport"
                ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                : "border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            }`}
          >
            <Telescope className="h-4 w-4 mr-2" />
            Telescope View
          </Button>
          <Button
            variant={viewMode === "discoveries" ? "default" : "outline"}
            onClick={() => setViewMode("discoveries")}
            className={`w-full justify-start ${
              viewMode === "discoveries"
                ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                : "border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            }`}
          >
            <Archive className="h-4 w-4 mr-2" />
            Discoveries
          </Button>
          <Button
            variant={viewMode === "skill-tree" ? "default" : "outline"}
            onClick={() => setViewMode("skill-tree")}
            className={`w-full justify-start ${
              viewMode === "skill-tree"
                ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                : "border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            }`}
          >
            <TreePine className="h-4 w-4 mr-2" />
            Skill Tree
          </Button>
        </div>
      </div>

      {/* Navigation Controls */}
      {viewMode === "viewport" && (
        <div className="p-4 border-b border-[#4C566A] flex-shrink-0">
          <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">Navigation</h3>
          <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("up")}
              className="border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("left")}
              className="border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-[#88C0D0] rounded-full"></div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("right")}
              className="border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("down")}
              className="border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div></div>
          </div>
        </div>
      )}

      {/* Project Selection */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-[#88C0D0] font-semibold text-sm uppercase tracking-wider mb-3">Active Projects</h3>
          <div className="space-y-2">
            <Button
              variant={!selectedProject ? "default" : "outline"}
              onClick={() => selectProject(null)}
              className={`w-full justify-start ${
                !selectedProject
                  ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                  : "border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
              }`}
            >
              All Projects
            </Button>
            {projects.map((project) => {
              const sectorCount = getSectorAnomaliesForProject(project.id).length
              return (
                <Button
                  key={project.id}
                  variant={selectedProject?.id === project.id ? "default" : "outline"}
                  onClick={() => selectProject(project)}
                  className={`w-full justify-between ${
                    selectedProject?.id === project.id
                      ? "bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
                      : "border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]/50"
                  }`}
                >
                  <span className="truncate text-left">{project.name}</span>
                  <Badge variant="secondary" className="ml-2 bg-[#88C0D0]/20 text-[#88C0D0] text-xs flex-shrink-0">
                    {sectorCount}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Current Sector Info */}
        <div className="p-4 border-t border-[#4C566A]">
          <Card className="bg-[#3B4252] border-[#4C566A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#ECEFF4] text-sm">Current Sector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-[#88C0D0] font-mono text-xs">{currentSectorName}</div>
              <div className="flex justify-between text-xs">
                <span className="text-[#D8DEE9]">Anomalies:</span>
                <span className="text-[#88C0D0]">{filteredAnomalies.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#D8DEE9]">Classified:</span>
                <span className="text-[#A3BE8C]">{filteredAnomalies.filter((a) => a.classified).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#D8DEE9]">Unclassified:</span>
                <span className="text-[#EBCB8B]">{filteredAnomalies.filter((a) => !a.classified).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
};