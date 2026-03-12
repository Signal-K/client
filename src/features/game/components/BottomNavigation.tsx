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
        className="relative flex flex-col items-center justify-center -mt-8 group"
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl border-4 border-background",
            "active:scale-95 duration-200 ease-out",
            isActive
              ? "bg-cyan-500 text-white shadow-cyan-500/25 scale-110"
              : "bg-card text-muted-foreground hover:bg-card/90"
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-xs mt-1 font-semibold transition-colors bg-background/80 px-2 rounded-full backdrop-blur-sm",
            isActive ? "text-cyan-500" : "text-muted-foreground"
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
      className={cn(
        "relative flex flex-col items-center justify-center py-2 px-1 min-w-[64px] min-h-[50px]",
        "active:scale-95 transition-transform duration-150"
      )}
    >
      {hasNotification && (
        <span className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background z-10" />
      )}
      <div
        className={cn(
          "w-7 h-7 flex items-center justify-center transition-colors mb-0.5",
          isActive ? "text-cyan-500" : "text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[11px] font-medium leading-tight transition-colors",
          isActive ? "text-cyan-500" : "text-muted-foreground/80"
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
        "fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <div className="flex items-end justify-between px-4 py-2 max-w-md mx-auto relative">
        <NavButton
          icon={<Telescope className="w-6 h-6" />}
          label="Scope"
          isActive={activeItem === "telescope"}
          hasNotification={telescopeNotification}
          onClick={() => onItemClick("telescope")}
        />
        <NavButton
          icon={<Satellite className="w-6 h-6" />}
          label="Orbit"
          isActive={activeItem === "satellite"}
          hasNotification={satelliteNotification}
          onClick={() => onItemClick("satellite")}
        />
        
        {/* Spacer for center button */}
        <div className="w-16" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3">
             <NavButton
              icon={<Home className="w-7 h-7" />}
              label="Base"
              isActive={activeItem === "base"}
              isCenter
              onClick={() => onItemClick("base")}
            />
        </div>

        <NavButton
          icon={<Car className="w-6 h-6" />}
          label="Rover"
          isActive={activeItem === "rover"}
          hasNotification={roverNotification}
          onClick={() => onItemClick("rover")}
        />
        <NavButton
          icon={<Sun className="w-6 h-6" />}
          label="Solar"
          isActive={activeItem === "solar"}
          hasNotification={solarNotification}
          onClick={() => onItemClick("solar")}
        />
      </div>
    </nav>
  );
}
