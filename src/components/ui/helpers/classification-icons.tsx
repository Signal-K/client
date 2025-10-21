import React from "react";
import { Telescope, Cloud, MapPin, Satellite, Globe } from "lucide-react";

// Function to get color based on anomaly type
export function getAnomalyColor(type: string): string {
  const lowerType = type?.toLowerCase() || "";
  
  if (lowerType.includes("planet")) {
    return "#8b5cf6"; // Purple
  } else if (lowerType.includes("cloud")) {
    return "#3b82f6"; // Blue
  } else if (lowerType.includes("telescope") || lowerType.includes("asteroid") || lowerType.includes("minor")) {
    return "#f59e0b"; // Amber/Orange
  } else if (lowerType.includes("tess")) {
    return "#a855f7"; // Purple variant
  } else if (lowerType.includes("satellite")) {
    return "#10b981"; // Green
  }
  
  return "#6b7280"; // Gray default
}

// Component to render classification icon
export function ClassificationIcon({ type }: { type: string | null }) {
  const lowerType = type?.toLowerCase() || "";
  
  if (lowerType.includes("planet")) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30">
        <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
    );
  } else if (lowerType.includes("cloud")) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    );
  } else if (lowerType.includes("telescope") || lowerType.includes("asteroid") || lowerType.includes("minor")) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
        <Telescope className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
    );
  } else if (lowerType.includes("satellite")) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
        <Satellite className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  
  // Default icon
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900/30">
      <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </div>
  );
}
