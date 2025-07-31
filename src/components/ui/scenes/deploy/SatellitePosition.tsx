"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

interface Satellite {
  id: string;
  x: number;
  y: number;
  hasUnclassifiedAnomaly: boolean;
  anomalyId?: string;
  tile: string;
  unlocked: boolean;
  linkedAnomalyId: string;
}

interface SatellitePositionProps {
  satellites: Satellite[];
  flashingIndicator?: boolean;
}

export default function SatellitePosition({ satellites, flashingIndicator }: SatellitePositionProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [positions, setPositions] = useState<Satellite[]>(satellites);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

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
          .select("id, anomaly_id, automaton, unlocked")
          .eq("automaton", "WeatherSatellite")
          .eq("author", session.user.id)
          .limit(1);

        if (error) throw error;

        if (linkedAnomalies.length > 0) {
          const anomaly = linkedAnomalies[0];
          const satelliteData: Satellite = {
            id: anomaly.id.toString(),
            x: 50,
            y: 50,
            hasUnclassifiedAnomaly: true,
            anomalyId: anomaly.anomaly_id.toString(),
            tile: satelliteTiles[0],
            unlocked: anomaly.unlocked || false,
            linkedAnomalyId: anomaly.id.toString(),
          };

          setPositions([satelliteData]);
        }
      } catch (err) {
        console.error("Error fetching satellites:", err);
      }
    };

    fetchSatellites();
  }, [session, supabase]);

  const handleUnlockAnomaly = async () => {
    if (!selectedSatellite || !session?.user?.id) return;
    
    setIsUnlocking(true);
    try {
      const { error } = await supabase
        .from("linked_anomalies")
        .update({ 
          unlocked: true, 
          unlock_time: new Date().toISOString() 
        })
        .eq("id", selectedSatellite.linkedAnomalyId)
        .eq("author", session.user.id);

      if (error) throw error;

      // Update the satellite state
      setPositions(prev => 
        prev.map(sat => 
          sat.id === selectedSatellite.id 
            ? { ...sat, unlocked: true }
            : sat
        )
      );

      setShowUnlockDialog(false);
      setSelectedSatellite(null);
    } catch (err) {
      console.error("Error unlocking anomaly:", err);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSatelliteClick = (satellite: Satellite) => {
    if (satellite.hasUnclassifiedAnomaly) {
      if (satellite.unlocked) {
        // If unlocked, navigate directly to classification
        window.location.href = `/structures/balloon/cloudspotting/db-${satellite.anomalyId}/classify`;
      } else {
        // If not unlocked, show unlock dialog
        setSelectedSatellite(satellite);
        setShowUnlockDialog(true);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((sat) => ({
          ...sat,
          x: (sat.x + 0.3) % 100, // Slower movement
          y: (sat.y + 0.2) % 100, // Slower movement
        }))
      );
    }, 500); // Slower interval

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card className="relative w-full h-48 rounded-lg text-white bg-transparent border-none">
        <div className="absolute inset-0 z-0">
          <TelescopeBackground
            sectorX={0}
            sectorY={0}
            showAllAnomalies={false}
            isDarkTheme={true}
          />
        </div>
        <div className="p-4 relative z-10">
          {positions.map((sat) => (
            <div
              key={sat.id}
              className="absolute cursor-pointer"
              style={{
                left: `${sat.x}%`,
                top: `${sat.y}%`,
              }}
              onClick={() => handleSatelliteClick(sat)}
            >
              <Image
                src={sat.tile}
                alt="Satellite"
                width={59} // Increased by 18% (50 * 1.18)
                height={59} // Increased by 18% (50 * 1.18)
                className="" // Removed animate-spin
              />
              {sat.hasUnclassifiedAnomaly && (
                <div
                  className={`absolute top-0 left-0 w-4 h-4 rounded-full animate-ping ${
                    sat.unlocked ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ transform: "translate(-50%, -50%)" }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Satellite Data Available</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your weather satellite has detected new atmospheric data that requires analysis. 
              Would you like to unlock and begin classification?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUnlockDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlockAnomaly}
              disabled={isUnlocking}
              className="flex-1"
            >
              {isUnlocking ? "Unlocking..." : "Unlock Data"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};