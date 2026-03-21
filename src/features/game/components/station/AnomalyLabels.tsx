"use client";

import Link from "next/link";

interface Anomaly {
  id: number | string;
  name: string;
  type: string | null;
}

interface AnomalyLabelsProps {
  anomalies: Anomaly[];
}

// Deterministic position from id
function pos(id: number | string, salt: number) {
  const n = typeof id === "number" ? id : id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const x = Math.sin(n * 127.1 + salt) * 43758.5453;
  return (x - Math.floor(x)) * 100;
}

const TYPE_COLOUR: Record<string, string> = {
  planet:   "text-teal-400/50",
  asteroid: "text-amber-400/50",
  cloud:    "text-sky-400/50",
  default:  "text-slate-400/40",
};

export function AnomalyLabels({ anomalies }: AnomalyLabelsProps) {
  if (!anomalies.length) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {anomalies.slice(0, 20).map((a) => {
        const x = pos(a.id, 1);
        const y = pos(a.id, 2);
        const colour = TYPE_COLOUR[a.type ?? "default"] ?? TYPE_COLOUR.default;
        return (
          <Link
            key={a.id}
            href={`/classify/${a.id}`}
            className={`absolute font-mono text-[9px] uppercase tracking-widest pointer-events-auto hover:opacity-100 transition-opacity ${colour}`}
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
            tabIndex={-1}
          >
            {a.name}
          </Link>
        );
      })}
    </div>
  );
}
