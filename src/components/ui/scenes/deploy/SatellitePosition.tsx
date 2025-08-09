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

interface TooltipData {
  timeRemaining: string;
  timeSinceLastAction: string;
  deployTime: Date;
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
  const [hoveredSatellite, setHoveredSatellite] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);

  const satelliteTiles = [
    "/assets/Viewports/Satellite/Satellite_Tile1.png",
    "/assets/Viewports/Satellite/Satellite_Tile2.png",
    "/assets/Viewports/Satellite/Satellite_Tile3.png",
  ];

  // Time utility functions
  const getNextSaturdayMidnight = (): Date => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Calculate days until next Saturday (or today if it's Saturday)
    let daysUntilSaturday;
    if (dayOfWeek === 6) {
      // If today is Saturday, check if it's before 23:59
      const todayMidnight = new Date(now);
      todayMidnight.setHours(23, 59, 59, 999);
      
      if (now < todayMidnight) {
        // Still Saturday, use today
        daysUntilSaturday = 0;
      } else {
        // After 23:59 Saturday, go to next Saturday
        daysUntilSaturday = 7;
      }
    } else {
      // Calculate days until next Saturday
      daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      if (daysUntilSaturday === 0) daysUntilSaturday = 7; // If Sunday (0), next Saturday is 6 days away
    }
    
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(23, 59, 59, 999);
    
    return nextSaturday;
  };

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

  const getTimeUntilWeekEnd = (): { days: number; hours: number; minutes: number; totalMs: number } => {
    const now = currentTime.getTime();
    const weekEnd = getNextSaturdayMidnight().getTime();
    const diffMs = Math.max(0, weekEnd - now);
    
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    
    return {
      days,
      hours, 
      minutes,
      totalMs: diffMs
    };
  };

  const getTimeSinceLastAction = (): { days: number; hours: number; minutes: number } => {
    if (!lastActionTime) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const now = currentTime.getTime();
    const lastAction = lastActionTime.getTime();
    const diffMs = Math.max(0, now - lastAction);
    
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    
    return {
      days,
      hours,
      minutes
    };
  };

  const formatTimeSinceDeploy = (deployTime: Date): string => {
    const { minutes, seconds } = getTimeSinceDeploy(deployTime);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatTimeRemaining = (): string => {
    const { days, hours, minutes } = getTimeUntilWeekEnd();
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeSinceAction = (): string => {
    const { days, hours, minutes } = getTimeSinceLastAction();
    if (days > 0) {
      return `${days}d ${hours}h ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return "Just now";
  };

  // Extensible position calculation function
  const calculateSatellitePosition = (satellite: Satellite, timeSinceDeploy: number): { x: number; y: number } => {
    // Calculate progress based on time remaining until Saturday 23:59 AEST
    const { totalMs: timeRemainingMs } = getTimeUntilWeekEnd();
    const weekDurationMs = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const weekProgress = 1 - (timeRemainingMs / weekDurationMs); // 0 to 1 progress through the week
    
    // Satellite moves in a path from center to edge over the course of the week
    const centerX = 50;
    const centerY = 50;
    
    // Create a spiral path from center to edge
    const angle = weekProgress * Math.PI * 4; // 4 full rotations over the week
    const radius = weekProgress * 40; // Max radius of 40% to stay within bounds
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Ensure position stays within bounds (10% to 90%)
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  useEffect(() => {
    const fetchSatellites = async () => {
      if (!session?.user?.id) return;

      try {
        // Get the most recent WeatherSatellite deployment from last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: linkedAnomalies, error } = await supabase
          .from("linked_anomalies")
          .select("id, anomaly_id, automaton, unlocked, date")
          .eq("automaton", "WeatherSatellite")
          .eq("author", session.user.id)
          .gte("date", oneWeekAgo.toISOString())
          .order("date", { ascending: false })
          .limit(1);

        // Get last action time (most recent classification mentioning a WeatherSatellite linked_anomaly)
        const { data: lastClassifications, error: classError } = await supabase
          .from("classifications")
          .select("created_at")
          .eq("author", session.user.id)
          .not("content", "is", null)
          .order("created_at", { ascending: false })
          .limit(10); // Get recent classifications to check content

        if (lastClassifications && lastClassifications.length > 0) {
          // For now, use the most recent classification as last action
          // TODO: Filter by classifications that mention WeatherSatellite linked_anomalies
          setLastActionTime(new Date(lastClassifications[0].created_at));
        }

        // Handle missing unlocked column gracefully
        if (error && error.message?.includes('unlocked')) {
          console.warn('Database missing unlocked column in SatellitePosition, falling back');
          
          const { data: fallbackAnomalies, error: fallbackError } = await supabase
            .from("linked_anomalies")
            .select("id, anomaly_id, automaton, date")
            .eq("automaton", "WeatherSatellite")
            .eq("author", session.user.id)
            .gte("date", oneWeekAgo.toISOString())
            .order("date", { ascending: false })
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
        // If cloud found, navigate directly to classification
        window.location.href = `/structures/balloon/cloudspotting/db-${satellite.anomalyId}/classify`;
      } else {
        // If still scanning, show cloud detection dialog
        setSelectedSatellite(satellite);
        setShowUnlockDialog(true);
      }
    }
  };

  const handleSatelliteMouseEnter = (satellite: Satellite) => {
    setHoveredSatellite(satellite.id);
    setTooltipData({
      timeRemaining: formatTimeRemaining(),
      timeSinceLastAction: formatTimeSinceAction(),
      deployTime: satellite.deployTime
    });
  };

  const handleSatelliteMouseLeave = () => {
    setHoveredSatellite(null);
    setTooltipData(null);
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
          {/* Status Legend - Top Right Corner */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-sans">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0"></div>
                <span className="text-xs whitespace-nowrap">Click to Scan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping flex-shrink-0"></div>
                <span className="text-xs whitespace-nowrap">Click to Observe</span>
              </div>
            </div>
          </div>
          
          {positions.map((sat) => (
            <div
              key={sat.id}
              className="absolute cursor-pointer"
              style={{
                left: `${sat.x}%`,
                top: `${sat.y}%`,
              }}
              onClick={() => handleSatelliteClick(sat)}
              onMouseEnter={() => handleSatelliteMouseEnter(sat)}
              onMouseLeave={handleSatelliteMouseLeave}
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
              
              {/* Tooltip */}
              {hoveredSatellite === sat.id && tooltipData && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-sans whitespace-nowrap shadow-lg border border-white/20">
                    <div className="space-y-1">
                      <div className="font-medium text-blue-300">🛰️ Satellite Status</div>
                      <div>📍 Deployed: {formatTimeSinceDeploy(tooltipData.deployTime)} ago</div>
                      <div>⏱️ Time until redeployment: {tooltipData.timeRemaining}</div>
                      <div>🎯 Last action: {tooltipData.timeSinceLastAction}</div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Cloud Formation Detected</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your weather satellite has completed scanning the region of interest and detected a cloud formation ready for atmospheric analysis. 
              Would you like to begin cloud observation and classification?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUnlockDialog(false)}
              className="flex-1"
            >
              Continue Scanning
            </Button>
            <Button
              onClick={handleUnlockAnomaly}
              disabled={isUnlocking}
              className="flex-1"
            >
              {isUnlocking ? "Analyzing..." : "Begin Observation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};