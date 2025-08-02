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
  deployTime: Date;
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
  const [currentTileIndex, setCurrentTileIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const satelliteTiles = [
    "/assets/Viewports/Satellite/Satellite_Tile1.png",
    "/assets/Viewports/Satellite/Satellite_Tile2.png",
    "/assets/Viewports/Satellite/Satellite_Tile3.png",
  ];

  // Time utility functions
  const getTimeSinceDeploy = (deployTime: Date): { minutes: number; seconds: number; total: number } => {
    const now = currentTime.getTime();
    const deploy = deployTime.getTime();
    const diffMs = Math.max(0, now - deploy);
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return {
      minutes,
      seconds,
      total: totalSeconds
    };
  };

  const formatTimeSinceDeploy = (deployTime: Date): string => {
    const { minutes, seconds } = getTimeSinceDeploy(deployTime);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Extensible position calculation function
  const calculateSatellitePosition = (satellite: Satellite, timeSinceDeploy: number): { x: number; y: number } => {
    // TODO: Future enhancement - satellite movement based on deploy time and user actions
    // This function can be extended to:
    // 1. Calculate orbital mechanics based on time since deploy
    // 2. Apply user-directed movement commands
    // 3. Factor in gravitational effects or mission parameters
    // 4. Handle different satellite types with unique movement patterns
    // 5. Implement realistic satellite orbiting behavior
    
    // For now, keep the existing movement pattern but make it time-based
    const baseX = 50; // Starting position
    const baseY = 50; // Starting position
    
    // Use deploy time as a seed for consistent movement pattern
    const timeOffset = timeSinceDeploy * 0.1; // Slower movement factor
    
    return {
      x: (baseX + (timeOffset * 0.3)) % 100,
      y: (baseY + (timeOffset * 0.2)) % 100
    };
  };

  useEffect(() => {
    const fetchSatellites = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: linkedAnomalies, error } = await supabase
          .from("linked_anomalies")
          .select("id, anomaly_id, automaton, unlocked, date")
          .eq("automaton", "WeatherSatellite")
          .eq("author", session.user.id)
          .limit(1);

        // Handle missing unlocked column gracefully
        if (error && error.message?.includes('unlocked')) {
          console.warn('Database missing unlocked column in SatellitePosition, falling back');
          
          const { data: fallbackAnomalies, error: fallbackError } = await supabase
            .from("linked_anomalies")
            .select("id, anomaly_id, automaton, date")
            .eq("automaton", "WeatherSatellite")
            .eq("author", session.user.id)
            .limit(1);

          if (fallbackError) throw fallbackError;

          if (fallbackAnomalies && fallbackAnomalies.length > 0) {
            const anomaly = { ...fallbackAnomalies[0], unlocked: false }; // Default to locked
            const deployTime = new Date(anomaly.date);
            const satelliteData: Satellite = {
              id: anomaly.id.toString(),
              x: 50,
              y: 50,
              hasUnclassifiedAnomaly: true,
              anomalyId: anomaly.anomaly_id.toString(),
              tile: satelliteTiles[0],
              unlocked: anomaly.unlocked,
              linkedAnomalyId: anomaly.id.toString(),
              deployTime: deployTime,
            };
            setPositions([satelliteData]);
          }
          return;
        }

        if (error) throw error;

        if (linkedAnomalies.length > 0) {
          const anomaly = linkedAnomalies[0];
          const deployTime = new Date(anomaly.date);
          const satelliteData: Satellite = {
            id: anomaly.id.toString(),
            x: 50,
            y: 50,
            hasUnclassifiedAnomaly: true,
            anomalyId: anomaly.anomaly_id.toString(),
            tile: satelliteTiles[0],
            unlocked: anomaly.unlocked || false,
            linkedAnomalyId: anomaly.id.toString(),
            deployTime: deployTime,
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
          unlocked: true
        })
        .eq("id", selectedSatellite.linkedAnomalyId)
        .eq("author", session.user.id);

      if (error) {
        // Handle case where unlocked column doesn't exist
        if (error.message?.includes('unlocked')) {
          console.warn('Cannot unlock: unlocked column missing in database');
          alert('Unlock feature requires database update. Please contact support.');
          return;
        }
        throw error;
      }

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
      alert('Failed to unlock satellite. Please try again.');
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
      setCurrentTime(new Date());
      
      setPositions((prev) =>
        prev.map((sat) => {
          const timeSinceDeploy = getTimeSinceDeploy(sat.deployTime).total;
          const newPosition = calculateSatellitePosition(sat, timeSinceDeploy);
          return {
            ...sat,
            x: newPosition.x,
            y: newPosition.y,
          };
        })
      );
      
      // Cycle through satellite tile images
      setCurrentTileIndex((prev) => (prev + 1) % satelliteTiles.length);
    }, 1000); // Update every second for time display

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card className="relative w-full h-48 rounded-lg text-white bg-card border border-chart-4/30">
        <div className="absolute inset-0 z-0 rounded-lg overflow-hidden">
          <TelescopeBackground
            sectorX={0}
            sectorY={0}
            showAllAnomalies={false}
            isDarkTheme={true}
          />
        </div>
        <div className="p-4 relative z-10">
          {/* Time Since Deploy Display */}
          {positions.length > 0 && (
            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm font-mono">
              <div className="text-xs text-gray-300">Deploy Time</div>
              <div className="font-semibold">{formatTimeSinceDeploy(positions[0].deployTime)}</div>
            </div>
          )}
          
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
                src={satelliteTiles[currentTileIndex]}
                alt="Satellite"
                width={59} // Increased by 18% (50 * 1.18)
                height={59} // Increased by 18% (50 * 1.18)
                className="transition-opacity duration-200 transform rotate-[86deg]" // Smooth transition between frames + rotation
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