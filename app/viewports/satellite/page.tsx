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
};


import { useEffect } from "react";

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

  const satelliteData: (PageSatellite & { deployTime: Date }) | null = (() => {
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
        unlocked: false,
        linkedAnomalyId: weatherSatelliteAnomaly.id.toString(),
        deployTime: new Date(),
      };
    }
    return null;
  })();

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/backdrops/Earth.png"
        alt="Earth Background"
      />

      <div className="w-full z-10">
        <GameNavbar />
      </div>

      <div className="flex justify-center items-center flex-grow z-10 px-4">
        <Dialog
          defaultOpen
          onOpenChange={(open) => {
            if (!open) router.push("/");
          }}
        >
          <DialogContent
            className="p-0 w-full max-w-[90vw] h-[85vh] flex flex-col bg-transparent shadow-none"
            style={{ color: "" }}
          >
            <div className="h-full w-full flex">
              <SatellitePosition
                satellites={satelliteData ? [satelliteData] : []}
                flashingIndicator={satelliteData?.hasUnclassifiedAnomaly}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
