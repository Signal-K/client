"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";

interface Satellite {
  id: string;
  x: number;
  y: number;
  hasUnclassifiedAnomaly: boolean;
  anomalyId?: string;
  tile: string; // Add tile property for satellite image
}

interface SatellitePositionProps {
  satellites: Satellite[];
  flashingIndicator?: boolean;
}

export default function SatellitePosition({ satellites, flashingIndicator }: SatellitePositionProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [positions, setPositions] = useState<Satellite[]>(satellites);

  const satelliteTiles = [
    "/assets/Viewports/Satellite/Satellite_Tile1.png",
    "/assets/Viewports/Satellite/Satellite_Tile2.png",
    "/assets/Viewports/Satellite/Satellite_Tile3.png",
  ];

  useEffect(() => {
    const fetchSatellites = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: linkedAnomalies, error } = await supabase
          .from("linked_anomalies")
          .select("id, anomaly_id, automaton")
          .eq("automaton", "WeatherSatellite")
          .eq("author", session.user.id)
          .limit(1); // Fetch only the first relevant anomaly

        if (error) throw error;

        if (linkedAnomalies.length > 0) {
          const anomaly = linkedAnomalies[0];
          const satelliteData = {
            id: anomaly.id,
            x: 50, // Centered position
            y: 50, // Centered position
            hasUnclassifiedAnomaly: true,
            anomalyId: anomaly.anomaly_id,
            tile: satelliteTiles[0], // Use the first tile
          };

          setPositions([satelliteData]); // Set a single satellite
        }
      } catch (err) {
        console.error("Error fetching satellites:", err);
      }
    };

    fetchSatellites();
  }, [session, supabase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((sat) => ({
          ...sat,
          x: (sat.x + 1) % 100,
          y: (sat.y + 1) % 100,
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative w-full h-48 rounded-lg text-white bg-transparent border-none"> {/* Remove background and border */}
      <div className="absolute inset-0 z-0"> {/* Wrapper to control background placement */}
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={true}
        />
      </div>
      <div className="p-4 relative z-10"> {/* Ensure content is above the background */}
        {positions.map((sat) => (
          <div
            key={sat.id}
            className="absolute"
            style={{
              left: `${sat.x}%`,
              top: `${sat.y}%`,
            }}
          >
            <Image
              src={sat.tile}
              alt="Satellite"
              width={50}
              height={50}
              className="animate-spin"
            />
            {sat.hasUnclassifiedAnomaly && (
              <div
                className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full animate-ping"
                style={{ transform: "translate(-50%, -50%)" }}
              ></div>
            )}
            {sat.hasUnclassifiedAnomaly && sat.anomalyId && (
              <Link
                href={`/structures/balloon/cloudspotting/db-${sat.anomalyId}/classify`}
                className="absolute top-0 left-0 w-full h-full"
              >
                <span className="sr-only">Classify anomaly</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
