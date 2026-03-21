"use client";

import { StarField } from "./StarField";
import { AnomalyLabels } from "./AnomalyLabels";
import { CommunityVehicles } from "./CommunityVehicles";
import { PersonalStructures } from "./PersonalStructures";

interface LivingWorldBgProps {
  classifications: Array<{
    id: number | string;
    classificationtype: string | null;
    anomaly?: { content: string | null } | null;
  }>;
  deployed: {
    telescope: boolean;
    satellite: boolean;
    rover: boolean;
    solar: boolean;
  };
}

export function LivingWorldBg({ classifications, deployed }: LivingWorldBgProps) {
  const anomalies = classifications.map((c) => ({
    id: c.id,
    name: c.anomaly?.content ?? `#${c.id}`,
    type: c.classificationtype,
  }));

  return (
    // z-0 — sits behind all hub content (hub content is z-10+)
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <StarField />
      <AnomalyLabels anomalies={anomalies} />
      <CommunityVehicles />
      <PersonalStructures deployed={deployed} />
    </div>
  );
}
