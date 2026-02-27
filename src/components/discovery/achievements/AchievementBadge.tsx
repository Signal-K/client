"use client";

import React from "react";

interface AchievementBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  isUnlocked: boolean;
  milestone?: 1 | 5 | 10 | 25;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  count,
  label,
  isUnlocked,
  milestone,
  size = "md",
  onClick,
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  const iconSizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getMilestoneColor = () => {
    if (!milestone) return "#5fcbc3";
    switch (milestone) {
      case 1:
        return "#cd7f32"; // Bronze
      case 5:
        return "#c0c0c0"; // Silver
      case 10:
        return "#ffd700"; // Gold
      case 25:
        return "#b9f2ff"; // Platinum
      default:
        return "#5fcbc3";
    }
  };

  const milestoneColor = getMilestoneColor();
  const svgSizes = {
    sm: { width: 64, height: 64 },
    md: { width: 80, height: 80 },
    lg: { width: 112, height: 112 },
  };

  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-2 p-2 text-left ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`${label} achievement`}
    >
      <div
        className={`${sizeClasses[size]} relative rounded-full border-2 flex items-center justify-center`}
        data-milestone-color={milestoneColor}
        style={{
          backgroundColor: isUnlocked ? milestoneColor : "#2c4f64",
          opacity: isUnlocked ? 0.95 : 0.45,
          borderColor: isUnlocked ? "#ffffff" : "#1e2a3a",
        }}
      >
        <svg
          width={svgSizes[size].width}
          height={svgSizes[size].height}
          className="sr-only"
          aria-hidden="true"
        />
        <div
          className="absolute inset-[16%] rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isUnlocked ? "#1e2a3a" : "#0a0f14",
            opacity: isUnlocked ? 0.86 : 0.65,
          }}
        >
          <div className={`flex items-center justify-center ${iconSizeClasses[size]} ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
            {icon}
          </div>
        </div>

        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 font-bold"
          style={{
            backgroundColor: isUnlocked ? "#2c4f64" : "#0a0f14",
            borderColor: isUnlocked ? milestoneColor : "#1e2a3a",
            color: isUnlocked ? "#fff" : "#555",
          }}
        >
          {count}
        </div>

        {!isUnlocked && (
          <div className="absolute top-[28%] right-[20%] text-[10px] font-semibold text-gray-300 opacity-80">
            LOCK
          </div>
        )}

        {milestone && isUnlocked && (
          <div className="absolute top-0 right-0 text-xs font-bold text-white rounded-full bg-black/30 px-1.5 py-0.5">
            {milestone}
          </div>
        )}
      </div>

      <div className={`text-center ${labelSizeClasses[size]} ${isUnlocked ? 'text-white' : 'text-gray-500'} font-medium max-w-[120px] line-clamp-2`}>
        {label}
      </div>
    </button>
  );
};
