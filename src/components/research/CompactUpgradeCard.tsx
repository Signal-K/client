"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface CompactUpgradeCardProps {
  title: string;
  description: string;
  category: "telescope" | "satellite" | "rover";
  current?: number;
  max?: number;
  cost: number;
  available: boolean;
  onUpgrade: () => void;
  icon?: React.ReactNode;
  isLocked?: boolean;
  requirementText?: string;
}

export function CompactUpgradeCard({
  title,
  description,
  category,
  current = 0,
  max = 1,
  cost,
  available,
  onUpgrade,
  icon,
  isLocked = false,
  requirementText,
}: CompactUpgradeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = () => {
    switch (category) {
      case "telescope":
        return "from-blue-500/20 to-purple-500/20 border-blue-400/30";
      case "satellite":
        return "from-green-500/20 to-teal-500/20 border-green-400/30";
      case "rover":
        return "from-orange-500/20 to-red-500/20 border-orange-400/30";
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-400/30";
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "telescope":
        return "🔭";
      case "satellite":
        return "🛰️";
      case "rover":
        return "🛞";
      default:
        return "⚙️";
    }
  };

  const isCompleted = current >= max;
  const canUpgrade = available && !isLocked && !isCompleted;

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${getCategoryColor()} p-4 transition-all duration-200 hover:scale-[1.02] ${
        isExpanded ? "h-auto" : "h-32"
      }`}
    >
      {/* Category Badge */}
      <div className="absolute top-2 right-2">
        <span className="text-lg">{icon || getCategoryIcon()}</span>
      </div>

      {/* Progress indicator */}
      {max > 1 && (
        <div className="absolute top-2 left-2">
          <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
            {current}/{max}
          </Badge>
        </div>
      )}

      {/* Main content */}
      <div className="mt-6">
        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
        <p className={`text-xs text-muted-foreground mb-3 ${isExpanded ? "" : "line-clamp-2"}`}>
          {description}
        </p>

        {/* Requirements/Status */}
        {isLocked && requirementText && (
          <p className="text-xs text-yellow-400 mb-2">{requirementText}</p>
        )}

        {/* Action area */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isCompleted && !isLocked && (
              <Button
                size="sm"
                variant={canUpgrade ? "default" : "secondary"}
                disabled={!canUpgrade}
                onClick={onUpgrade}
                className="text-xs px-2 py-1 h-6"
              >
                {cost > 0 ? `${cost} ⭐` : "Unlock"}
              </Button>
            )}
            {isCompleted && (
              <Badge variant="default" className="text-xs">
                ✓ Complete
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-xs">
                🔒 Locked
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs p-1 h-6"
          >
            {isExpanded ? "↑" : "↓"}
          </Button>
        </div>
      </div>
    </div>
  );
}