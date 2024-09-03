"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Section from "@/src/components/sections/Section";
import WeatherSatelliteMissionType from "./WeatherSatelliteMissionType";
import SatelliteProgressBar from "./SatelliteProgressBar";
import SatelliteIcon from "./Deploy/SatelliteIcon";
import {
  getTimeUntilWeekEnd,
  getTimeSinceLastAction,
} from "./satelliteTimeUtils";
import { calculateSatellitePosition } from "./Deploy/satellitePositionUtils";
import SatelliteSpiderScan from "./satelliteSpiderScan";
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
  anomalySet?: string;
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
  const [missionType, setMissionType] = useState<'weather' | 'planet' | 'p-4' | null>(null);
  const [windSurveyAnomalies, setWindSurveyAnomalies] = useState<any[]>([]);

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

  // Orbit animation state - must be declared before any conditional returns
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [showPlanetSurvey, setShowPlanetSurvey] = useState(false);

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
        .select("*, anomaly:anomalies(id, content, type, anomalySet)")
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id);
      if (!allErr && allEntries) {
        setAllWeatherSatEntries(allEntries);
        // Determine mission type based on anomalySet
        const isP4 = allEntries.some(entry => entry.anomaly?.anomalySet === 'satellite-planetFour');
        if (isP4) {
          setMissionType('p-4');
          const p4Anomalies = allEntries
            .filter(entry => entry.anomaly?.anomalySet === 'satellite-planetFour')
            .map(entry => ({ ...entry.anomaly, linked_anomaly_id: entry.id }));
          setWindSurveyAnomalies(p4Anomalies);
        } else {
          // Check if it's a weather/cloud mission (cloudspottingOnMars, lidar-jovianVortexHunter, etc.)
          const hasCloudAnomaly = allEntries.some(entry => {
            const set = entry.anomaly?.anomalySet;
            return set === 'cloudspottingOnMars' || 
                   set === 'lidar-jovianVortexHunter' || 
                   set === 'balloon-marsCloudShapes' ||
                   entry.anomaly?.anomalytype === 'cloud' ||
                   entry.anomaly?.anomalytype === 'gaseousMapping';
          });
          
          if (hasCloudAnomaly) {
            setMissionType('weather');
          } else {
            // It's a planet mission
            setMissionType('planet');
          }
        }
      }
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
    if ((missionType === 'weather' || missionType === 'planet') && positions[0]?.deployTime) {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const elapsedMs = Math.max(0, currentTime.getTime() - new Date(positions[0].deployTime).getTime());
      const remainingMs = ONE_HOUR_MS - elapsedMs;
      
      if (remainingMs <= 0) {
        return "Available";
      }
      
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    }
    
    // For p-4 wind survey missions, show time until week end
    const { days, hours, minutes } = getTimeUntilWeekEnd(currentTime);
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    };
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
          .order("date", { ascending: false });

        if (error) throw error;

        if (linkedAnomalies && linkedAnomalies.length > 0) {
          const anomaliesWithSets = await Promise.all(
            linkedAnomalies.map(async (la) => {
              const { data: anomalyData } = await supabase
                .from('anomalies')
                .select('anomalySet')
                .eq('id', la.anomaly_id)
                .single();
              return { ...la, anomaly: anomalyData };
            })
          );

          const isP4Mission = anomaliesWithSets.some(a => a.anomaly && a.anomaly.anomalySet === 'satellite-planetFour');
          if (isP4Mission) {
            setMissionType('p-4');
            const p4Anomalies = anomaliesWithSets
              .filter(a => a.anomaly && a.anomaly.anomalySet === 'satellite-planetFour')
              .map(entry => ({ ...entry.anomaly, id: entry.anomaly_id, linked_anomaly_id: entry.id, classification_id: entry.classification_id, date: entry.date }));
            setWindSurveyAnomalies(p4Anomalies);
            setPositions([]);
            return;
          }

          // Check if it's a weather/cloud mission
          const hasCloudAnomaly = anomaliesWithSets.some(a => {
            const set = a.anomaly?.anomalySet;
            return set === 'cloudspottingOnMars' || 
                   set === 'lidar-jovianVortexHunter' || 
                   set === 'balloon-marsCloudShapes';
          });
          
          if (hasCloudAnomaly) {
            setMissionType('weather');
          } else {
            // It's a planet mission
            setMissionType('planet');
          }

          const anomaly = anomaliesWithSets[0];
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
            anomalySet: anomaly.anomaly?.anomalySet,
          };
          setPositions([satelliteData]);

          if (anomaly.classification_id) {
            setClassificationId(anomaly.classification_id);
            const { data: classificationData, error: classErr } = await supabase
              .from("classifications")
              .select("id, media, anomaly")
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
        // For planet missions, show the survey interface
        if (missionType === 'planet') {
          setShowPlanetSurvey(true);
        } else {
          // For weather/cloud missions, navigate to classification
          let projectPath = 'cloudspotting'; // default for Earth clouds
          if (satellite.anomalySet === 'cloudspottingOnMars') {
            projectPath = 'shapes'; // Mars cloud shapes
          } else if (satellite.anomalySet === 'lidar-jovianVortexHunter') {
            projectPath = 'jvh'; // Jovian vortex hunter
          }
          if (typeof window !== "undefined") {
            window.location.href = `/structures/balloon/${projectPath}/db-${satellite.anomalyId}/classify`;
          }
        }
      } else {
        // If still scanning, show unlock dialog
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

  // Check if anomalies are ready (weather or planet missions)
  const isWeatherAnomalyReady = () => {
    if ((missionType !== 'weather' && missionType !== 'planet') || !positions[0]?.deployTime) return false;
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const elapsedMs = Math.max(0, currentTime.getTime() - new Date(positions[0].deployTime).getTime());
    return elapsedMs >= ONE_HOUR_MS;
  };

  // Auto-unlock satellite when anomaly is ready
  useEffect(() => {
    if ((missionType === 'weather' || missionType === 'planet') && isWeatherAnomalyReady() && positions[0] && !positions[0].unlocked) {
      // Auto-unlock the satellite
      setPositions(prev => 
        prev.map(sat => ({ ...sat, unlocked: true }))
      );
      
      // Also update in database
      if (session?.user?.id && positions[0].linkedAnomalyId) {
        supabase
          .from("linked_anomalies")
          .update({ unlocked: true })
          .eq("id", positions[0].linkedAnomalyId)
          .eq("author", session.user.id)
          .then(({ error }) => {
            if (error && !error.message?.includes('unlocked')) {
              console.error("Error auto-unlocking anomaly:", error);
            }
          });
      }
    }
  }, [missionType, currentTime, positions, session?.user?.id, supabase]);

  // Orbit animation - slower speed
  useEffect(() => {
    const orbitInterval = setInterval(() => {
      setOrbitAngle((prev) => (prev + 0.5) % 360);
    }, 50);

    return () => clearInterval(orbitInterval);
  }, []);

  // Flash animation (camera effect)
  useEffect(() => {
    const flashInterval = setInterval(() => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);
    }, 3000);

    return () => clearInterval(flashInterval);
  }, []);

  // Calculate satellite position
  const orbitRadius = 140;
  const satelliteX = Math.cos((orbitAngle * Math.PI) / 180) * orbitRadius;
  const satelliteY = Math.sin((orbitAngle * Math.PI) / 180) * orbitRadius;
  
  // Calculate satellite rotation to face planet
  const satelliteRotation = orbitAngle + 180;

  // Early returns AFTER all hooks are declared
  if (missionType === 'p-4') {
    return (
      <Section expandLink={"/viewports/satellite"} sectionId="satellite-position" variant="viewport" backgroundType="outer-solar" infoText={"Wind Survey mission is active."}>
        <div ref={sectionRef} className="relative z-10 flex items-center justify-center w-full h-full min-h-0 overflow-hidden">
          <SatelliteSpiderScan anomalies={windSurveyAnomalies} />
        </div>
      </Section>
    );
  }

  // Show planet survey if button clicked for planet missions
  if (showPlanetSurvey && missionType === 'planet' && positions[0]) {
    return (
      <Section expandLink={"/viewports/satellite"} sectionId="satellite-position" variant="viewport" backgroundType="outer-solar" infoText={"Analyze the planet data to determine its properties."}>
        <div ref={sectionRef} className="relative z-10 w-full h-full">
          <button
            onClick={() => setShowPlanetSurvey(false)}
            className="absolute top-4 left-4 z-50 text-[#6be0b3] hover:text-[#78cce2] transition-colors"
          >
            ← Back to Satellite View
          </button>
          <SatelliteProgressBar
            deployTime={positions[0].deployTime}
            now={currentTime}
            investigationType="planet"
            classification={classification}
            classificationId={classificationId ?? undefined}
          />
        </div>
      </Section>
    );
  }

  return (
  <Section expandLink={"/viewports/satellite"} sectionId="satellite-position" variant="viewport" backgroundType="outer-solar" infoText={"Send satellites to planets you or the community have discovered to search for clouds and weather events."}>
      <div ref={sectionRef} className="p-4 relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '480px' }}>
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="mb-6 w-full max-w-lg text-xs md:text-sm text-center text-zinc-300 leading-relaxed">
              <p className="font-semibold text-cyan-400 mb-2">Send Satellites to Explore!</p>
              <p className="mb-2">Now that we've discovered some planets, we can investigate them further with satellites. To start with, you get to send a satellite to a target location once every week. Your satellites can identify weather events and storms on your planets.</p>
              <p className="text-xs text-zinc-400">💡 You can start sending satellites even without discovered planets!</p>
            </div>
            <button
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg shadow-lg text-base md:text-lg font-bold transition-all duration-200 hover:scale-105 whitespace-nowrap"
              onClick={() => router.push('/viewports/satellite/deploy')}
            >
              🛰️ Deploy Weather Satellite
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* Orbiting Satellite Visualization */}
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center mb-6">
              {/* Stars background */}
              <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.3,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>

              {/* Planet - using PlanetGeneratorMinimal or a simple planet visual */}
              <div className="absolute">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-800 via-blue-600 to-blue-900 shadow-2xl border-2 border-blue-400/30">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-700/50 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Orbit path */}
              <div 
                className="absolute border-2 border-dashed border-[#6be0b3]/20 rounded-full"
                style={{
                  width: `${orbitRadius * 2}px`,
                  height: `${orbitRadius * 2}px`,
                }}
              />

              {/* Satellite */}
              <div
                className="absolute transition-all duration-100 cursor-pointer"
                style={{
                  transform: `translate(${satelliteX}px, ${satelliteY}px) rotate(${satelliteRotation}deg)`,
                }}
                onClick={() => positions[0] && handleSatelliteClick(positions[0])}
                onMouseEnter={() => positions[0] && handleSatelliteMouseEnter(positions[0])}
                onMouseLeave={handleSatelliteMouseLeave}
              >
                <div className="relative">
                  {/* Flash effect */}
                  {isFlashing && (
                    <div className="absolute inset-0 -m-4">
                      <div className="w-12 h-12 bg-yellow-400/50 rounded-full animate-ping" />
                    </div>
                  )}
                  
                  {/* Satellite icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6be0b3] to-[#78cce2] rounded-sm shadow-lg flex items-center justify-center relative">
                    {isFlashing && (
                      <svg className="w-5 h-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {!isFlashing && <div className="w-2 h-2 bg-white rounded-full" />}
                    {/* Solar panels */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-7 bg-blue-400/80" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-7 bg-blue-400/80" />
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {hoveredSatellite && tooltipData && (
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-[#6be0b3]/40 text-xs text-white max-w-xs z-50">
                  <p className="font-bold text-[#6be0b3] mb-1">{tooltipData.planetName || "Target Planet"}</p>
                  <p>Time remaining: {tooltipData.timeRemaining}</p>
                  <p>Deploy time: {tooltipData.deployTime.toLocaleDateString()}</p>
                  {tooltipData.classificationText && (
                    <p className="mt-1 text-[#6be0b3]/80">Classification: {tooltipData.classificationText}</p>
                  )}
                </div>
              )}
            </div>

            {/* Compact Timeline */}
            <div className="w-full max-w-2xl bg-[#181e2a]/80 backdrop-blur-sm p-3 rounded-lg border border-[#6be0b3]/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6be0b3] rounded-full animate-pulse" />
                  <h3 className="text-white font-medium text-sm">Mission Progress</h3>
                </div>
                <button
                  onClick={() => setTimelineExpanded(!timelineExpanded)}
                  className="text-[#6be0b3] hover:text-[#78cce2] transition-colors p-1 rounded hover:bg-[#6be0b3]/10"
                  aria-label={timelineExpanded ? "Collapse timeline" : "Expand timeline"}
                >
                  {timelineExpanded ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Timeline Steps - Compact single row by default */}
              {!timelineExpanded ? (
                <div className="flex items-center gap-3">
                  {/* Current step indicator */}
                  <div className="flex items-center gap-2 bg-[#232b3b]/60 px-3 py-2 rounded-lg flex-1">
                    <div className="w-6 h-6 rounded-full bg-[#6be0b3] flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-[#181e2a] rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs truncate">
                        {missionType === 'weather' ? 'Scanning for Weather Events' : 'Analyzing Planet Properties'}
                      </p>
                      <p className="text-[#6be0b3]/70 text-[10px] truncate">
                        {isWeatherAnomalyReady() ? (missionType === 'weather' ? 'Cloud detected!' : 'Data ready!') : `${formatTimeRemaining()} remaining`}
                      </p>
                    </div>
                  </div>
                  
                  {isWeatherAnomalyReady() ? (
                    /* Show classify button when ready */
                    <button
                      onClick={() => positions[0] && handleSatelliteClick(positions[0])}
                      className="bg-[#f2c572] text-[#181e2a] px-4 py-2 rounded-lg font-semibold text-xs hover:bg-[#e0b560] transition-colors flex-shrink-0"
                    >
                      {missionType === 'weather' ? 'Classify Cloud' : 'Classify Planet'}
                    </button>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#6be0b3]/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      
                      {/* Next step preview */}
                      <div className="flex items-center gap-2 opacity-50 px-3 py-2 flex-1">
                        <div className="w-6 h-6 rounded-full border-2 border-[#6be0b3]/30 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-[#6be0b3]/30 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-xs truncate">
                            {missionType === 'weather' ? 'Ready for Classification' : 'Data Ready'}
                          </p>
                          <p className="text-[#6be0b3]/70 text-[10px]">
                            Next
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Full expanded timeline - vertical layout */
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-[#232b3b]/60 p-2 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#6be0b3] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#181e2a]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium text-xs">Satellite Deployed</p>
                      <p className="text-[#6be0b3]/70 text-[10px]">{formatTimeSinceAction()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#232b3b]/60 p-2 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#6be0b3] flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-[#181e2a] rounded-full animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-xs">
                        {missionType === 'weather' ? 'Scanning for Weather Events' : 'Analyzing Planet Properties'}
                      </p>
                      <p className="text-[#6be0b3]/70 text-[10px]">
                        {isWeatherAnomalyReady() ? (missionType === 'weather' ? 'Cloud detected!' : 'Data ready!') : `${formatTimeRemaining()} remaining`}
                      </p>
                      {isWeatherAnomalyReady() && (
                        <button
                          onClick={() => positions[0] && handleSatelliteClick(positions[0])}
                          className="mt-2 bg-[#f2c572] text-[#181e2a] px-3 py-1 rounded text-[10px] font-semibold hover:bg-[#e0b560] transition-colors"
                        >
                          {missionType === 'weather' ? 'Classify Cloud' : 'Classify Planet'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50 p-2">
                    <div className="w-6 h-6 rounded-full border-2 border-[#6be0b3]/30 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-[#6be0b3]/30 rounded-full" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-xs">Data Collection Complete</p>
                      <p className="text-[#6be0b3]/70 text-[10px]">Pending</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-50 p-2">
                    <div className="w-6 h-6 rounded-full border-2 border-[#6be0b3]/30 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-[#6be0b3]/30 rounded-full" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-xs">Ready for Classification</p>
                      <p className="text-[#6be0b3]/70 text-[10px]">Upcoming</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};