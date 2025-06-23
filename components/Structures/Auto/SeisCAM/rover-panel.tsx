'use client';

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

export function RoverPanel({ rovers, selectedRover, selectRover, showRoverPanel, planets, onClose }: RoverPanelProps) {
    if (!showRoverPanel) {
        return null;
    };

    const getStatusColor = ( status: Rover["status"] ) => {
        switch (status) {
            case "active":
               return "text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/30"
            case "standby":
                return "text-[#FFC107] bg-[#FFC107]/10 border-[#FFC107]/30"
            case "maintenance":
                return "text-[#FF9800] bg-[#FF9800]/10 border-[#FF9800]/30"
            case "offline":
                return "text-[#F44336] bg-[#F44336]/10 border-[#F44336]/30"
            default:
                return "text-[#9E9E9E] bg-[#9E9E9E]/10 border-[#9E9E9E]/30"
        };
    };

    const getPlanetInfo = ( planetId: string ) => {
        return (
            planets.find(( p ) => p.id === planetId) || planets[0] || {
                id: "unknown",
                name: "Unknown",
                surfaceColor: "#CD5C5C",
            }
        )
    };

    const getBatteryColor = ( level: number ) => {
        if (level > 70) return "text-[#4CAF50]";
        if (level > 30) return "text-[#FFC107]"
        return "text-[#F44336]"
    };

    return (
        <></>
    );
};