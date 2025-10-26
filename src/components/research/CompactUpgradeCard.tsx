"use client";

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
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${getCategoryColor()} p-6 transition-all duration-200 hover:scale-[1.01] border min-h-[200px] flex flex-col`}
    >
      {/* Category Badge */}
      <div className="absolute top-3 right-3">
        <span className="text-2xl">{icon || getCategoryIcon()}</span>
      </div>

      {/* Progress indicator */}
      {max > 1 && (
        <div className="absolute top-3 left-3">
          <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs font-semibold">
            {current}/{max}
          </Badge>
        </div>
      )}

      {/* Main content */}
      <div className="mt-8 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-2 pr-8">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
          {description}
        </p>

        {/* Requirements/Status */}
        {isLocked && requirementText && (
          <p className="text-xs text-yellow-400 mb-3 font-medium">{requirementText}</p>
        )}

        {/* Action area */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {!isCompleted && !isLocked && cost > 0 && (
              <Button
                size="default"
                variant={canUpgrade ? "default" : "secondary"}
                disabled={!canUpgrade}
                onClick={onUpgrade}
                className="text-sm font-semibold"
              >
                Research for {cost} ⭐
              </Button>
            )}
            {isCompleted && (
              <Badge variant="default" className="text-sm py-1 px-3">
                ✓ Complete
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-sm py-1 px-3">
                🔒 Locked
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}