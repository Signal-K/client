"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Section from "@/src/components/sections/Section";
import WeatherSatelliteMissionType from "./WeatherSatelliteMissionType";
import SatelliteProgressBar from "./SatelliteProgressBar";
import SatelliteIcon from "./SatelliteIcon";
import {
  getNextSaturdayMidnight,
  getTimeSinceDeploy,
  getTimeUntilWeekEnd,
  getTimeSinceLastAction,
} from "./satelliteTimeUtils";
import { calculateSatellitePosition } from "./satellitePositionUtils";
import { PlanetGeneratorMinimal } from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator";
import { useRouter } from "next/navigation";

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
  // State for classification object and id for the current satellite
  const [classification, setClassification] = useState<any>(null);
  const [classificationId, setClassificationId] = useState<number | string | null>(null);
  // Ref and state for parent section dimensions (must be inside component)
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionDims, setSectionDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    function updateDims() {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setSectionDims({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    }
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);
  // Restore handleUnlockAnomaly and handleSatelliteClick
  const supabase = useSupabaseClient();
  const session = useSession();

  const router = useRouter();

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
  const [deploymentCount, setDeploymentCount] = useState<number | null>(null);
  const [allWeatherSatEntries, setAllWeatherSatEntries] = useState<any[]>([]);

  // Helper to get start of week (Sunday AEST 00:01)
  function getAESTWeekStart(date: Date) {
    // Convert to AEST (UTC+10)
    const utc = new Date(date.getTime() + 10 * 60 * 60 * 1000);
    const day = utc.getUTCDay();
    const diff = utc.getUTCDate() - day;
    const weekStart = new Date(utc);
    weekStart.setUTCDate(diff);
    weekStart.setUTCHours(0, 1, 0, 0); // 00:01 AEST
    // Convert back to local time
    return new Date(weekStart.getTime() - 10 * 60 * 60 * 1000);
  }

  // Fetch deployment count for this week and all WeatherSatellite entries for this user
  useEffect(() => {
    async function fetchDeploymentData() {
      if (!session?.user?.id) return;
      const weekStart = getAESTWeekStart(new Date());
      // Count for this week
      const { count, error } = await supabase
        .from("linked_anomalies")
        .select("id", { count: "exact", head: true })
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id)
        .gte("date", weekStart.toISOString());
      if (!error) setDeploymentCount(count ?? 0);
      else setDeploymentCount(null);
      // All entries (ignore time)
      const { data: allEntries, error: allErr } = await supabase
        .from("linked_anomalies")
        .select("*")
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id);
      if (!allErr && allEntries) setAllWeatherSatEntries(allEntries);
      else setAllWeatherSatEntries([]);
    }
    fetchDeploymentData();
  }, [session, supabase]);

  const satelliteTiles = [
    "/assets/Viewports/Satellite/Satellite_Tile1.png",
    "/assets/Viewports/Satellite/Satellite_Tile2.png",
    "/assets/Viewports/Satellite/Satellite_Tile3.png",
  ];

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
          .select("id, anomaly_id, automaton, unlocked, date, classification_id")
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
          // Fetch classification if classification_id exists
          if (anomaly.classification_id) {
            setClassificationId(anomaly.classification_id);
            const { data: classificationData, error: classErr } = await supabase
              .from("classifications")
              .select("id, media")
              .eq("id", anomaly.classification_id)
              .single();
            if (!classErr && classificationData) {
              setClassification(classificationData);
            } else {
              setClassification(null);
            }
          } else {
            setClassificationId(null);
            setClassification(null);
          }
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
      <div ref={sectionRef} className="p-4 relative z-10" style={{ minHeight: '156px', height: '30vh', maxHeight: 520 }}>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-4 w-full max-w-lg text-xs md:text-sm text-center text-zinc-300 leading-relaxed px-2">
              Now that we've discovered some planets, we can investigate them further with satellites. To start with, you get to send a satellite to a target location once every week. Currently, your satellites can identify weather events and storms on your planets - this is good information to have if you want to explore and maybe work on, or near, these planets!
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow"
              onClick={() => router.push('/viewports/satellite/deploy')}
            >
              Deploy Weather Satellite
            </button>
          </div>
        ) : (
          <>
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
              </div>
            ))}
          </>
        )}
        <div className="w-full absolute left-0 flex flex-col items-center z-30 pointer-events-none">
          <div className="pointer-events-auto mb-2">
            <WeatherSatelliteMissionType entries={allWeatherSatEntries} />
          </div>
          {positions[0]?.deployTime && (
            <div className="pointer-events-auto flex flex-col items-center">
              <SatelliteProgressBar
                deployTime={positions[0].deployTime}
                width={Math.max(180, Math.min(Math.round(sectionDims.width * 0.6), 900))}
                height={48}
                classificationId={classificationId ?? undefined}
                classification={classification ?? undefined}
                parentWidth={sectionDims.width}
                investigationType={allWeatherSatEntries && allWeatherSatEntries.length > 1 ? 'weather' : 'planet'}
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};