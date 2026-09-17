"use client";

import { useEffect, useState } from "react";

export const SKY_PHASES = ["dawn", "day", "dusk", "night"] as const;
export type SkyPhase = (typeof SKY_PHASES)[number];
const SKY_MS = 22000;

/** ssc.sky.cycle — compressed day → dusk → night → dawn over the same plot. */
export function useSkyPhase(): SkyPhase {
  const [phase, setPhase] = useState<SkyPhase>("day");
  useEffect(() => {
    let index = SKY_PHASES.indexOf("day");
    const id = setInterval(() => {
      index = (index + 1) % SKY_PHASES.length;
      setPhase(SKY_PHASES[index]);
    }, SKY_MS);
    return () => clearInterval(id);
  }, []);
  return phase;
}
