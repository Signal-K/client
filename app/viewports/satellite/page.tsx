"use client";

import { useRouter } from "next/navigation";
import GameNavbar from "@/src/components/layout/Tes";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import SatellitePosition from "@/src/components/scenes/deploy/satellite/SatellitePosition";
import { usePageData } from "@/hooks/usePageData";

type PageSatellite = {
  id: string;
  x: number;
  y: number;
  hasUnclassifiedAnomaly: boolean;
  anomalyId: string | undefined;
  tile: string;
  unlocked: boolean;
  linkedAnomalyId: string;
  anomalySet?: string;
};

export default function SatelliteViewportExpandedPage() {
  const router = useRouter();
  const { linkedAnomalies } = usePageData();

  // Calculate start of week (Sunday 00:01 AEST)
  function getStartOfWeekAEST() {
    // Get current time in UTC
    const now = new Date();
    // Calculate AEST offset (UTC+10)
    const aestOffsetMs = 10 * 60 * 60 * 1000;
    // Convert now to AEST
    const nowAEST = new Date(now.getTime() + aestOffsetMs);
    // Find previous Sunday in AEST
    const day = nowAEST.getDay();
    const diff = nowAEST.getDate() - day;
    const sundayAEST = new Date(nowAEST);
    sundayAEST.setDate(diff);
    sundayAEST.setHours(0, 1, 0, 0); // 00:01
    // Convert back to UTC for comparison
    const sundayUTC = new Date(sundayAEST.getTime() - aestOffsetMs);
    return sundayUTC;
  }

  const satelliteData: (PageSatellite & { deployTime: Date; anomalySet?: string }) | null = (() => {
    const weatherSatelliteAnomaly = linkedAnomalies.find(
      (anomaly) => anomaly.automaton === "WeatherSatellite"
    );
    if (weatherSatelliteAnomaly) {
      return {
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
      };
    }
    return null;
  })();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full z-50 flex-shrink-0">
        <GameNavbar />
      </div>

      <div className="flex-1 z-10 min-h-0 pt-12">
        <SatellitePosition
          satellites={satelliteData ? [satelliteData] : []}
          flashingIndicator={satelliteData?.hasUnclassifiedAnomaly}
        />
      </div>
    </div>
  );
}
