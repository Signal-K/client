"use client";

import { useState } from "react";
import { SectionLabel } from "./SectionLabel";

interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: "classification" | "discovery" | "deployment" | "system";
}

interface MissionLogPanelProps {
  entries: LogEntry[];
}

const typeColor: Record<LogEntry["type"], string> = {
  classification: "#5fcfb8",   // teal
  discovery:      "#fbbf24",   // amber
  deployment:     "#38bdf8",   // sky
  system:         "#4b5563",   // dim
};

const typePrefix: Record<LogEntry["type"], string> = {
  classification: "OBS",
  discovery:      "SIG",
  deployment:     "DEP",
  system:         "SYS",
};

// Blinking terminal cursor
function Cursor() {
  return (
    <span
      className="inline-block w-1.5 h-3 ml-0.5 align-middle animate-pulse"
      style={{ background: "#5fcfb8", opacity: 0.9 }}
      aria-hidden
    />
  );
}

export function MissionLogPanel({ entries }: MissionLogPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, 4);

  if (entries.length === 0) return null;

  return (
    <section>
      <SectionLabel
        text="Mission Log"
        right={
          entries.length > 4 ? (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-primary/50 hover:text-primary transition-colors font-mono text-[9px] uppercase tracking-widest"
            >
              {expanded ? "COLLAPSE" : `+${entries.length - 4} MORE`}
            </button>
          ) : undefined
        }
      />

      {/* Terminal housing — Alien: Isolation / Duskers aesthetic */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(136,192,208,0.12)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03), inset 0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Terminal title bar */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-b"
          style={{ borderColor: "rgba(136,192,208,0.1)", background: "rgba(136,192,208,0.04)" }}
        >
          <div className="flex gap-1" aria-hidden>
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <div className="w-2 h-2 rounded-full bg-teal-500/50" />
          </div>
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-teal-400/40">
            MISSION_LOG.SYS
          </span>
        </div>

        {/* Log entries */}
        <div className="px-3 py-2 space-y-1.5 font-mono">
          {visible.map((entry, i) => (
            <div key={entry.id} className="flex items-start gap-2 text-[10px] leading-snug">
              {/* > prompt */}
              <span style={{ color: typeColor[entry.type], opacity: 0.6 }} aria-hidden>&gt;</span>
              {/* Type tag */}
              <span
                className="shrink-0 text-[8px] uppercase tracking-widest mt-px"
                style={{ color: typeColor[entry.type] }}
              >
                [{typePrefix[entry.type]}]
              </span>
              {/* Timestamp */}
              <span className="shrink-0 text-[8px] tabular-nums mt-px" style={{ color: "rgba(255,255,255,0.2)" }}>
                {entry.time}
              </span>
              {/* Message */}
              <span style={{ color: "rgba(255,255,255,0.55)" }}>
                {entry.text}
                {/* Blinking cursor on last visible entry */}
                {i === visible.length - 1 && <Cursor />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper to build log entries from classifications / linked anomalies
export function buildLogEntries(
  classifications: Array<{ id: number | string; created_at: string; classificationtype?: string | null }>,
  linkedAnomalies: Array<{ id: number | string; date: string; automaton?: string; unlocked?: boolean }>,
): LogEntry[] {
  const entries: LogEntry[] = [];

  for (const c of classifications.slice(0, 10)) {
    const createdAt = c.created_at ? new Date(c.created_at) : null;
    const time = createdAt
      ? `${String(createdAt.getUTCHours()).padStart(2, "0")}:${String(createdAt.getUTCMinutes()).padStart(2, "0")}`
      : "??:??";
    entries.push({
      id: `c-${c.id}`,
      time,
      text: `Observation filed — ${c.classificationtype ?? "unknown type"}`,
      type: "classification",
    });
  }

  for (const la of linkedAnomalies.slice(0, 5)) {
    const d = la.date ? new Date(la.date) : null;
    const time = d
      ? `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
      : "??:??";
    entries.push({
      id: `la-${la.id}`,
      time,
      text: la.automaton ? `Signal locked — ${la.automaton}` : "Signal detected in sector",
      type: "discovery",
    });
  }

  return entries
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 15);
}
