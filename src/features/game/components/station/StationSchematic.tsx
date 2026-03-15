"use client";

import { cn } from "@/src/shared/utils";
import { Telescope, Satellite, Car, Sun, ChevronRight } from "lucide-react";

type ModuleStatus = "online" | "alert" | "standby" | "locked";

interface SchematicModuleProps {
  moduleId: string;
  name: string;
  sublabel: string;
  icon: React.ReactNode;
  status: ModuleStatus;
  statusText: string;
  signalCount?: number;
  accentColor: string; // tailwind color key e.g. "teal"
  glowColor: string;   // rgba string
  onClick: () => void;
  fullWidth?: boolean;
}

// FTL-style segmented power bars
function PowerBars({
  count,
  max = 6,
  color,
}: {
  count: number;
  max?: number;
  color: string;
}) {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-sm transition-all duration-500"
          style={{
            height: `${4 + i * 1.5}px`,
            background: i < count ? color : "rgba(255,255,255,0.06)",
            boxShadow: i < count ? `0 0 4px ${color}` : "none",
          }}
        />
      ))}
    </div>
  );
}

const statusDot: Record<ModuleStatus, string> = {
  online:  "bg-teal-400 shadow-[0_0_6px_rgba(136,192,208,0.9)] animate-pulse-slow",
  alert:   "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)] animate-pulse",
  standby: "bg-sky-500/50",
  locked:  "bg-white/15",
};
const statusLabel: Record<ModuleStatus, string> = {
  online:  "text-teal-400",
  alert:   "text-amber-400",
  standby: "text-sky-400/60",
  locked:  "text-white/20",
};

function SchematicModule({
  moduleId,
  name,
  sublabel,
  icon,
  status,
  statusText,
  signalCount,
  accentColor,
  glowColor,
  onClick,
  fullWidth,
}: SchematicModuleProps) {
  const isActive = status === "online" || status === "alert";
  const bars = Math.min(signalCount ?? 0, 6);
  const activeBars = isActive ? Math.max(2, bars) : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-2 p-3 text-left transition-all duration-200",
        "hover:brightness-110 active:scale-[0.98]",
        fullWidth && "w-full",
      )}
      style={{
        background: isActive
          ? `radial-gradient(ellipse at 30% 20%, ${glowColor.replace("X", "0.06")} 0%, transparent 60%)`
          : "transparent",
      }}
    >
      {/* Module label plate */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDot[status])} aria-hidden />
          <span
            className="font-mono text-[7px] uppercase tracking-[0.25em] leading-none"
            style={{ color: "rgba(136,192,208,0.4)" }}
          >
            {moduleId}
          </span>
        </div>
        {signalCount !== undefined && signalCount > 0 && (
          <span className="font-mono text-[9px] text-amber-400 animate-pulse shrink-0">
            {signalCount} ▲
          </span>
        )}
      </div>

      {/* Main content row */}
      <div className="flex items-center gap-3">
        {/* Icon — scaled up relative to cards */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300",
            isActive
              ? "border-white/10 bg-white/[0.04]"
              : "border-white/5 bg-transparent",
          )}
          style={
            isActive
              ? { boxShadow: `inset 0 0 12px ${glowColor.replace("X", "0.15")}` }
              : undefined
          }
        >
          <div
            className="transition-colors duration-200"
            style={{ color: isActive ? glowColor.replace("X", "0.9") : "rgba(255,255,255,0.2)" }}
          >
            {icon}
          </div>
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors leading-none mb-0.5">
            {sublabel}
          </p>
          <p
            className={cn(
              "font-mono text-[9px] leading-none",
              statusLabel[status],
            )}
          >
            {statusText}
          </p>
        </div>

        {/* Power bars + arrow */}
        <div className="flex items-center gap-2 shrink-0">
          <PowerBars
            count={activeBars}
            color={isActive ? glowColor.replace("X", "0.85") : "rgba(255,255,255,0.1)"}
          />
          <ChevronRight
            className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: glowColor.replace("X", "0.6") }}
            aria-hidden
          />
        </div>
      </div>
    </button>
  );
}

// Horizontal divider — schematic wall between modules
function HWall() {
  return (
    <div
      className="relative h-px mx-0"
      style={{ background: "rgba(136,192,208,0.12)" }}
    >
      {/* Center junction marker */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45"
        style={{ background: "rgba(136,192,208,0.3)" }}
        aria-hidden
      />
    </div>
  );
}

// Vertical divider — schematic wall between side-by-side modules
function VWall() {
  return (
    <div
      className="relative w-px self-stretch"
      style={{ background: "rgba(136,192,208,0.12)" }}
    >
      {/* Center junction marker */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45"
        style={{ background: "rgba(136,192,208,0.3)" }}
        aria-hidden
      />
    </div>
  );
}

// ─── Main schematic ────────────────────────────────────────────────────────────

interface StationSchematicProps {
  telescopeStatus: ModuleStatus;
  telescopeText: string;
  telescopeSignals: number;
  satelliteStatus: ModuleStatus;
  satelliteText: string;
  satelliteSignals: number;
  satelliteAvailable: boolean;
  roverStatus: ModuleStatus;
  roverText: string;
  roverSignals: number;
  solarStatus: ModuleStatus;
  solarText: string;
  onNavigate: (target: "telescope" | "satellite" | "rover" | "solar") => void;
}

export function StationSchematic({
  telescopeStatus,
  telescopeText,
  telescopeSignals,
  satelliteStatus,
  satelliteText,
  satelliteSignals,
  satelliteAvailable,
  roverStatus,
  roverText,
  roverSignals,
  solarStatus,
  solarText,
  onNavigate,
}: StationSchematicProps) {
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "rgba(3, 8, 18, 0.82)",
        border: "1px solid rgba(136,192,208,0.14)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.03), inset 0 0 60px rgba(0,0,0,0.3)",
        // Blueprint grid background
        backgroundImage:
          "linear-gradient(rgba(136,192,208,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(136,192,208,0.035) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Schematic title strip */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{
          borderColor: "rgba(136,192,208,0.1)",
          background: "rgba(136,192,208,0.04)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rotate-45 shrink-0"
            style={{ background: "rgba(136,192,208,0.4)" }}
            aria-hidden
          />
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-teal-400/50">
            Mission Station · Module Map
          </span>
        </div>
        <span className="font-mono text-[7px] text-white/15 uppercase tracking-widest">
          REV 3.1
        </span>
      </div>

      {/* ── Top: Observatory (telescope) ── */}
      <SchematicModule
        fullWidth
        moduleId="OBS-01"
        name="Observatory"
        sublabel="Telescope Array"
        icon={<Telescope className="h-5 w-5" />}
        status={telescopeStatus}
        statusText={telescopeText}
        signalCount={telescopeSignals}
        accentColor="teal"
        glowColor="rgba(136,192,208,X)"
        onClick={() => onNavigate("telescope")}
      />

      <HWall />

      {/* ── Middle row: Comms + Rover ── */}
      <div className="flex">
        <div className="flex-1 min-w-0">
          <SchematicModule
            moduleId={satelliteAvailable ? "COMMS-01" : "COMMS-LOCKED"}
            name="Comms Array"
            sublabel="Satellite Control"
            icon={<Satellite className="h-5 w-5" />}
            status={satelliteAvailable ? satelliteStatus : "locked"}
            statusText={satelliteAvailable ? satelliteText : "Locked — classify more"}
            signalCount={satelliteSignals}
            accentColor="sky"
            glowColor="rgba(56,189,248,X)"
            onClick={() => onNavigate("satellite")}
          />
        </div>

        <VWall />

        <div className="flex-1 min-w-0">
          <SchematicModule
            moduleId="GND-01"
            name="Ground Ops"
            sublabel="Rover Control"
            icon={<Car className="h-5 w-5" />}
            status={roverStatus}
            statusText={roverText}
            signalCount={roverSignals}
            accentColor="amber"
            glowColor="rgba(251,191,36,X)"
            onClick={() => onNavigate("rover")}
          />
        </div>
      </div>

      <HWall />

      {/* ── Bottom: Solar array ── */}
      <SchematicModule
        fullWidth
        moduleId="PWR-01"
        name="Power Systems"
        sublabel="Solar Monitor"
        icon={<Sun className="h-5 w-5" />}
        status={solarStatus}
        statusText={solarText}
        accentColor="orange"
        glowColor="rgba(251,146,60,X)"
        onClick={() => onNavigate("solar")}
      />

      {/* Outer corner brackets — schematic decoration */}
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <div
          key={corner}
          className={cn(
            "absolute w-3 h-3 pointer-events-none",
            corner === "tl" && "top-0 left-0 border-t border-l",
            corner === "tr" && "top-0 right-0 border-t border-r",
            corner === "bl" && "bottom-0 left-0 border-b border-l",
            corner === "br" && "bottom-0 right-0 border-b border-r",
          )}
          style={{ borderColor: "rgba(136,192,208,0.35)" }}
          aria-hidden
        />
      ))}
    </div>
  );
}
