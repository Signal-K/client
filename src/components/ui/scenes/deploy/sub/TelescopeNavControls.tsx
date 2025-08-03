"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  Target,
} from "lucide-react";

interface Sector {
  x: number;
  y: number;
};

interface Props {
  currentSector: Sector;
  setCurrentSector: (sector: Sector) => void;
  setSelectedSector: (sector: Sector) => void;
};

export default function DeployTelescopeViewportNavigationControls({
  currentSector,
  setCurrentSector,
  setSelectedSector,
}: Props) {
  const handleNavigate = (direction: "up" | "down" | "left" | "right") => {
    const newSector = { ...currentSector };
    switch (direction) {
      case "up":
        newSector.y -= 1;
        break;
      case "down":
        newSector.y += 1;
        break;
      case "left":
        newSector.x -= 1;
        break;
      case "right":
        newSector.x += 1;
        break;
    };
    setCurrentSector(newSector);
  };

  const handleSectorSelect = () => {
    setSelectedSector({ ...currentSector });
  };

  return (
    <Card className="m-4 bg-[#002439]/80 border-2 border-[#78cce2]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#e4eff0] text-base flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#78cce2]" /> Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
          <div></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("up")}
            className="h-8 w-8 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("left")}
            className="h-8 w-8 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-[#78cce2] rounded-full"></div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("right")}
            className="h-8 w-8 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("down")}
            className="h-8 w-8 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div></div>
        </div>
        <Button
          onClick={handleSectorSelect}
          className="w-full bg-[#4e7988] text-[#e4eff0] hover:bg-[#78cce2] hover:text-[#002439] text-sm"
        >
          <Target className="h-4 w-4 mr-2" />
          Select Sector
        </Button>
      </CardContent>
    </Card>
  );
};