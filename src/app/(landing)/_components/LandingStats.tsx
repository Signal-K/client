"use client";

import { useEffect, useState } from "react";

import type { LandingStats as LandingStatsData } from "@/src/server/snapshots/compute";

// SSC-37: the landing page is static HTML, so these figures come from the
// cron-published `landing-stats` snapshot rather than a render-time query.

type SnapshotResponse = {
  status: "fresh" | "stale" | "missing";
  generatedAt: string | null;
  data: LandingStatsData | null;
};

function fmt(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  return n > 0 ? `${n}+` : "—";
}

const FALLBACK = [
  { value: "11+", label: "Science projects" },
  { value: "100k+", label: "Classifications" },
  { value: "—", label: "Active Contributors (24h)" },
  { value: "1", label: "Open Source" },
];

function StatsGrid({ stats, note }: { stats: typeof FALLBACK; note?: string | null }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {stats.map((s) => (
        <div key={s.label} className="sci-fi-panel p-6 bg-background/40">
          <div className="text-4xl font-black text-primary tracking-tighter animate-[fade-up_0.4s_ease_both]">
            {s.value}
          </div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {s.label}
          </div>
        </div>
      ))}
      {note ? (
        <p className="sm:col-span-2 text-[10px] uppercase tracking-widest text-muted-foreground/50" data-testid="landing-stats-note">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function updatedNote(snapshot: SnapshotResponse): string | null {
  if (!snapshot.generatedAt) return null;
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(snapshot.generatedAt)) / 60_000));
  const ago = minutes < 1 ? "just now" : minutes < 120 ? `${minutes} min ago` : `${Math.round(minutes / 60)} h ago`;
  return snapshot.status === "stale" ? `Figures may be out of date · updated ${ago}` : `Updated ${ago}`;
}

export function LandingStats() {
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/snapshots/landing-stats")
      .then((res) => res.json() as Promise<SnapshotResponse>)
      .then((body) => {
        if (!cancelled) setSnapshot(body);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const data = snapshot?.data;
  if (!snapshot || !data) return <LandingStatsFallback />;

  return (
    <StatsGrid
      stats={[
        { value: fmt(data.activeProjects7d) === "—" ? "11+" : fmt(data.activeProjects7d), label: "Science projects" },
        { value: fmt(data.totalClassifications) === "—" ? "100k+" : fmt(data.totalClassifications), label: "Classifications" },
        { value: fmt(data.activeSailors24h), label: "Active Contributors (24h)" },
        { value: "1", label: "Open Source" },
      ]}
      note={updatedNote(snapshot)}
    />
  );
}

/** Shown before the snapshot loads, or when none is published yet. */
export function LandingStatsFallback() {
  return <StatsGrid stats={FALLBACK} />;
}
