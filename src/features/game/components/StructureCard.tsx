"use client";

import { ReactNode } from "react";
import { cn } from "@/src/shared/utils";

interface StructureCardProps {
  icon: ReactNode;
  name: string;
  status?: string;
  statusColor?: "green" | "blue" | "amber" | "red" | "muted";
  onClick?: () => void;
  hasNotification?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function StructureCard({
  icon,
  name,
  status,
  statusColor = "muted",
  onClick,
  hasNotification = false,
  disabled = false,
  className,
}: StructureCardProps) {
  const getStatusColorClass = () => {
    switch (statusColor) {
      case "green":
        return "text-green-400";
      case "blue":
        return "text-cyan-400";
      case "amber":
        return "text-amber-400";
      case "red":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-start gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all min-h-[120px]",
        "hover:bg-card/70 hover:border-primary/30 hover:scale-[1.02]",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
    >
      {/* Notification dot */}
      {hasNotification && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
      )}

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        {status && (
          <span className={cn("text-xs", getStatusColorClass())}>{status}</span>
        )}
      </div>
    </button>
  );
}
