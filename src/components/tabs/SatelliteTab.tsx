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

export default function SatelliteTab() {
  const { linkedAnomalies } = usePageData();

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
    <div className="space-y-4">
      <SatellitePosition
        satellites={satelliteData ? [satelliteData] : []}
        flashingIndicator={satelliteData?.hasUnclassifiedAnomaly}
      />
    </div>
  );
}
