"use client";

import dynamic from "next/dynamic";
import { usePageData } from "@/hooks/usePageData";
import ViewportShell from "@/src/components/layout/ViewportShell";

const SatellitePosition = dynamic(
  () => import("@/src/components/scenes/deploy/satellite/SatellitePosition"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-xs text-slate-400">Loading satellite viewport...</div>,
  }
);

export default function SatelliteViewportExpandedPage() {
  const { linkedAnomalies } = usePageData();

  const weatherSatelliteAnomaly = linkedAnomalies.find(
    (anomaly) => anomaly.automaton === "WeatherSatellite"
  );

  const satelliteData = weatherSatelliteAnomaly
    ? {
        id: "satellite-1",
        x: 50,
        y: 50,
        hasUnclassifiedAnomaly: true,
        anomalyId: weatherSatelliteAnomaly.anomaly?.id?.toString(),
        tile: "/assets/Viewports/Satellite/Satellite_Tile1.png",
        unlocked: weatherSatelliteAnomaly.unlocked ?? false,
        linkedAnomalyId: weatherSatelliteAnomaly.id.toString(),
        deployTime: new Date(weatherSatelliteAnomaly.date),
        anomalySet: weatherSatelliteAnomaly.anomaly?.anomalySet ?? undefined,
      }
    : null;

  return (
    <ViewportShell>
      <SatellitePosition
        satellites={satelliteData ? [satelliteData] : []}
        flashingIndicator={satelliteData?.hasUnclassifiedAnomaly}
      />
    </ViewportShell>
  );
}
