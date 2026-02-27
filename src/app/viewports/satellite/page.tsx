"use client";

import dynamic from "next/dynamic";
import { usePageData } from "@/hooks/usePageData";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

const SatellitePosition = dynamic(
  () => import("@/src/components/scenes/deploy/satellite/SatellitePosition"),
  {
    ssr: false,
    loading: () => <div className="p-4 text-xs text-slate-400">Loading satellite viewport...</div>,
  }
);

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
  const { linkedAnomalies } = usePageData();
  const { isDark, toggleDarkMode } = UseDarkMode();

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
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={() => {}}
        />
      </div>
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />
      <div className="pt-20 h-screen">
        <div className="h-[calc(100vh-80px)] min-h-0 overflow-hidden">
          <SatellitePosition
            satellites={satelliteData ? [satelliteData] : []}
            flashingIndicator={satelliteData?.hasUnclassifiedAnomaly}
          />
        </div>
      </div>
    </div>
  );
}
