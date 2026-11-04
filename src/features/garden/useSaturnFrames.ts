"use client";

import { useEffect, useState } from "react";

import { toSaturnFrames, type SaturnFrame } from "@/src/lib/gameplay/saturnStorm";

let cache: { at: number; frames: SaturnFrame[] } | null = null;
const TTL_MS = 5 * 60_000;

/** One shared fetch of reviewable Saturn pool frames; [] when offline, missing or empty. */
export async function fetchSaturnFrames(fetchImpl: typeof fetch = fetch): Promise<SaturnFrame[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.frames;
  try {
    const res = await fetchImpl("/api/gameplay/saturn-storm/frames");
    if (!res.ok) return [];
    const rows = (await res.json()) as unknown;
    const frames = Array.isArray(rows) ? toSaturnFrames(rows as Record<string, unknown>[]) : [];
    if (frames.length > 0) cache = { at: Date.now(), frames };
    return frames;
  } catch {
    return [];
  }
}

export function resetSaturnFramesCache() {
  cache = null;
}

export function useSaturnFrames(enabled: boolean) {
  const [frames, setFrames] = useState<SaturnFrame[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    void fetchSaturnFrames().then((next) => {
      if (cancelled) return;
      setFrames(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { frames, loading };
}
