"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { DatabaseAnomaly } from "../TelescopeViewportRange"
import { generateSectorName, generateStars } from "@/src/components/classification/telescope/utils/sector-utils"
import { Button } from "@/src/components/ui/button"
import SatelliteDeployConfirmation from "./Deploy/SatelliteDeployConfirmation";
import InvestigationModeSelect from "./Deploy/InvestigationModeSelect";
import SatelliteSidebar from "./SatelliteSidebar";
import { useState as useReactState } from "react";
import SatelliteDPad from "./Deploy/SatelliteDPad";
import SatellitePlanetSVG from "./Deploy/SatellitePlanetSVG";
import SatelliteCloudIcons from "./Deploy/SatelliteCloudIcons";
import SatelliteDeployButton from "./Deploy/SatelliteDeployButton";
import PlanetFocusView from './PlanetFocusView';
import DeploySidebar from './DeploySidebar';
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";

type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly };
export type EnrichedDatabaseAnomaly = DatabaseAnomaly & {
  stats?: {
    radius: number | string;
    density: number | string;
    temperature: number | string;
    mass: number | string;
    type: string;
  };
};

function seededRandom1(seed: number, salt: number = 0) {
  let x = Math.sin(seed + salt) * 1000;
  return x - Math.floor(x);
};

function generateAnomalyFromDB(dbAnomaly: DatabaseAnomaly, sectorX: number, sectorY: number): LocalAnomaly {
  const seed = dbAnomaly.id + sectorX * 1000 + sectorY;

  // Determine type
  // Map to a valid Anomaly type
  // Fallback to 'asteroid' for clouds, 'planet' for spherical-cloud
  let anomalyType: "exoplanet" | "planet" | "asteroid" | "sunspot" | "accretion_disc" = "planet";
  let shapeType: "cloud" | "spherical-cloud" = "spherical-cloud";
  if (dbAnomaly.anomalySet === "balloon-marsCloudShapes") {
    anomalyType = "asteroid";
    shapeType = "cloud";
  }

  return {
    id: `db-${dbAnomaly.id}`,
    name: dbAnomaly.content || `TESS-${String(dbAnomaly.id).padStart(3, "0")}`,
    x: seededRandom1(seed, 1) * 80 + 10,
    y: seededRandom1(seed, 2) * 80 + 10,
    brightness: seededRandom1(seed, 3) * 0.7 + 0.5,
    size: seededRandom1(seed, 4) * 0.8 + 0.6,
    pulseSpeed: seededRandom1(seed, 5) * 2 + 1,
    glowIntensity: seededRandom1(seed, 6) * 0.5 + 0.3,
    color: shapeType === "cloud" ? "#78cce2" : "#f2c572",
    shape: shapeType === "cloud" ? "circle" : "triangle",
    sector: generateSectorName(sectorX, sectorY),
    discoveryDate: new Date().toLocaleDateString(),
    type: anomalyType,
    project: "planet-hunters",
    dbData: dbAnomaly,
  };
}

export default function DeploySatelliteViewport() {
  // For mobile sidebar/modal
  const [mobileSidebarOpen, setMobileSidebarOpen] = useReactState(false);
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  // Investigation mode: 'weather' or 'planets'
  const [investigationMode, setInvestigationMode] = useState<'weather' | 'planets'>('weather');

  // All planet anomalies user can deploy to (classified planets or all community planets if none)
  const [planetAnomalies, setPlanetAnomalies] = useState<EnrichedDatabaseAnomaly[]>([])
  // Index of the focused planet
  const [focusedPlanetIdx, setFocusedPlanetIdx] = useState<number>(0)
  // Cloud anomalies for the focused planet
  const [cloudAnomalies, setCloudAnomalies] = useState<DatabaseAnomaly[]>([])
  // For stats
  const [userPlanetCount, setUserPlanetCount] = useState<number>(0)
  const [userCloudClassifications, setUserCloudClassifications] = useState<number>(0);
  const [cloudInvestigationDescription, setCloudInvestigationDescription] = useState<string>('');
  // Remove userPlanets, always use planetAnomalies for sidebar
  const [communityPlanetCount, setCommunityPlanetCount] = useState<number>(0)
  const [stars, setStars] = useState<Star[]>([])
  const [alreadyDeployed, setAlreadyDeployed] = useState(false)
  const [deploymentMessage, setDeploymentMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null);
  const [skillProgress, setSkillProgress] = useState<{ [key: string]: number }>({});
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<{
    anomalies: string[]
    sectorName: string
  } | null>(null);

  // Redirect if already deployed
  useEffect(() => {
    if (alreadyDeployed) {
      router.replace('/viewports/satellite');
    }
  }, [alreadyDeployed, router]);



  // Fetch all planet anomalies user can deploy to (user's classified planets, or all community planets if none)
  const fetchPlanetAnomalies = async () => {
    try {
      let planetIds: number[] = [];
      let userPlanets: DatabaseAnomaly[] = [];
      if (session?.user?.id) {
        // Get all planet classifications by this user
        const { data: classifications, error: classErr } = await supabase
          .from("classifications")
          .select("anomaly")
          .eq("author", session.user.id)
          .eq("classificationtype", "planet");
        if (!classErr && classifications && classifications.length > 0) {
          planetIds = classifications.map(c => c.anomaly).filter(Boolean);
          // Fetch those anomalies from telescope-tess
          const { data: anomalies, error: anomErr } = await supabase
            .from("anomalies")
            .select("*")
            .in("id", planetIds)
            .eq("anomalySet", "telescope-tess");
          if (!anomErr && anomalies) {
            userPlanets = anomalies;
          }
        }
      }
      if (userPlanets.length > 0) {
        setPlanetAnomalies(userPlanets);
      } else {
        // Fallback: show all community planets
        const { data: allPlanets, error: allErr } = await supabase
          .from("anomalies")
          .select("*")
          .eq("anomalySet", "telescope-tess");
        setPlanetAnomalies(allPlanets || []);
      }
      fetchPlanetDiscoveryStats();
    } catch (error: any) {
      setPlanetAnomalies([]);
      console.error("Unexpected error in `fetchPlanetAnomalies`: ", error);
    }
  };

  // Fetch up to 10 cloud anomalies for a given planet id
  const fetchCloudAnomalies = async (planetId: number, cloudClassificationCount: number) => {
    let anomalySets: string[] = [];
    let description = "Investigating clouds on terrestrial planets.";

    if (cloudClassificationCount >= 2) {
      anomalySets = ["lidar-jovianVortexHunter", "cloudspottingOnMars", "balloon-marsCloudShapes"];
      description = "Investigating radar clouds, clouds on terrestrial planets, and clouds on gaseous planets.";
    } else {
      anomalySets = ["cloudspottingOnMars"];
    }
    setCloudInvestigationDescription(description);

    try {
      const { data, error } = await supabase
        .from("anomalies")
        .select("*")
        .in("anomalySet", anomalySets)
        .eq("parentAnomaly", planetId);
      if (!error && data) {
        // Deterministically select up to 10
        const sorted = [...data].sort((a, b) => a.id - b.id);
        const selected = sorted.slice(0, 10);
        setCloudAnomalies(selected);
      } else {
        setCloudAnomalies([]);
      }
    } catch (err) {
      setCloudAnomalies([]);
    }
  };

  // Fetch stats for planet discoveries (user and community)
  const fetchPlanetDiscoveryStats = async () => {
    try {
      // User count
      if (session?.user?.id) {
        const { count: userCount } = await supabase
          .from("classifications")
          .select("id", { count: "exact", head: true })
          .eq("author", session.user.id)
          .eq("classificationtype", "planet");
        setUserPlanetCount(userCount || 0);
      } else {
        setUserPlanetCount(0);
      }
      // Community count
      const { count: commCount } = await supabase
        .from("classifications")
        .select("id", { count: "exact", head: true })
        .eq("classificationtype", "planet");
      setCommunityPlanetCount(commCount || 0);
    } catch (err) {
      setUserPlanetCount(0);
      setCommunityPlanetCount(0);
    }
  };

  const fetchUserCloudClassificationCount = async () => {
    if (!session?.user?.id) {
      setUserCloudClassifications(0);
      return 0;
    }
    try {
      const { count, error } = await supabase
        .from("classifications")
        .select("id", { count: "exact", head: true })
        .eq("author", session.user.id)
        .in("classificationtype", ["cloud", "vortex", "radar"]);

      if (error) {
        console.error("Error fetching user cloud classifications count:", error);
        setUserCloudClassifications(0);
        return 0;
      }
      setUserCloudClassifications(count || 0);
      return count || 0;
    } catch (err) {
      console.error("Unexpected error in fetchUserCloudClassificationCount:", err);
      setUserCloudClassifications(0);
      return 0;
    }
  };


  const checkDeployment = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: linkedAnomalies, error: linkedAnomaliesError } = await supabase
      .from("linked_anomalies")
      .select("*")
      .eq("automaton", "WeatherSatellite")
      .eq("author", userId)
      .gte("date", oneWeekAgo.toISOString());

    if (linkedAnomaliesError) {
      console.error("Error fetching linked anomalies: ", linkedAnomaliesError);
      return;
    }

    const linkedCount = linkedAnomalies?.length ?? 0;
    // This logic seems off, but preserving original intent:
    const totalAllowedDeploys = linkedCount;
    const userCanRedeploy = totalAllowedDeploys > linkedCount;

    if (linkedCount === 0) {
      setAlreadyDeployed(false);
      setDeploymentMessage(null);
    } else if (userCanRedeploy) {
      setAlreadyDeployed(false);
      setDeploymentMessage("You have earned additional deploys by interacting with the community this week!");
    } else {
      setAlreadyDeployed(true);
      setDeploymentMessage("Telescope has already been deployed this week. Recalibrate & search again next week.");
    }
  };



  // When focused planet changes, fetch its cloud anomalies
  useEffect(() => {
    if (planetAnomalies.length > 0 && focusedPlanetIdx >= 0 && focusedPlanetIdx < planetAnomalies.length) {
      const planet = planetAnomalies[focusedPlanetIdx];
      fetchCloudAnomalies(planet.id, userCloudClassifications);
      setStars(generateStars(planet.id, 0));

      // Fetch stats for the focused planet
      fetchPlanetStats(planet.id).then((stats) => {
        setPlanetAnomalies((prev) => {
          const updated = [...prev];
          updated[focusedPlanetIdx] = { ...updated[focusedPlanetIdx], stats: stats ?? undefined };
          return updated;
        });
      });
    } else {
      setCloudAnomalies([]);
      setStars([]);
    }
  }, [planetAnomalies, focusedPlanetIdx, userCloudClassifications]);
  // Fetch anomalies and check deployment on mount/session change
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPlanetAnomalies();
      await fetchUserCloudClassificationCount();
      await checkDeployment();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Reset focus if planet list changes
  useEffect(() => {
    setFocusedPlanetIdx(0);
  }, [planetAnomalies.length]);


  // Show anomaly content on click
  const [anomalyContent, setAnomalyContent] = useState<{ content: string; type: string } | null>(null);
  const handleAnomalyClick = (a: Anomaly) => {
    setFocusedAnomaly(a);
    // Find the original anomaly by id
    const dbId = typeof a.id === 'string' && a.id.startsWith('db-') ? Number(a.id.replace('db-', '')) : a.id;
    // Try planet first, then cloud
    const found = planetAnomalies.find(anom => anom.id === dbId) || cloudAnomalies.find(anom => anom.id === dbId);
    let typeLabel = 'Unknown';
    if (found) {
      if (found.anomalySet === 'telescope-tess') typeLabel = 'Planet';
      else typeLabel = 'Cloud';
    }
    setAnomalyContent(found ? { content: found.content || '', type: typeLabel } : null);
  };

  // Drag and D-Pad handlers for planet focus
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    if (Math.abs(deltaX) > 50) {
      setFocusedPlanetIdx((prev) => {
        if (deltaX > 0) {
          return Math.max(0, prev - 1);
        } else {
          return Math.min(planetAnomalies.length - 1, prev + 1);
        }
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // D-Pad handlers: left/right changes planet focus
  const handleDPad = (dir: "up" | "down" | "left" | "right") => {
    if (dir === "left") setFocusedPlanetIdx((prev) => Math.max(0, prev - 1));
    else if (dir === "right") setFocusedPlanetIdx((prev) => Math.min(planetAnomalies.length - 1, prev + 1));
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };


  const handleDeploy = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const now = new Date().toISOString();
    let rows = [];
    const planet = planetAnomalies[focusedPlanetIdx];
    if (!planet) return;
    if (investigationMode === 'planets') {
      // Find classification for this user/planet
      const { data: classifications } = await supabase
        .from('classifications')
        .select('id')
        .eq('author', userId)
        .eq('anomaly', planet.id)
        .eq('classificationtype', 'planet');
      const classificationId = classifications && classifications[0]?.id;
      rows.push({
        author: userId,
        anomaly_id: planet.id,
        classification_id: classificationId || null,
        date: now,
        automaton: 'WeatherSatellite',
        unlocked: false,
        unlock_time: null,
      });
    } else if (investigationMode === 'weather') {
      // Find classification for this user/planet
      const { data: classifications } = await supabase
        .from('classifications')
        .select('id')
        .eq('author', userId)
        .eq('anomaly', planet.id)
        .eq('classificationtype', 'planet');
      const classificationId = classifications && classifications[0]?.id;
      
      let anomalySets: string[] = [];
      if (userCloudClassifications >= 2) {
        anomalySets = ["lidar-jovianVortexHunter", "cloudspottingOnMars", "balloon-marsCloudShapes"];
      } else {
        anomalySets = ["cloudspottingOnMars"];
      }

      // Fetch up to 4 cloud anomalies from ANYWHERE in the correct sets
      const { data: allClouds, error: cloudErr } = await supabase
        .from('anomalies')
        .select('id')
        .in('anomalySet', anomalySets);

      if (cloudErr) {
        alert('Failed to fetch cloud anomalies: ' + cloudErr.message);
        return;
      }
      const shuffledClouds = (allClouds || []).sort(() => 0.5 - Math.random());
      shuffledClouds.slice(0, 4).forEach((cloud) => {
        rows.push({
          author: userId,
          anomaly_id: cloud.id,
          classification_id: classificationId || null,
          date: now,
          automaton: 'WeatherSatellite',
          unlocked: false,
          unlock_time: null,
        });
      });
    }
    if (rows.length > 0) {
      const { error } = await supabase.from('linked_anomalies').insert(rows);
      if (!error) {
        setShowConfirmation(true);
        setDeploymentResult({
          anomalies: rows.map(r => String(r.anomaly_id)),
          sectorName: planet.content || `TIC ${planet.id}`,
        });
      } else {
        alert('Deployment failed: ' + error.message);
      }
    }
  };

    // Fetch planet stats from classifications
    const fetchPlanetStats = async (planetId: number) => {
      try {
        const { data: classifications, error } = await supabase
          .from("classifications")
          .select("content, anomaly, classificationtype")
          .eq("anomaly", planetId)
          .eq("classificationtype", "planet-inspection");

        if (error) {
          console.error("Error fetching planet stats:", error);
          return null;
        }


        if (classifications && classifications.length > 0) {
          const parsedStats = classifications.map((entry) => {
            return parsePlanetStats(entry.content);
          });

          return parsedStats.find((stats) => stats !== null) || null;
        }

        return null;
      } catch (err) {
        console.error("Unexpected error in fetchPlanetStats:", err);
        return null;
      }
    };

    const parsePlanetStats = (content: string) => {
      try {
        const stats = content.split(/,\s*/).reduce((acc, pair) => {
          const [key, value] = pair.split(/:\s*/);
          acc[key.trim()] = isNaN(Number(value)) ? value.trim() : parseFloat(value).toFixed(2);
          return acc;
        }, {} as Record<string, any>);
        return {
          radius: stats.radius || "N/A",
          density: stats.density || "N/A",
          temperature: stats.temperature || "N/A",
          mass: stats.mass || "N/A",
          type: stats.type || "N/A",
        };
      } catch (err) {
        console.error("Error parsing planet stats content:", err);
        return null;
      }
    };

    return (
      <div className="min-h-screen h-screen w-screen flex flex-col bg-[#10141c]">
        {/* Top bar: controls and stats */}
        <div className="flex flex-row items-center justify-between px-6 py-3 bg-[#181e2a]/90 border-b border-[#232b3b] z-20">
          <div className="flex items-center gap-4">
            {/* InvestigationModeSelect moved to sidebar */}
          </div>
          {investigationMode === 'weather' && (
            <div className="flex flex-col items-center gap-2 text-xs text-[#78cce2]">
              <div className="flex gap-6">
                <span>Your Planets: <span className="font-bold">{userPlanetCount}</span></span>
                <span>Community: <span className="font-bold">{communityPlanetCount}</span></span>
              </div>
              <div>
                <p>{cloudInvestigationDescription}</p>
              </div>
            </div>
          )}
        </div>

      {/* Main map/viewport area */}
      <div className="flex-1 flex flex-row relative overflow-hidden h-full min-h-0">
          {/* Main viewport content (planets/clouds) */}
          <div className="relative flex-1 flex items-center justify-center z-10">
            <PlanetFocusView
              planet={planetAnomalies[focusedPlanetIdx] || null}
              onNext={() => setFocusedPlanetIdx((prev) => Math.min(planetAnomalies.length - 1, prev + 1))}
              onPrev={() => setFocusedPlanetIdx((prev) => Math.max(0, prev - 1))}
              isFirst={focusedPlanetIdx === 0}
              isLast={focusedPlanetIdx === planetAnomalies.length - 1}
            />
          </div>

          {/* Right-side info panel (sidebar) */}
          <div className="hidden md:flex flex-col h-full min-h-0 w-[370px] max-w-[370px] z-30 bg-[#10141c] border-l border-[#232b3b]">
            <DeploySidebar
              investigationMode={investigationMode}
              setInvestigationMode={setInvestigationMode}
              duration={7} // Example default duration
              setDuration={(days) => console.log('Set duration:', days)}
              onDeploy={handleDeploy}
              isDeploying={deploying}
              cloudInvestigationDescription={cloudInvestigationDescription}
              userCloudClassifications={userCloudClassifications}
            />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden">
          <DeploySidebar
            investigationMode={investigationMode}
            setInvestigationMode={setInvestigationMode}
            duration={7} // Example default duration
            setDuration={(days) => console.log('Set duration:', days)}
            onDeploy={handleDeploy}
            isDeploying={deploying}
            isMobile
            cloudInvestigationDescription={cloudInvestigationDescription}
            userCloudClassifications={userCloudClassifications}
          />
        </div>

        {/* Success confirmation overlay */}
        {showConfirmation && deploymentResult && (
          <SatelliteDeployConfirmation
            deploymentResult={deploymentResult}
            onClose={handleConfirmationClose}
            onTelescope={() => router.push('/structures/telescope')}
          />
        )}

        {/* Background texture */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <TelescopeBackground
            sectorX={0}
            sectorY={0}
            variant="default"
            isDarkTheme={true}
            showAllAnomalies={false}
          />
        </div>

        {/* Stats display for focused planet */}
        <div className="absolute top-4 right-4 bg-[#181e2a] p-4 rounded-lg shadow-lg z-50">
          <div className="text-xs text-[#78cce2]">
            <h3 className="font-bold text-sm mb-2">Planet Stats</h3>
            <p>Temperature: {planetAnomalies[focusedPlanetIdx]?.stats?.temperature || "N/A"} K</p>
            <p>Radius: {planetAnomalies[focusedPlanetIdx]?.stats?.radius || "N/A"} R☉</p>
            <p>Mass: {planetAnomalies[focusedPlanetIdx]?.stats?.mass || "N/A"} M☉</p>
          </div>
        </div>
      </div>
  )
}