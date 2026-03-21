"use client";

import { Telescope, Satellite, Car, Sun } from "lucide-react";
import type { ProjectType } from "@/src/hooks/useUserPreferences";

const STRUCTURE_MAP: Record<ProjectType, { icon: typeof Telescope; color: string; label: string; x: number; y: number }> = {
  "planet-hunting":   { icon: Telescope, color: "#2dd4bf", label: "Telescope",  x: 30, y: 35 },
  "cloud-tracking":   { icon: Satellite, color: "#38bdf8", label: "Satellite",  x: 65, y: 25 },
  "rover-training":   { icon: Car,       color: "#fbbf24", label: "Rover",      x: 50, y: 65 },
  "solar-monitoring": { icon: Sun,       color: "#fb923c", label: "Solar",      x: 75, y: 55 },
  "asteroid-hunting": { icon: Telescope, color: "#2dd4bf", label: "Telescope",  x: 30, y: 35 },
  "ice-tracking":     { icon: Satellite, color: "#38bdf8", label: "Satellite",  x: 65, y: 25 },
};

interface OnboardingSchematicProps {
  selected: ProjectType | null;
}

export function OnboardingSchematic({ selected }: OnboardingSchematicProps) {
  const structure = selected ? STRUCTURE_MAP[selected] : null;
  const Icon = structure?.icon;

  return (
    <div
      className="relative w-full rounded-2xl border border-border/30 overflow-hidden"
      style={{ height: 140, background: "rgba(4,10,22,0.7)" }}
    >
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`v${i}`} x1={`${i * 20}%`} y1="0" x2={`${i * 20}%`} y2="100%" stroke="currentColor" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 33}%`} x2="100%" y2={`${i * 33}%`} stroke="currentColor" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Empty state label */}
      {!selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
            Select a project to place your first structure
          </span>
        </div>
      )}

      {/* Structure icon — animates in on selection */}
      {structure && Icon && (
        <div
          className="absolute flex flex-col items-center gap-1"
          style={{
            left: `${structure.x}%`,
            top: `${structure.y}%`,
            transform: "translate(-50%, -50%)",
            animation: "fade-up 0.5s ease-out",
          }}
        >
          <div
            className="rounded-xl p-2 border"
            style={{
              background: `${structure.color}18`,
              borderColor: `${structure.color}50`,
              boxShadow: `0 0 16px ${structure.color}40`,
            }}
          >
            <Icon style={{ color: structure.color }} className="h-5 w-5" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: structure.color }}>
            {structure.label}
          </span>
        </div>
      )}

      {/* Corner label */}
      <span className="absolute top-2 left-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">
        Station Schematic
      </span>
    </div>
  );
}
