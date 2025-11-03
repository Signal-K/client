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
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const countSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
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
    <div 
      className={`flex flex-col items-center gap-2 p-2 ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      <svg
        width={svgSizes[size].width}
        height={svgSizes[size].height}
        viewBox="0 0 100 100"
        className={sizeClasses[size]}
      >
        {/* Outer circle/badge background */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={isUnlocked ? milestoneColor : "#2c4f64"}
          opacity={isUnlocked ? 0.9 : 0.4}
          stroke={isUnlocked ? "#fff" : "#1e2a3a"}
          strokeWidth="2"
        />
        
        {/* Inner circle for icon */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill={isUnlocked ? "#1e2a3a" : "#0a0f14"}
          opacity={isUnlocked ? 0.8 : 0.6}
        />

        {/* Icon container (we'll render React icon as foreignObject) */}
        <foreignObject x="34" y="30" width="32" height="32">
          <div className={`flex items-center justify-center ${iconSizeClasses[size]} ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
            {icon}
          </div>
        </foreignObject>

        {/* Count badge at bottom */}
        <circle
          cx="50"
          cy="75"
          r="15"
          fill={isUnlocked ? "#2c4f64" : "#0a0f14"}
          stroke={isUnlocked ? milestoneColor : "#1e2a3a"}
          strokeWidth="2"
        />
        <text
          x="50"
          y="80"
          textAnchor="middle"
          fill={isUnlocked ? "#fff" : "#555"}
          fontSize="14"
          fontWeight="bold"
          className={countSizeClasses[size]}
        >
          {count}
        </text>

        {/* Lock icon if not unlocked */}
        {!isUnlocked && (
          <g opacity="0.6">
            <rect x="43" y="38" width="14" height="10" rx="1" fill="#999" />
            <path
              d="M 46 38 v -3 a 4 4 0 0 1 8 0 v 3"
              stroke="#999"
              strokeWidth="2"
              fill="none"
            />
          </g>
        )}

        {/* Milestone indicator */}
        {milestone && isUnlocked && (
          <text
            x="85"
            y="25"
            textAnchor="middle"
            fill="#fff"
            fontSize="16"
            fontWeight="bold"
          >
            {milestone}
          </text>
        )}
      </svg>

      <div className={`text-center ${labelSizeClasses[size]} ${isUnlocked ? 'text-white' : 'text-gray-500'} font-medium max-w-[120px] line-clamp-2`}>
        {label}
      </div>
    </div>
  );
};
