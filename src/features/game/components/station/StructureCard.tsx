"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";

export type StructureId = "telescope" | "satellite" | "rover" | "solar";
export type StructureState = "undeployed" | "standby" | "active" | "incoming";

const STRUCTURE_CONFIG: Record<StructureId, {
  label: string;
  accent: string;
  border: string;
  glow: string;
  glowRgb: string;
  personality: Record<StructureState, string>;
}> = {
  telescope: {
    label: "Telescope",
    accent: "text-teal-400",
    border: "border-teal-500/40",
    glow: "shadow-[0_0_20px_rgba(45,212,191,0.25)]",
    glowRgb: "45,212,191",
    personality: {
      undeployed: "System offline. Awaiting parameters.",
      standby:    "Scanning sector. Data accumulation in progress.",
      active:     "Classification pending. High-confidence signals identified.",
      incoming:   "Data stream active. Processing signal packets...",
    },
  },
  satellite: {
    label: "Satellite",
    accent: "text-sky-400",
    border: "border-sky-500/40",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.25)]",
    glowRgb: "56,189,248",
    personality: {
      undeployed: "Awaiting orbital insertion.",
      standby:    "Maintaining orbit. Surface telemetry nominal.",
      active:     "Atmospheric data available for analysis.",
      incoming:   "Downlinking orbital imagery...",
    },
  },
  rover: {
    label: "Rover",
    accent: "text-amber-400",
    border: "border-amber-500/40",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.25)]",
    glowRgb: "251,191,36",
    personality: {
      undeployed: "Surface asset docked.",
      standby:    "Traversal in progress. Analyzing local terrain.",
      active:     "Geological features identified. Awaiting labels.",
      incoming:   "Telemetry synchronized. Syncing surface data...",
    },
  },
  solar: {
    label: "Solar Array",
    accent: "text-orange-400",
    border: "border-orange-500/30",
    glow: "shadow-[0_0_24px_rgba(251,146,60,0.3)]",
    glowRgb: "251,146,60",
    personality: {
      undeployed: "Observatory protocol available.",
      standby:    "Solar monitoring active. All arrays nominal.",
      active:     "Active regions identified for count.",
      incoming:   "High-energy event detected. Capturing...",
    },
  },
};

interface StructureCardProps {
  id: StructureId;
  state: StructureState;
  signals?: number;
  isSolar?: boolean;
  waitTime?: string;
  onClick: () => void;
  onQuickDeploy?: (e: React.MouseEvent) => void;
}

export function StructureCard({ id, state, signals = 0, isSolar = false, waitTime, onClick, onQuickDeploy }: StructureCardProps) {
  const cfg = STRUCTURE_CONFIG[id];
  const [showScanLine, setShowScanLine] = useState(false);
  const prevState = useRef(state);

  // Trigger scan-line animation when transitioning to incoming/active
  useEffect(() => {
    if (state === "incoming" && prevState.current !== "incoming") {
      setShowScanLine(true);
      const t = setTimeout(() => setShowScanLine(false), 1200);
      return () => clearTimeout(t);
    }
    prevState.current = state;
  }, [state]);

  const isStandby    = state === "standby";
  const isActive     = state === "active" || state === "incoming";
  const isUndeployed = state === "undeployed";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${cfg.label} — ${cfg.personality[state]}`}
      className={cn(
        "relative w-full cursor-pointer overflow-hidden rounded-xl border text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 active:scale-[0.98]",
        // Standby: subdued, but still clearly readable and interactive.
        isStandby && "border-border/30",
        // Active: accent border + ambient glow
        isActive && cn(cfg.border, cfg.glow),
        // Undeployed: visibly available, with its deploy action at full contrast.
        isUndeployed && "border-border/25",
        // Solar: community glow override
        isSolar && isActive && "shadow-[0_0_28px_rgba(251,146,60,0.35),0_0_0_1px_rgba(251,146,60,0.2)]",
      )}
      style={{
        background: isStandby
          ? "rgba(8,15,28,0.92)"
          : isActive
            ? `radial-gradient(ellipse at 50% 0%, rgba(${cfg.glowRgb},0.08) 0%, rgba(4,10,22,0.85) 70%)`
            : "rgba(6,12,24,0.92)",
      }}
    >
      {/* Scan-line sweep animation on incoming */}
      {showScanLine && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(${cfg.glowRgb},0.15) 50%, transparent 100%)`,
            animation: "scan-down 1.2s ease-out forwards",
          }}
          aria-hidden
        />
      )}

      {/* Active breathing glow border */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none animate-[pulse-glow_3s_ease-in-out_infinite]"
          style={{ boxShadow: `inset 0 0 0 1px rgba(${cfg.glowRgb},0.3)` }}
          aria-hidden
        />
      )}

      <div className="p-3 sm:p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={cn("font-mono text-[9px] uppercase tracking-[0.25em]", isStandby ? "text-muted-foreground/30" : cfg.accent)}>
              {cfg.label}
            </span>
            {/* Solar community badge */}
            {isSolar && (
              <span className="ml-2 text-[8px] font-bold uppercase tracking-widest text-orange-400/60 border border-orange-500/20 rounded-full px-1.5 py-0.5">
                Community
              </span>
            )}
          </div>

          {/* State LED */}
          <div
            className={cn(
              "h-2 w-2 rounded-full shrink-0 mt-0.5",
              isUndeployed && "bg-muted-foreground/15",
              isStandby    && "bg-muted-foreground/20",
              isActive     && cn("animate-[pulse-glow_3s_ease-in-out_infinite]"),
            )}
            style={isActive ? { background: `rgba(${cfg.glowRgb},0.9)`, boxShadow: `0 0 6px rgba(${cfg.glowRgb},0.8)` } : undefined}
            aria-hidden
          />
        </div>

        {/* Signal count / state display */}
        <div className={cn("mb-2 text-xl font-black leading-none tabular-nums sm:text-2xl", isStandby ? "text-muted-foreground/60" : isActive ? cfg.accent : "text-muted-foreground/50")}>
          {isUndeployed ? "—" : signals > 0 ? signals : "·"}
        </div>

        {/* Status label */}
        <div className={cn("font-mono text-[9px] uppercase leading-tight tracking-widest", isStandby ? "text-muted-foreground/70" : isActive ? "text-foreground/70" : "text-muted-foreground/60")}>
          {signals > 0 
            ? `${signals} signal${signals !== 1 ? "s" : ""} awaiting` 
            : isStandby 
              ? (waitTime ? `Next Data: ${waitTime}` : "Monitoring...") 
              : isUndeployed 
                ? (isSolar ? "Initialize" : "Initialize") 
                : "Nominal"}
        </div>

        {/* Quick Deploy Action (Mobile-friendly) */}
        {isUndeployed && onQuickDeploy && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickDeploy(e);
              }}
              className="w-full py-2 px-2 rounded bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-wider text-primary-foreground transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Quick Deploy
            </button>
          </div>
        )}

        {/* Personality copy */}
        {!isUndeployed && (
          <p className={cn("mt-2 text-[9px] leading-relaxed sm:text-[10px]", isStandby ? "text-muted-foreground/55" : "text-muted-foreground/65")}>
            {cfg.personality[state]}
          </p>
        )}
      </div>
    </div>
  );
}
