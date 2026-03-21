"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/shared/utils";
import type { StructureId, StructureState } from "./StructureCard";

// ─── Blip positions — fixed orbital angles per station ───────────────────────
const BLIPS: Array<{ id: string; angle: number; radius: number }> = [
  { id: "telescope", angle: 38,  radius: 0.48 },
  { id: "satellite", angle: 135, radius: 0.62 },
  { id: "rover",     angle: 230, radius: 0.52 },
  { id: "solar",     angle: 310, radius: 0.68 },
];

// accent colors per station
const STATION_COLORS: Record<string, { base: string; signal: string; glow: string }> = {
  telescope: { base: "rgba(136,192,208,0.55)", signal: "#fbbf24", glow: "rgba(136,192,208,0.7)" },
  satellite: { base: "rgba(56,189,248,0.55)",  signal: "#fbbf24", glow: "rgba(56,189,248,0.7)"  },
  rover:     { base: "rgba(251,146,60,0.55)",  signal: "#fbbf24", glow: "rgba(251,146,60,0.7)"  },
  solar:     { base: "rgba(253,224,71,0.45)",  signal: "#fbbf24", glow: "rgba(253,224,71,0.6)"  },
};

const STATION_MOTION: Record<StructureId, React.CSSProperties> = {
  telescope: {
    animation: "radar-sweep 10s linear infinite",
    transformOrigin: "50% 100%",
  },
  satellite: {
    animation: "orbit 16s linear infinite",
    ["--orbit-radius" as string]: "4px",
  },
  rover: {
    animation: "vehicle-fly 8s ease-in-out -4s infinite alternate",
  },
  solar: {
    animation: "pulse-glow 4s ease-in-out infinite",
  },
};

export interface RadarStation {
  deployed: boolean;
  signals: number;
}

interface SectorRadarProps {
  telescope: RadarStation;
  satellite: RadarStation;
  rover:     RadarStation;
  solar:     RadarStation;
  className?: string;
  onSelect?: (id: StructureId) => void;
  states?: Partial<Record<StructureId, StructureState>>;
}

const SIZE    = 152; // px
const CENTER  = SIZE / 2;
const PERIOD  = 5000; // ms per full sweep

// How many degrees behind the sweep arm a blip stays "lit"
const LIT_WINDOW = 28;

function blipIsLit(sweep: number, blipAngle: number) {
  const delta = ((sweep - blipAngle + 360) % 360);
  return delta >= 0 && delta < LIT_WINDOW;
}

export function SectorRadar({ telescope, satellite, rover, solar, className, onSelect, states }: SectorRadarProps) {
  const [sweep, setSweep] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const angle = ((ts - startRef.current) % PERIOD) / PERIOD * 360;
      setSweep(angle);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const stationMap: Record<string, RadarStation> = { telescope, satellite, rover, solar };

  return (
    <div className={cn("flex gap-4 items-center", className)}>

      {/* ── The radar disc ─────────────────────────────────────────────────── */}
      <div
        className="relative shrink-0 rounded-full overflow-hidden select-none"
        style={{
          width:  SIZE,
          height: SIZE,
          background: "radial-gradient(circle at 50% 50%, rgba(2,18,8,0.98) 0%, rgba(1,8,4,0.99) 100%)",
          border: "1px solid rgba(0,200,100,0.18)",
          boxShadow:
            "0 0 24px rgba(0,150,60,0.08), inset 0 0 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.6)",
        }}
      >
        {/* Scan-line texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full z-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)",
          }}
        />

        {/* Concentric range rings */}
        {[0.28, 0.52, 0.76, 1.0].map((r, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width:  SIZE * r,
              height: SIZE * r,
              top:  CENTER - (SIZE * r) / 2,
              left: CENTER - (SIZE * r) / 2,
              border: "1px solid rgba(0,200,100,0.09)",
            }}
          />
        ))}

        {/* Cross-hairs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute"
            style={{ top: 0, bottom: 0, left: "50%", width: 1, background: "rgba(0,200,100,0.07)", transform: "translateX(-50%)" }}
          />
          <div
            className="absolute"
            style={{ left: 0, right: 0, top: "50%", height: 1, background: "rgba(0,200,100,0.07)", transform: "translateY(-50%)" }}
          />
        </div>

        {/* Sweep sector — conic gradient glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from ${sweep}deg at 50% 50%, transparent 0deg, rgba(0,255,100,0.12) 18deg, rgba(0,255,100,0.04) 50deg, transparent 80deg)`,
          }}
        />

        {/* Sweep arm leading edge */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "50%",
            height: 1,
            top: "50%",
            left: "50%",
            background: "linear-gradient(90deg, rgba(0,255,120,0.7) 0%, transparent 100%)",
            transformOrigin: "0% 50%",
            transform: `translateY(-50%) rotate(${sweep}deg)`,
          }}
        />

        {/* Structure blips */}
        {BLIPS.map(({ id, angle, radius }) => {
          const structureId = id as StructureId;
          const s = stationMap[id];
          if (!s?.deployed) return null;

          const rad  = (angle * Math.PI) / 180;
          const bx   = CENTER + Math.cos(rad) * (CENTER * radius * 0.88);
          const by   = CENTER + Math.sin(rad) * (CENTER * radius * 0.88);
          const lit  = blipIsLit(sweep, angle);
          const cols = STATION_COLORS[id];
          const hasSignals = s.signals > 0;
          const state = states?.[structureId] ?? (hasSignals ? "active" : "standby");
          const isIncoming = state === "incoming";
          const isActive = state === "active" || state === "incoming";
          const label = id.charAt(0).toUpperCase() + id.slice(1);

          return (
            <div
              key={id}
              className="absolute flex flex-col items-center"
              style={{
                left: bx,
                top: by,
                transform: "translate(-50%, -50%)",
              }}
            >
              <button
                type="button"
                onClick={() => onSelect?.(structureId)}
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full border transition-all",
                  onSelect ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40" : "cursor-default",
                  isIncoming && "animate-pulse",
                )}
                style={{
                  background: isActive
                    ? lit ? cols.signal : cols.glow
                    : "rgba(255,255,255,0.08)",
                  borderColor: isActive ? cols.glow : "rgba(255,255,255,0.16)",
                  boxShadow: isIncoming
                    ? "0 0 16px rgba(251,191,36,0.95)"
                    : isActive
                      ? `0 0 12px ${cols.glow}`
                      : "none",
                  opacity: state === "standby" ? 0.7 : 1,
                  ...STATION_MOTION[structureId],
                }}
                aria-label={`${label}: ${hasSignals ? `${s.signals} signals` : "clear"}${onSelect ? ". Open viewport." : ""}`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: hasSignals ? "#020617" : "rgba(255,255,255,0.92)",
                    opacity: hasSignals ? 1 : 0.65,
                  }}
                  aria-hidden
                />
              </button>
              <span
                className="mt-1 block text-center font-mono text-[6px] uppercase tracking-[0.18em]"
                style={{
                  color: isActive ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.42)",
                  textShadow: isActive ? `0 0 8px ${cols.glow}` : "none",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}

        {/* Trailing ghost blips — phosphor persistence effect */}
        {BLIPS.map(({ id, angle, radius }) => {
          const s = stationMap[id];
          if (!s?.deployed) return null;
          const trailAngle = (angle + 15) % 360;
          const lit = blipIsLit(sweep, angle);
          if (!lit) return null;
          const rad = (trailAngle * Math.PI) / 180;
          const bx  = CENTER + Math.cos(rad) * (CENTER * radius * 0.88);
          const by  = CENTER + Math.sin(rad) * (CENTER * radius * 0.88);
          const cols = STATION_COLORS[id];
          return (
            <div
              key={`${id}-trail`}
              className="absolute pointer-events-none"
              style={{
                width: 5,
                height: 5,
                left: bx - 2.5,
                top:  by - 2.5,
                borderRadius: "50%",
                background: cols.base,
                opacity: 0.35,
              }}
            />
          );
        })}

        {/* Home base — center marker */}
        <div
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            left: CENTER - 4,
            top:  CENTER - 4,
            background: "rgba(136,192,208,0.85)",
            boxShadow: "0 0 8px rgba(136,192,208,0.7)",
          }}
        />
        {/* Home base ping */}
        <div
          className="absolute rounded-full border animate-ping pointer-events-none"
          style={{
            width: 18,
            height: 18,
            left: CENTER - 9,
            top:  CENTER - 9,
            borderColor: "rgba(136,192,208,0.3)",
            animationDuration: "3s",
          }}
        />

        {/* Outer ring label: N / E / S / W */}
        {(["N","E","S","W"] as const).map((dir, i) => {
          const a = i * 90 - 90;
          const r = SIZE / 2 - 9;
          const rx = CENTER + Math.cos((a * Math.PI) / 180) * r;
          const ry = CENTER + Math.sin((a * Math.PI) / 180) * r;
          return (
            <span
              key={dir}
              className="absolute font-mono select-none pointer-events-none"
              style={{
                fontSize: 6,
                lineHeight: 1,
                color: "rgba(0,200,100,0.3)",
                left: rx - 3,
                top:  ry - 3,
                letterSpacing: "0.05em",
              }}
            >
              {dir}
            </span>
          );
        })}
      </div>

      {/* ── Sidebar telemetry panel ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">

        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className="h-1 w-1 rounded-full animate-pulse"
            style={{ background: "rgba(0,220,100,0.9)", boxShadow: "0 0 4px rgba(0,220,100,0.8)" }}
          />
          <span
            className="font-mono text-[7px] uppercase tracking-[0.25em]"
            style={{ color: "rgba(0,200,100,0.5)" }}
          >
            Sector Scan
          </span>
        </div>

        {/* Per-station rows */}
        {BLIPS.map(({ id }) => {
          const structureId = id as StructureId;
          const s = stationMap[id];
          const cols = STATION_COLORS[id];
          const label = id.charAt(0).toUpperCase() + id.slice(1);
          const state = states?.[structureId] ?? (!s?.deployed ? "undeployed" : s.signals > 0 ? "active" : "standby");
          return (
            <button
              key={id}
              type="button"
              onClick={() => s?.deployed && onSelect?.(structureId)}
              disabled={!s?.deployed || !onSelect}
              className={cn(
                "flex items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors",
                s?.deployed && onSelect ? "hover:bg-white/5" : "cursor-default",
              )}
            >
              <div
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  background: !s?.deployed
                    ? "rgba(255,255,255,0.1)"
                    : state === "standby"
                      ? "rgba(255,255,255,0.32)"
                      : cols.base,
                  boxShadow: s?.deployed && state !== "standby" ? `0 0 4px ${cols.base}` : "none",
                }}
              />
              <span
                className="font-mono text-[8px] w-16 shrink-0"
                style={{ color: s?.deployed ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)" }}
              >
                {label}
              </span>
              <span
                className="font-mono text-[8px] tabular-nums ml-auto"
                style={{
                  color: s?.signals
                    ? "#fbbf24"
                    : s?.deployed
                      ? "rgba(0,200,100,0.5)"
                      : "rgba(255,255,255,0.12)",
                }}
              >
                {!s?.deployed ? "——" : s.signals > 0 ? `${s.signals} SIG` : "CLEAR"}
              </span>
            </button>
          );
        })}

        {/* Sweep period indicator */}
        <div className="mt-1 relative h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(0,200,100,0.08)" }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${(sweep / 360) * 100}%`,
              background: "linear-gradient(90deg, rgba(0,255,100,0.1), rgba(0,255,100,0.5))",
              transition: "width 50ms linear",
            }}
          />
        </div>
        <div
          className="font-mono text-[6px] uppercase tracking-widest"
          style={{ color: "rgba(0,200,100,0.25)" }}
        >
          Sweep {Math.round(sweep)}°
        </div>
      </div>
    </div>
  );
}
