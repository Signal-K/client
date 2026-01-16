"use client";

import { cn } from "@/src/shared/utils";

interface PlanetHeroSectionProps {
  planetName: string;
  sectorName?: string;
  backgroundImage?: string;
  stardust?: number;
  rank?: number;
  className?: string;
}

export default function PlanetHeroSection({
  planetName,
  sectorName = "Sector 7G",
  backgroundImage = "/assets/Backdrops/Earth.png",
  stardust,
  rank,
  className,
}: PlanetHeroSectionProps) {
  return (
    <div
      className={cn(
        "relative w-full h-32 sm:h-40 md:h-48 rounded-b-3xl overflow-hidden",
        className
      )}
    >
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={planetName}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Decorative dots/stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + Math.sin(i) * 30}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-4 sm:p-6">
        <div className="flex items-end justify-between">
          {/* Planet info */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {planetName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{sectorName}</p>
          </div>

          {/* Stats (desktop only) */}
          {(stardust !== undefined || rank !== undefined) && (
            <div className="hidden sm:flex items-center gap-4">
              {stardust !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Stardust
                  </p>
                  <p className="text-lg font-bold text-cyan-400">
                    {stardust.toLocaleString()}
                  </p>
                </div>
              )}
              {rank !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Rank
                  </p>
                  <p className="text-lg font-bold text-primary">#{rank}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
