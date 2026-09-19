"use client";

import { useEffect, useState } from "react";

export const SKY_PHASES = ["dawn", "day", "dusk", "night"] as const;
export type SkyPhase = (typeof SKY_PHASES)[number];

/** Real-time camp sky — not a 14s screensaver. */
export function skyPhaseForHour(hour: number): SkyPhase {
  const wrapped = ((hour % 24) + 24) % 24;
  if (wrapped >= 5 && wrapped < 8) return "dawn";
  if (wrapped >= 8 && wrapped < 17) return "day";
  if (wrapped >= 17 && wrapped < 20) return "dusk";
  return "night";
}

/** ssc.sky.cycle — local time of day over the same plot. */
export function useSkyPhase(): SkyPhase {
  const [phase, setPhase] = useState<SkyPhase>(() => skyPhaseForHour(new Date().getHours()));
  useEffect(() => {
    const sync = () => setPhase(skyPhaseForHour(new Date().getHours()));
    sync();
    const id = setInterval(sync, 60_000);
    return () => clearInterval(id);
  }, []);
  return phase;
}
