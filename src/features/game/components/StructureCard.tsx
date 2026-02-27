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

  const getPanelGlow = () => {
    switch (statusColor) {
      case "green":
        return "shadow-[0_0_0_1px_rgba(74,222,128,0.15),0_8px_26px_rgba(16,185,129,0.15)]";
      case "blue":
        return "shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_8px_26px_rgba(14,116,144,0.25)]";
      case "amber":
        return "shadow-[0_0_0_1px_rgba(251,191,36,0.15),0_8px_26px_rgba(180,83,9,0.25)]";
      case "red":
        return "shadow-[0_0_0_1px_rgba(248,113,113,0.15),0_8px_26px_rgba(185,28,28,0.25)]";
      default:
        return "shadow-[0_0_0_1px_rgba(148,163,184,0.14),0_8px_24px_rgba(15,23,42,0.25)]";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden flex flex-col items-start gap-3 p-4 rounded-xl backdrop-blur-sm border border-border/50 transition-all min-h-[120px]",
        "bg-gradient-to-br from-card/80 to-card/45",
        "hover:bg-card/70 hover:border-primary/30 hover:scale-[1.02]",
        getPanelGlow(),
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

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
