"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Radio, FlaskConical } from "lucide-react";

interface HUDStripProps {
  signals: number;
  anomalies: number;
  classifications: number;
}

function OdometerNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    prev.current = value;
    // Brief count-up animation
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = Math.min(Math.abs(diff), 8);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplay(Math.round(start + (diff * i) / steps));
      if (i >= steps) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className="tabular-nums inline-block min-w-[2ch] text-right">{display}</span>;
}

export function HUDStrip({ signals, anomalies, classifications }: HUDStripProps) {
  const metrics = [
    { icon: Radio,        label: "Signals",         value: signals,         color: "text-amber-400",  glow: "rgba(251,191,36,0.7)"  },
    { icon: FlaskConical, label: "Pending",          value: anomalies,       color: "text-sky-400",    glow: "rgba(56,189,248,0.7)"  },
    { icon: Zap,          label: "Classifications",  value: classifications, color: "text-teal-400",   glow: "rgba(136,192,208,0.7)" },
  ];

  return (
    <div
      className="flex items-center justify-around px-4 py-1.5 shrink-0"
      style={{
        background: "linear-gradient(180deg, rgba(4,10,22,0.95) 0%, rgba(4,10,22,0.9) 100%)",
        borderBottom: "1px solid rgba(136,192,208,0.08)",
      }}
      role="status"
      aria-label="Station telemetry"
    >
      {metrics.map(({ icon: Icon, label, value, color, glow }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon
            className={`h-3 w-3 shrink-0 ${color}`}
            style={{ filter: `drop-shadow(0 0 3px ${glow})` }}
            aria-hidden
          />
          <span className={`font-mono text-[11px] font-bold ${color}`}>
            <OdometerNumber value={value} />
          </span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground/40 hidden sm:inline">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
