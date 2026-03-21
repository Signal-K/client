"use client";

import { useEffect, useRef, useState } from "react";

interface Vehicle {
  id: number;
  author: string;
  type: string | null;
  at: string;
}

const ICONS: Record<string, string> = {
  planet:   "🔭",
  asteroid: "🛰️",
  cloud:    "🚀",
  default:  "✦",
};

// Each vehicle gets a stable lane (top %) and duration from its id
function lane(id: number) { return 10 + (id % 7) * 12; }
function dur(id: number)  { return 18 + (id % 5) * 6; }
function delay(id: number){ return (id % 10) * -2; }

export function CommunityVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tooltip, setTooltip] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/community-activity", { cache: "no-store" });
      if (res.ok) setVehicles(await res.json());
    } catch {}
  }

  useEffect(() => {
    load();

    function startPolling() {
      timerRef.current = setInterval(() => {
        if (document.visibilityState === "visible") load();
      }, 60_000);
    }

    startPolling();

    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!vehicles.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {vehicles.map((v) => {
        const icon = ICONS[v.type ?? "default"] ?? ICONS.default;
        const isOpen = tooltip === v.id;
        return (
          <button
            key={v.id}
            onClick={() => setTooltip(isOpen ? null : v.id)}
            className="absolute pointer-events-auto focus:outline-none"
            style={{
              top: `${lane(v.id)}%`,
              left: "-2rem",
              animation: `vehicle-fly ${dur(v.id)}s linear ${delay(v.id)}s infinite`,
              opacity: 0.55,
              willChange: "transform",
            }}
          >
            <span className="text-base">{icon}</span>
            {isOpen && (
              <span className="absolute left-6 top-0 whitespace-nowrap rounded bg-background/90 border border-border/40 px-2 py-1 text-[10px] font-mono text-foreground/80 z-10">
                Sailor {v.author} · {v.type ?? "unknown"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
