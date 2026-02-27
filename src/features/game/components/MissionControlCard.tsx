"use client";

import { ReactNode } from "react";
import { cn } from "@/src/shared/utils";

type CardVariant = "action" | "status" | "progress";

interface MissionControlCardProps {
  icon: ReactNode;
  iconBgColor?: string;
  title: string;
  subtitle: string;
  variant?: CardVariant;
  actionLabel?: string;
  onAction?: () => void;
  progress?: number; // 0-100 for progress variant
  className?: string;
}

export default function MissionControlCard({
  icon,
  iconBgColor = "bg-amber-500/20",
  title,
  subtitle,
  variant = "status",
  actionLabel,
  onAction,
  progress,
  className,
}: MissionControlCardProps) {
  const getIconStyle = () => {
    switch (variant) {
      case "action":
        return "text-amber-400";
      case "status":
        return "text-green-400";
      case "progress":
        return "text-cyan-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "action":
        return "bg-amber-500/20 border-amber-500/30";
      case "status":
        return "bg-green-500/20 border-green-500/30";
      case "progress":
        return "bg-cyan-500/20 border-cyan-500/30";
      default:
        return iconBgColor;
    }
  };

  const getPanelStyle = () => {
    switch (variant) {
      case "action":
        return "bg-[linear-gradient(90deg,rgba(245,158,11,0.10),rgba(15,23,42,0.70),rgba(15,23,42,0.50))] border-amber-300/20";
      case "status":
        return "bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(15,23,42,0.70),rgba(15,23,42,0.50))] border-emerald-300/20";
      case "progress":
        return "bg-[linear-gradient(90deg,rgba(6,182,212,0.10),rgba(15,23,42,0.70),rgba(15,23,42,0.50))] border-cyan-300/20";
      default:
        return "bg-card/50 border-border/50";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm border transition-all",
        "hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
        getPanelStyle(),
        className
      )}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border",
          getIconBg()
        )}
      >
        <span className={cn("w-5 h-5", getIconStyle())}>{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        
        {/* Progress bar for progress variant */}
        {variant === "progress" && typeof progress === "number" && (
          <div className="mt-2 h-1.5 rounded-full bg-background/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Action button for action variant */}
      {variant === "action" && actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg bg-cyan-500/90 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1"
        >
          {actionLabel}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
