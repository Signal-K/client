"use client";

import { useEffect, useRef, useState } from "react";

import { fetchCommunityActivity } from "@/lib/gameplay/communityActivity";

interface ActivityRow {
  id: number | string;
  author: string;
  type: string | null;
  at: string;
}

type PulseAnim = "idle" | "flying" | "landing";

/**
 * Rockets when other players classify — not a 12s screensaver loop.
 * First snapshot is silent; only *new* rows after that fire a ship.
 */
export function useCommunityLaunches(padBusy: boolean, userId?: string | null) {
  const [anim, setAnim] = useState<PulseAnim>("idle");
  const [pulseKey, setPulseKey] = useState(0);
  const seen = useRef<Set<string> | null>(null);
  const padBusyRef = useRef(padBusy);
  padBusyRef.current = padBusy;

  const pulse = (next: "flying" | "landing", duration: number) => {
    setAnim(next);
    setPulseKey((k) => k + 1);
    setTimeout(() => setAnim("idle"), duration);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const all = (await fetchCommunityActivity()) as ActivityRow[];
        const rows = userId ? all.filter((row) => !String(row.author).startsWith(userId.slice(0, 8))) : all;
        if (cancelled) return;
        const ids = rows.map((row) => String(row.id));
        if (!seen.current) {
          seen.current = new Set(ids);
          return;
        }
        const fresh = ids.filter((id) => !seen.current!.has(id));
        for (const id of ids) seen.current.add(id);
        if (fresh.length && !padBusyRef.current) {
          pulse("flying", 5200);
        }
      } catch {
        // Empty world stays still.
      }
    }

    void load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 120_000);
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [userId]);

  return { anim, pulseKey, pulse };
}
