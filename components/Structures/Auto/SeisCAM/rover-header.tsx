'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Grid3X3, Trophy, Target, Users, User, Truck } from "lucide-react";
import type { RoverProject, ViewMode, Rover } from "@/types/Structures/Rover";

interface RoverHeaderProps {
    selectedProject: RoverProject | null
  selectedRover: Rover | null;
  viewMode: ViewMode;
  toggleProjectPanel: () => void;
  toggleRoverPanel: () => void;
  setViewMode: (mode: ViewMode) => void;
  classifiedCount: number;
  availableMissionsCount: number;
  showAllDiscoveries: boolean;
  setShowAllDiscoveries: (show: boolean) => void;
};

export function RoverHeader({
  selectedProject,
  selectedRover,
  viewMode,
  toggleProjectPanel,
  toggleRoverPanel,
  setViewMode,
  classifiedCount,
  availableMissionsCount,
  showAllDiscoveries,
  setShowAllDiscoveries,
}: RoverHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] border-b border-[#8D6E63] p-3 shadow-lg">
      <div className="flex justify-between items-center">
        {/* Left Side - Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-[#ECEFF4]">Rover Command Center</h1>
            <p className="text-xs text-[#BCAAA4]">
              {selectedRover
                ? `${selectedRover.name} - ${selectedRover.planet.toUpperCase()}`
                : "Surface Exploration Platform"}
            </p>
          </div>
        </div>

        {/* Right Side - Controls & Stats */}
        <div className="flex items-center gap-3">
          {/* Discovery Toggle */}
          <div className="flex items-center gap-2 bg-[#5D4037] rounded-lg px-2 py-1 border border-[#6D4C41]">
            <User className="h-3 w-3 text-[#BCAAA4]" />
            <Switch
              checked={showAllDiscoveries}
              onCheckedChange={setShowAllDiscoveries}
              className="data-[state=checked]:bg-[#8D6E63] scale-75"
            />
            <Users className="h-3 w-3 text-[#BCAAA4]" />
            <span className="text-xs text-[#ECEFF4] ml-1">{showAllDiscoveries ? "All" : "Mine"}</span>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            <Badge className="bg-[#8D6E63] text-white px-2 py-1 text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              {classifiedCount}
            </Badge>
            <Badge className="bg-[#689F38] text-white px-2 py-1 text-xs">
              <Target className="h-3 w-3 mr-1" />
              {availableMissionsCount}
            </Badge>
          </div>

          {/* Rover Selection */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRoverPanel}
            className="bg-[#5D4037] border-[#8D6E63] text-[#ECEFF4] hover:bg-[#6D4C41] text-xs px-2 py-1 h-8"
          >
            <Truck className="h-3 w-3 mr-1" />
            {selectedRover ? <span className="hidden sm:inline">{selectedRover.name}</span> : "Rovers"}
          </Button>

          {/* Project Filter */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleProjectPanel}
            className="bg-[#5D4037] border-[#8D6E63] text-[#ECEFF4] hover:bg-[#6D4C41] text-xs px-2 py-1 h-8"
          >
            {selectedProject ? (
              <div className="flex items-center gap-1">
                {selectedProject.icon}
                <span className="hidden sm:inline">{selectedProject.name}</span>
              </div>
            ) : (
              "Projects"
            )}
          </Button>

          {/* View Toggle */}
          <Button
            variant={viewMode === "discoveries" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "surface" ? "discoveries" : viewMode === "discoveries" ? "rovers" : "surface")
            }
            className={`text-xs px-2 py-1 h-8 ${
              viewMode === "discoveries"
                ? "bg-[#8D6E63] text-white hover:bg-[#6D4C41]"
                : "bg-[#5D4037] border-[#8D6E63] text-[#ECEFF4] hover:bg-[#6D4C41]"
            }`}
          >
            {viewMode === "rovers" ? (
              <>
                <Truck className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Rovers</span>
              </>
            ) : viewMode === "surface" ? (
              <>
                <Grid3X3 className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Archive</span>
              </>
            ) : (
              <>
                <Truck className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Command</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};