"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import SatelliteCard from "./satellite/SatelliteCard";
import Section from "@/src/components/sections/Section";
import SatelliteLegend from "./satellite/SatelliteLegend";
import SatelliteIcon from "./satellite/SatelliteIcon";
import SatelliteTooltip from "./satellite/SatelliteTooltip";
import {
  getNextSaturdayMidnight,
  getTimeSinceDeploy,
  getTimeUntilWeekEnd,
  getTimeSinceLastAction,
} from "./satellite/satelliteTimeUtils";
import { calculateSatellitePosition } from "./satellite/satellitePositionUtils";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { PlanetGeneratorMinimal } from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator";

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
  planetName?: string;
  classificationText?: string;
};

export default function SatellitePosition({ satellites, flashingIndicator }: SatellitePositionProps) {
  // Restore handleUnlockAnomaly and handleSatelliteClick
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
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  const satelliteTiles = [
    "/assets/Viewports/Satellite/Satellite_Tile1.png",
    "/assets/Viewports/Satellite/Satellite_Tile2.png",
    "/assets/Viewports/Satellite/Satellite_Tile3.png",
  ];

  // Time utility functions
  // --- Utility wrappers for formatting ---
  const formatTimeSinceDeploy = (deployTime: Date): string => {
    const { minutes, seconds } = getTimeSinceDeploy(deployTime, currentTime);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatTimeRemaining = (): string => {
    const { days, hours, minutes } = getTimeUntilWeekEnd(currentTime);
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeSinceAction = (): string => {
    const { days, hours, minutes } = getTimeSinceLastAction(lastActionTime, currentTime);
    if (days > 0) {
      return `${days}d ${hours}h ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return "Just now";
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


const handleSatelliteMouseEnter = async (satellite: Satellite) => {
  setHoveredSatellite(satellite.id);

  let planetName = "";
  let classificationText = "";

  // Fetch anomaly name/content
  if (satellite.anomalyId) {
    const { data: anomalyData } = await supabase
      .from("anomalies")
      .select("content")
      .eq("id", satellite.anomalyId)
      .single();
    planetName = anomalyData?.content || "";
  }

  // Fetch classification text (if unlocked and classification_id exists)
  let classificationId: string | undefined;
  const { data: linkedAnomaly } = await supabase
    .from("linked_anomalies")
    .select("classification_id")
    .eq("id", satellite.linkedAnomalyId)
    .single();
  classificationId = linkedAnomaly?.classification_id;

  if (classificationId) {
    const { data: classificationData } = await supabase
      .from("classifications")
      .select("content")
      .eq("id", classificationId)
      .single();
    classificationText = classificationData?.content || "";
  }

  setTooltipData({
    timeRemaining: formatTimeRemaining(),
    timeSinceLastAction: formatTimeSinceAction(),
    deployTime: satellite.deployTime,
    planetName,
    classificationText,
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
          const newPosition = calculateSatellitePosition(sat, currentTime);
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
  <Section expandLink={"/viewports/satellite"} sectionId="satellite-position" variant="viewport" backgroundType="outer-solar" infoText={"Send satellites to planets you or the community have discovered to search for clouds and weather events."}>
      <div className="p-4 relative z-10" style={{ minHeight: '156px', height: '30vh', maxHeight: 520 }}>
        {/* If no satellites, show deploy button */}
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-4 w-full max-w-lg text-xs md:text-sm text-center text-zinc-300 leading-relaxed px-2">
              Now that we've discovered some planets, we can investigate them further with satellites. To start with, you get to send a satellite to a target location once every week. Currently, your satellites can identify weather events and storms on your planets - this is good information to have if you want to explore and maybe work on, or near, these planets!
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow"
              onClick={() => setShowDeployDialog(true)}
            >
              Deploy Weather Satellite
            </button>
          </div>
        ) : (
          <>
            {/* Planet in top-right, behind overlays */}
            {positions[0]?.linkedAnomalyId && (
              <div
                className="absolute group"
                style={{
                  top: 0,
                  right: 0,
                  width: 1300,
                  height: 1300,
                  zIndex: 1,
                  pointerEvents: "auto",
                  background: "none",
                  borderRadius: "50%",
                  overflow: "visible",
                  transform: "translateX(40%)",
                }}
              >
                <PlanetGeneratorMinimal
                  classificationId={positions[0]?.linkedAnomalyId}
                />
                {/* Tooltip for planet overlay */}
                <div
                  className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full bg-black bg-opacity-80 text-white text-xs rounded px-3 py-2 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg"
                  style={{ zIndex: 100 }}
                >
                  <div><b>Planet:</b> {tooltipData?.planetName || positions[0]?.anomalyId || "Unknown"}</div>
                  <div><b>Distance:</b> Calculating...</div>
                  <div><b>Scan Time:</b> Calculating...</div>
                </div>
              </div>
            )}
            <SatelliteLegend />
            {positions.map((sat) => (
              <div
                key={sat.id}
                className="cursor-pointer"
                onClick={() => handleSatelliteClick(sat)}
                onMouseEnter={() => handleSatelliteMouseEnter(sat)}
                onMouseLeave={handleSatelliteMouseLeave}
                style={{ position: 'relative', width: 70, height: 70 }}
              >
                <SatelliteIcon
                  deployTime={sat.deployTime}
                  currentTime={currentTime}
                  tile={satelliteTiles[currentTileIndex]}
                  unlocked={sat.unlocked}
                />
                {hoveredSatellite === sat.id && tooltipData && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                    <SatelliteTooltip
                      timeSinceDeploy={formatTimeSinceDeploy(tooltipData.deployTime)}
                      timeRemaining={tooltipData.timeRemaining}
                      timeSinceLastAction={tooltipData.timeSinceLastAction}
                      planetName={tooltipData.planetName}
                      classificationText={tooltipData.classificationText}
                      deployTime={tooltipData.deployTime}
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      {/* Deploy Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Deploy Weather Satellite</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Deploy a weather satellite to begin monitoring planetary atmospheres and discover new cloud formations. Select a planet to deploy to and start your mission!</p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded shadow"
              onClick={async () => {
                if (!session?.user?.id) return;
                // Fetch user's classified planets
                const { data: planetClassifications } = await supabase
                  .from("classifications")
                  .select("id, anomaly:anomaly(content)")
                  .eq("author", session.user.id)
                  .eq("classificationtype", "planet");
                if (!planetClassifications || planetClassifications.length === 0) {
                  alert("No classified planets available for deployment.");
                  return;
                }
                // Pick a random planet
                const randomIndex = Math.floor(Math.random() * planetClassifications.length);
                const selectedPlanet = planetClassifications[randomIndex];
                // Fetch a random cloud anomaly
                const { data: cloudAnomalies } = await supabase
                  .from("anomalies")
                  .select("id")
                  .eq("anomalytype", "cloud");
                if (!cloudAnomalies || cloudAnomalies.length === 0) {
                  alert("No cloud anomalies available.");
                  return;
                }
                const cloudIndex = Math.floor(Math.random() * cloudAnomalies.length);
                const selectedAnomaly = cloudAnomalies[cloudIndex];
                // Insert deployment row
                await supabase.from("linked_anomalies").insert({
                  author: session.user.id,
                  anomaly_id: selectedAnomaly.id,
                  classification_id: selectedPlanet.id,
                  automaton: "WeatherSatellite",
                  unlocked: false,
                  date: new Date().toISOString(),
                });
                setShowDeployDialog(false);
                window.location.reload();
              }}
            >
              Deploy to Random Planet
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
    </Section>
  );
};