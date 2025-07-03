import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Archive,
  Radio,
  Crosshair,
  Power,
  Calendar,
  Building,
  Filter,
} from "lucide-react";

import React, { useState } from "react";

type TelescopeNavControlsProps = {
  sector: { x: number; y: number };
  setSector: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  sectorName: string;
  targetsCount: number;
  maxTargets: number;
};

export default function TelescopeNavControls({
  sector,
  setSector,
  sectorName,
  targetsCount,
  maxTargets,
}: TelescopeNavControlsProps) {
  const handleNavigate = (direction: "up" | "down" | "left" | "right") => {
    const newSector = { ...sector };
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
    }
    setSector(newSector);
  };

  return (
    <Card className="m-4 bg-[#1a1a2e]/60 border border-[#a8d8ea]/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#e8f4f8] text-sm font-mono flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#a8d8ea]" />
          NAVIGATION
        </CardTitle>
        <CardDescription className="text-xs text-[#a8d8ea]/70">
          {sectorName} — {targetsCount}/{maxTargets} targets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
          <div></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("up")}
            className="h-8 w-8 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 hover:text-[#e8f4f8] border border-[#a8d8ea]/30"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <div></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("left")}
            className="h-8 w-8 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 hover:text-[#e8f4f8] border border-[#a8d8ea]/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-br from-[#a8d8ea] to-[#87ceeb] rounded-full"></div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("right")}
            className="h-8 w-8 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 hover:text-[#e8f4f8] border border-[#a8d8ea]/30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate("down")}
            className="h-8 w-8 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 hover:text-[#e8f4f8] border border-[#a8d8ea]/30"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
};