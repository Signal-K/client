'use client'

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Grid3X3, Trophy, Target, Users, User, Globe } from "lucide-react";
import type { WeatherProject, ViewMode, Planet } from "@/types/Structures/WeatherBalloon";

interface WeatherHeaderProps {
  selectedProject: WeatherProject | null;
  selectedPlanet: Planet | null;
  viewMode: ViewMode;
  toggleProjectPanel: () => void;
  setViewMode: (mode: ViewMode) => void;
  classifiedCount: number;
  availableMissionsCount: number;
  showAllDiscoveries: boolean;
  setShowAllDiscoveries: (show: boolean) => void;
};

export function WeatherHeader({
  selectedProject,
  selectedPlanet,
  viewMode,
  toggleProjectPanel,
  setViewMode,
  classifiedCount,
  availableMissionsCount,
  showAllDiscoveries,
  setShowAllDiscoveries,
}: WeatherHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#263238] to-[#37474F] border-b border-[#607D8B] p-3 shadow-lg">
      <div className="flex justify-between items-center">
        {/* Left Side - Title */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-[#ECEFF4]">Weather Observatory</h1>
            <p className="text-xs text-[#B0BEC5]">
              {selectedPlanet ? `${selectedPlanet.name} Analysis` : "Meteorological Platform"}
            </p>
          </div>
        </div>

        {/* Right Side - Controls & Stats */}
        <div className="flex items-center gap-3">
          {/* Discovery Toggle */}
          <div className="flex items-center gap-2 bg-[#455A64] rounded-lg px-2 py-1 border border-[#546E7A]">
            <User className="h-3 w-3 text-[#B0BEC5]" />
            <Switch
              checked={showAllDiscoveries}
              onCheckedChange={setShowAllDiscoveries}
              className="data-[state=checked]:bg-[#607D8B] scale-75"
            />
            <Users className="h-3 w-3 text-[#B0BEC5]" />
            <span className="text-xs text-[#ECEFF4] ml-1">{showAllDiscoveries ? "All" : "Mine"}</span>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            <Badge className="bg-[#607D8B] text-white px-2 py-1 text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              {classifiedCount}
            </Badge>
            <Badge className="bg-[#4CAF50] text-white px-2 py-1 text-xs">
              <Target className="h-3 w-3 mr-1" />
              {availableMissionsCount}
            </Badge>
          </div>

          {/* Project Filter */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleProjectPanel}
            className="bg-[#455A64] border-[#607D8B] text-[#ECEFF4] hover:bg-[#546E7A] text-xs px-2 py-1 h-8"
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
              setViewMode(viewMode === "surface" ? "discoveries" : viewMode === "discoveries" ? "planets" : "surface")
            }
            className={`text-xs px-2 py-1 h-8 ${
              viewMode === "discoveries"
                ? "bg-[#607D8B] text-white hover:bg-[#546E7A]"
                : "bg-[#455A64] border-[#607D8B] text-[#ECEFF4] hover:bg-[#546E7A]"
            }`}
          >
            {viewMode === "planets" ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Planets</span>
              </>
            ) : viewMode === "surface" ? (
              <>
                <Grid3X3 className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Archive</span>
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Observatory</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};