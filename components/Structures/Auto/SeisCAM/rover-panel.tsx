"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, X, Battery, Signal, Thermometer, MapPin } from "lucide-react";
import type { Rover } from "@/types/Structures/Rover";

interface RoverPanelProps {
  rovers: Rover[];
  selectedRover: Rover | null;
  selectRover: (rover: Rover | null) => void;
  showRoverPanel: boolean;
  onClose: () => void;
  planets: any[];
};

export function RoverPanel({
  rovers,
  selectedRover,
  selectRover,
  showRoverPanel,
  planets,
  onClose,
}: RoverPanelProps) {
  if (!showRoverPanel) {
    return null;
  }

  const getStatusColor = (status: Rover["status"]) => {
    switch (status) {
      case "active":
        return "text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/30";
      case "standby":
        return "text-[#FFC107] bg-[#FFC107]/10 border-[#FFC107]/30";
      case "maintenance":
        return "text-[#FF9800] bg-[#FF9800]/10 border-[#FF9800]/30";
      case "offline":
        return "text-[#F44336] bg-[#F44336]/10 border-[#F44336]/30";
      default:
        return "text-[#9E9E9E] bg-[#9E9E9E]/10 border-[#9E9E9E]/30";
    }
  };

  const getPlanetInfo = (planetId: string) => {
    return (
      planets.find((p) => p.id === planetId) ||
      planets[0] || {
        id: "unknown",
        name: "Unknown",
        surfaceColor: "#CD5C5C",
      }
    );
  };

  const getBatteryColor = (level: number) => {
    if (level > 70) return "text-[#4CAF50]";
    if (level > 30) return "text-[#FFC107]";
    return "text-[#F44336]";
  };

  return (
    <div className="absolute top-16 right-4 z-50 w-80 bg-gradient-to-br from-[#4E342E] to-[#3E2723] border-2 border-[#8D6E63] rounded-lg shadow-2xl">
      <div className="p-4 border-b border-[#5D4037] flex justify-between items-center">
        <h3 className="font-bold text-[#ECEFF4]">Your Rovers</h3>{" "}
        {/* Surface-based automatons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-[#BCAAA4] hover:text-[#ECEFF4] hover:bg-[#5D3047]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        <Button
          variant={!selectedRover ? "default" : "outline"}
          className={`w-full justify-start ${
            !selectedRover
              ? "bg-[#8D6E63] text-white hover:bg-[#6D4C41]"
              : "bg-[#5D4037] border-[#8D6E63] text-[#ECEFF4] hover:bg-[#6D4C41]"
          }`}
          onClick={() => selectRover(null)}
        >
          <Truck className="h-4 w-4 mr-2" />
          <span>All Automatons</span>
        </Button>

        {rovers.map((rover) => {
          const planet = getPlanetInfo(rover.planet);
          return (
            <div key={rover.id} className="space-y-2">
              <Button
                variant={selectedRover?.id === rover.id ? "default" : "outline"}
                className={`w-full justify-start ${
                  selectedRover?.id === rover.id
                    ? "bg-[#8D6E63] text-white hover:bg-[#6D4C41]"
                    : "bg-[#5D4037] border-[#8D6E63] text-[#ECEFF4] hover:bg-[#6D4C41]"
                }`}
                onClick={() => selectRover(rover)}
                disabled={rover.status === "offline"}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className="w-3 h-3 rounded-full border border-white/30"
                    style={{ backgroundColor: planet.surfaceColor }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{rover.name}</div>
                    <div className="text-xs opacity-75">{planet.name}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(rover.status)}`}
                  >
                    {rover.status}
                  </Badge>
                </div>
              </Button>

              {/* Rover Status Details */}
              <div className="ml-6 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <Battery
                      className={`h-3 w-3 ${getBatteryColor(
                        rover.batteryLevel
                      )}`}
                    />
                    <span className="text-[#BCAAA4]">Battery:</span>
                    <span className={getBatteryColor(rover.batteryLevel)}>
                      {rover.batteryLevel}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Signal className="h-3 w-3 text-[#03A9F4]" />
                    <span className="text-[#BCAAA4]">Signal:</span>
                    <span className="text-[#03A9F4]">
                      {rover.signalStrength}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-[#FF7043]" />
                    <span className="text-[#BCAAA4]">{rover.temperature}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#689F38]" />
                    <span className="text-[#BCAAA4]">
                      {rover.anomalyCount} samples
                    </span>
                  </div>
                </div>
                <div className="text-[#A1887F]">
                  <div>Mission: {rover.missionDuration}</div>
                  <div>Distance: {rover.distanceTraveled}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};