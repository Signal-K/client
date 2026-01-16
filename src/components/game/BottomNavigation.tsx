"use client";

import { ReactNode } from "react";
import { cn } from "@/src/shared/utils";
import { Telescope, Satellite, Home, Car, Sun } from "lucide-react";

type NavItem = "telescope" | "satellite" | "base" | "rover" | "solar";

interface BottomNavigationProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
  telescopeNotification?: boolean;
  satelliteNotification?: boolean;
  roverNotification?: boolean;
  solarNotification?: boolean;
  className?: string;
}

interface NavButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  isCenter?: boolean;
  hasNotification?: boolean;
  onClick: () => void;
}

function NavButton({
  icon,
  label,
  isActive,
  isCenter = false,
  hasNotification = false,
  onClick,
}: NavButtonProps) {
  if (isCenter) {
    return (
      <button
        onClick={onClick}
        className="relative flex flex-col items-center justify-center -mt-6"
      >
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
            isActive
              ? "bg-cyan-500 text-white scale-105"
              : "bg-card border border-border text-muted-foreground hover:bg-card/80"
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-[10px] mt-1 font-medium transition-colors",
            isActive ? "text-cyan-400" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center py-2 px-3"
    >
      {hasNotification && (
        <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-red-500" />
      )}
      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[10px] mt-0.5 font-medium transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
}

export default function BottomNavigation({
  activeItem,
  onItemClick,
  telescopeNotification = false,
  satelliteNotification = false,
  roverNotification = false,
  solarNotification = false,
  className,
}: BottomNavigationProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe md:hidden",
        className
      )}
    >
      <div className="flex items-end justify-around px-2 py-1 max-w-md mx-auto">
        <NavButton
          icon={<Telescope className="w-5 h-5" />}
          label="Telescope"
          isActive={activeItem === "telescope"}
          hasNotification={telescopeNotification}
          onClick={() => onItemClick("telescope")}
        />
        <NavButton
          icon={<Satellite className="w-5 h-5" />}
          label="Satellite"
          isActive={activeItem === "satellite"}
          hasNotification={satelliteNotification}
          onClick={() => onItemClick("satellite")}
        />
        <NavButton
          icon={<Home className="w-6 h-6" />}
          label="Base"
          isActive={activeItem === "base"}
          isCenter
          onClick={() => onItemClick("base")}
        />
        <NavButton
          icon={<Car className="w-5 h-5" />}
          label="Rover"
          isActive={activeItem === "rover"}
          hasNotification={roverNotification}
          onClick={() => onItemClick("rover")}
        />
        <NavButton
          icon={<Sun className="w-5 h-5" />}
          label="Solar"
          isActive={activeItem === "solar"}
          hasNotification={solarNotification}
          onClick={() => onItemClick("solar")}
        />
      </div>
    </nav>
  );
}
