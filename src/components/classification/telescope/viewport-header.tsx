"use client"

import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Switch } from "@/src/components/ui/switch"
import { Grid3X3, Trophy, Target, Users, User, ChevronUp, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import type { Project, ViewMode } from "@/types/Structures/telescope"

interface ViewportHeaderProps {
  selectedProject: Project | null
  viewMode: ViewMode
  toggleProjectPanel: () => void
  setViewMode: (mode: ViewMode) => void
  classifiedCount: number
  availableMissionsCount: number
  showAllDiscoveries: boolean
  setShowAllDiscoveries: (show: boolean) => void;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
};

export function ViewportHeader({
  selectedProject,
  viewMode,
  toggleProjectPanel,
  setViewMode,
  classifiedCount,
  onNavigate,
  availableMissionsCount,
  showAllDiscoveries,
  setShowAllDiscoveries,
}: ViewportHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#2E3440] to-[#3B4252] border-b-2 border-[#5E81AC] p-4 shadow-lg">
      <div className="flex justify-between items-center">
        {/* Left Side - Title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#ECEFF4]">Telescope</h1>
          </div>
        </div>

        {/* Right Side - Controls & Stats */}
        <div className="flex items-center gap-4">
          {/* Discovery Toggle */}
          <div className="flex items-center gap-2 bg-[#434C5E] rounded-lg px-3 py-2 border border-[#4C566A]">
            <User className="h-4 w-4 text-[#D8DEE9]" />
            <Switch
              checked={showAllDiscoveries}
              onCheckedChange={setShowAllDiscoveries}
              className="data-[state=checked]:bg-[#5E81AC]"
            />
            <Users className="h-4 w-4 text-[#D8DEE9]" />
            <span className="text-sm text-[#ECEFF4] ml-2">{showAllDiscoveries ? "All Users" : "My Discoveries"}</span>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            <Badge className="bg-[#5E81AC] text-white px-3 py-1">
              <Trophy className="h-3 w-3 mr-1" />
              {classifiedCount}
            </Badge>
            <Badge className="bg-[#EBCB8B] text-[#2E3440] px-3 py-1">
              <Target className="h-3 w-3 mr-1" />
              {availableMissionsCount}
            </Badge>
          </div>

          {/* Project Filter */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={toggleProjectPanel}
            className="bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A]"
          >
            {selectedProject ? (
              <div className="flex items-center gap-2">
                {selectedProject.icon}
                <span>{selectedProject.name}</span>
              </div>
            ) : (
              "All Projects"
            )}
          </Button> */}

          {/* View Toggle */}
          <Button
            variant={viewMode === "discoveries" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(viewMode === "viewport" ? "discoveries" : "viewport")}
            className={
              viewMode === "discoveries"
                ? "bg-[#5E81AC] text-white hover:bg-[#81A1C1]"
                : "bg-[#434C5E] border-[#5E81AC] text-[#ECEFF4] hover:bg-[#4C566A]"
            }
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            <span>{viewMode === "viewport" ? "Archive" : "Telescope"}</span>
          </Button>
          <div className="md:hidden bg-[#3B4252] rounded-lg p-2 flex items-center gap-1">
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("up")}
                className="bg-[#5E81AC] border-[#81A1C1] text-white hover:bg-[#81A1C1] p-1 h-6 w-6"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <div></div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("left")}
                className="bg-[#5E81AC] border-[#81A1C1] text-white hover:bg-[#81A1C1] p-1 h-6 w-6"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-1 h-1 bg-[#81A1C1] rounded-full"></div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("right")}
                className="bg-[#5E81AC] border-[#81A1C1] text-white hover:bg-[#81A1C1] p-1 h-6 w-6"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <div></div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("down")}
                className="bg-[#5E81AC] border-[#81A1C1] text-white hover:bg-[#81A1C1] p-1 h-6 w-6"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
};