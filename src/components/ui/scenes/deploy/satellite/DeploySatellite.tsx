"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/src/components/ui/select"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
import type { Anomaly, Star } from "@/types/Structures/telescope"

import { DatabaseAnomaly } from "../TelescopeViewportRange"
import { generateSectorName, generateStars } from "@/src/components/classification/telescope/utils/sector-utils"
import DeploySatelliteOverlay from "./SatelliteOverlay"
import { SatelliteView } from "@/src/components/classification/satellite/satellite-view"
import { CheckCircle, Target, Telescope, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../card"
import { Badge } from "../../../badge"
import { Button } from "../../../button"

type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly };

function seededRandom1(seed: number, salt: number = 0) {
  let x = Math.sin(seed + salt) * 1000;
  return x - Math.floor(x);
}

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
  const supabase = useSupabaseClient();
  const session = useSession();

  // Investigation mode: 'weather' or 'planets'
  const [investigationMode, setInvestigationMode] = useState<'weather' | 'planets'>('weather');

  const router = useRouter();

  // All planet anomalies user can deploy to (classified planets or all community planets if none)
  const [planetAnomalies, setPlanetAnomalies] = useState<DatabaseAnomaly[]>([])
  // Index of the focused planet
  const [focusedPlanetIdx, setFocusedPlanetIdx] = useState<number>(0)
  // Cloud anomalies for the focused planet
  const [cloudAnomalies, setCloudAnomalies] = useState<DatabaseAnomaly[]>([])
  // For stats
  const [userPlanetCount, setUserPlanetCount] = useState<number>(0)
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
  const fetchCloudAnomalies = async (planetId: number) => {
    try {
      const { data, error } = await supabase
        .from("anomalies")
        .select("*")
        .in("anomalySet", ["lidar-jovianVortexHunter", "cloudspottingOnMars", "balloon-marsCloudShapes"])
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

    console.log("Linked anomalies deployed this week:", linkedCount);
    console.log("Total allowed deploys:", totalAllowedDeploys);
    console.log("User can redeploy?", userCanRedeploy ? "YES" : "NO");

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
      fetchCloudAnomalies(planet.id);
      setStars(generateStars(planet.id, 0));
    } else {
      setCloudAnomalies([]);
      setStars([]);
    }
  }, [planetAnomalies, focusedPlanetIdx]);
  // Fetch anomalies and check deployment on mount/session change
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPlanetAnomalies();
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
      // Fetch up to 4 cloud anomalies from ANYWHERE in the correct sets
      const { data: allClouds, error: cloudErr } = await supabase
        .from('anomalies')
        .select('id')
        .in('anomalySet', [
          'lidar-jovianVortexHunter',
          'cloudspottingOnMars',
          'balloon-marsCloudShapes',
        ]);
      if (cloudErr) {
        alert('Failed to fetch cloud anomalies: ' + cloudErr.message);
        return;
      }
      (allClouds || []).slice(0, 4).forEach((cloud) => {
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

    return (
      <div className="h-screen w-screen flex flex-col bg-[#10141c]">
        {/* Top bar: controls and stats */}
        <div className="flex flex-row items-center justify-between px-6 py-3 bg-[#181e2a]/90 border-b border-[#232b3b] z-20">
          <div className="flex items-center gap-4">
            <Select value={investigationMode} onValueChange={v => setInvestigationMode(v as 'weather' | 'planets')}>
              <SelectTrigger className="w-64">
                {investigationMode === 'weather' ? (
                  <span>
                    Weather Anomalies
                    <span className="block text-xs text-slate-400">Clouds, storms, atmospheric phenomena</span>
                  </span>
                ) : (
                  <span>
                    Physical Properties
                    <span className="block text-xs text-slate-400">Radius, density, orbit, temperature</span>
                  </span>
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weather">
                  Weather Anomalies
                  <div className="text-xs text-slate-400">Clouds, storms, atmospheric phenomena</div>
                </SelectItem>
                <SelectItem value="planets">
                  Physical Properties
                  <div className="text-xs text-slate-400">Radius, density, orbit, temperature</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {investigationMode === 'weather' && (
            <div className="flex gap-6 text-xs text-[#78cce2]">
              <span>Your Planets: <span className="font-bold">{userPlanetCount}</span></span>
              <span>Community: <span className="font-bold">{communityPlanetCount}</span></span>
            </div>
          )}
        </div>

        {/* Main map/viewport area */}
        <div className="flex-1 flex flex-row relative overflow-hidden">
          {/* Map/coverage background with satellite-style space texture */}
          <div className="absolute inset-0 z-0">
            {/* Custom SVG space texture (stars, nebula, subtle grid) */}
            <svg className="w-full h-full absolute inset-0" width="100%" height="100%" style={{ zIndex: 1 }}>
              <defs>
                <radialGradient id="nebula" cx="60%" cy="30%" r="1">
                  <stop offset="0%" stopColor="#78cce2" stopOpacity="0.18" />
                  <stop offset="80%" stopColor="#10141c" stopOpacity="0.0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="#10141c" />
              <rect width="100%" height="100%" fill="url(#nebula)" />
              {/* Stars */}
              {[...Array(120)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 100 + '%'}
                  cy={Math.random() * 100 + '%'}
                  r={Math.random() * 0.7 + 0.2}
                  fill="#fff"
                  opacity={Math.random() * 0.7 + 0.2}
                />
              ))}
              {/* Subtle grid overlay */}
              {[...Array(20)].map((_, i) => (
                <line key={'v'+i} x1={i * 5 + '%'} y1="0" x2={i * 5 + '%'} y2="100%" stroke="#fff" strokeWidth="0.3" opacity="0.08" />
              ))}
              {[...Array(10)].map((_, i) => (
                <line key={'h'+i} x1="0" y1={i * 10 + '%'} x2="100%" y2={i * 10 + '%'} stroke="#fff" strokeWidth="0.3" opacity="0.08" />
              ))}
              {/* Remove oval/ellipse overlay */}
            </svg>
          </div>

          {/* Main viewport content (planets/clouds) */}
          <div className="relative flex-1 flex items-center justify-center z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="text-[#78cce2] text-lg">Loading...</div>
              </div>
            ) : planetAnomalies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="bg-[#005066]/90 border border-[#78cce2]/30 rounded-lg px-8 py-6 text-center max-w-md">
                  <div className="text-[#e4eff0] text-lg font-semibold mb-2">You need to discover planets first using your telescope</div>
                  <div className="text-[#78cce2] text-sm mb-4">Classify exoplanet candidates in the telescope interface to unlock their physical properties here.</div>
                  <Link href="/structures/telescope">
                    <Button className="bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] font-medium">Go to Telescope</Button>
                  </Link>
                </div>
              </div>
            ) : planetAnomalies[focusedPlanetIdx] ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Large planet in center, color/shape/texture from content */}
                {(() => {
                  const planet = planetAnomalies[focusedPlanetIdx];
                  // Hash content to get color/shape/texture
                  const content = planet.content || String(planet.id);
                  let hash = 0;
                  for (let i = 0; i < content.length; i++) hash = content.charCodeAt(i) + ((hash << 5) - hash);
                  // Color palette
                  const colors = [
                    ["#78cce2", "#e4eff0"], // blue
                    ["#f2c572", "#ffe9b3"], // gold
                    ["#b8e6b8", "#e4ffe4"], // green
                    ["#e2a6cc", "#fbe4f0"], // pink
                    ["#b3b3e6", "#e4e4ff"], // purple
                    ["#e4eff0", "#b8e6e6"], // ice
                  ];
                  const shapes = ["circle", "ellipse", "hexagon", "diamond", "star", "pentagon"];
                  const textures = [
                    // SVG patterns
                    null,
                    "dots",
                    "stripes",
                    "rings",
                  ];
                  const colorIdx = Math.abs(hash) % colors.length;
                  const shapeIdx = Math.abs(Math.floor(hash / 10)) % shapes.length;
                  const textureIdx = Math.abs(Math.floor(hash / 100)) % textures.length;
                  const [mainColor, accentColor] = colors[colorIdx];
                  const shape = shapes[shapeIdx];
                  const texture = textures[textureIdx];
                  // SVG pattern defs
                  const patternDefs = texture === "dots" ? (
                    <pattern id="planetTexture" patternUnits="userSpaceOnUse" width="18" height="18">
                      <circle cx="9" cy="9" r="3" fill={accentColor} opacity="0.18" />
                    </pattern>
                  ) : texture === "stripes" ? (
                    <pattern id="planetTexture" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(30)">
                      <rect x="0" y="0" width="8" height="16" fill={accentColor} opacity="0.13" />
                    </pattern>
                  ) : texture === "rings" ? (
                    <radialGradient id="planetTexture">
                      <stop offset="60%" stopColor={accentColor} stopOpacity="0.10" />
                      <stop offset="100%" stopColor={mainColor} stopOpacity="0.0" />
                    </radialGradient>
                  ) : null;
                  // Shape SVG
                  let shapeSvg = null;
                  if (shape === "circle") {
                    shapeSvg = <circle cx="160" cy="160" r="130" fill={texture ? "url(#planetTexture)" : mainColor} />;
                  } else if (shape === "ellipse") {
                    shapeSvg = <ellipse cx="160" cy="170" rx="130" ry="100" fill={texture ? "url(#planetTexture)" : mainColor} />;
                  } else if (shape === "hexagon") {
                    shapeSvg = <polygon points="160,40 270,110 270,230 160,300 50,230 50,110" fill={texture ? "url(#planetTexture)" : mainColor} />;
                  } else if (shape === "diamond") {
                    shapeSvg = <polygon points="160,40 300,160 160,300 20,160" fill={texture ? "url(#planetTexture)" : mainColor} />;
                  } else if (shape === "star") {
                    shapeSvg = <polygon points="160,40 185,130 270,130 200,180 225,270 160,220 95,270 120,180 50,130 135,130" fill={texture ? "url(#planetTexture)" : mainColor} />;
                  } else if (shape === "pentagon") {
                    shapeSvg = <polygon points="160,40 270,120 220,260 100,260 50,120" fill={texture ? "url(#planetTexture)" : mainColor} />;
                  }
                  return (
                    <div className="absolute left-1/2 top-1/2 z-10" style={{ transform: "translate(-50%, -50%)" }}>
                      <svg width="320" height="320" viewBox="0 0 320 320" className="drop-shadow-2xl">
                        <defs>
                          {patternDefs}
                        </defs>
                        {shapeSvg}
                        <ellipse cx="160" cy="220" rx="100" ry="24" fill={accentColor} fillOpacity="0.13" />
                        <ellipse cx="160" cy="240" rx="80" ry="16" fill={mainColor} fillOpacity="0.09" />
                      </svg>
                      <div className="absolute w-full text-center left-0 top-[60%] text-[#e4eff0] text-2xl font-mono font-bold tracking-wider drop-shadow-lg">
                        {planet.content || `TIC ${planet.id}`}
                      </div>
                      {/* Deploy button */}
                      <div className="w-full flex justify-center mt-8">
                        <Button
                          className="bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-[#005066]"
                          onClick={handleDeploy}
                        >
                          Deploy Weather Satellite
                        </Button>
                      </div>
                    </div>
                  );
                })()}
                {/* Weather anomalies as icons around the planet */}
                {cloudAnomalies.length > 0 && cloudAnomalies.map((a, i) => {
                  // Place icons in a circle around the planet
                  const angle = (i / cloudAnomalies.length) * 2 * Math.PI;
                  const radius = 180;
                  const x = 160 + radius * Math.cos(angle) - 18;
                  const y = 160 + radius * Math.sin(angle) - 18;
                  return (
                    <div
                      key={a.id}
                      className="absolute z-20 cursor-pointer"
                      style={{ left: `calc(50% + ${radius * Math.cos(angle)}px)`, top: `calc(50% + ${radius * Math.sin(angle)}px)` }}
                      title={a.content || `Cloud #${a.id}`}
                      onClick={() => handleAnomalyClick(generateAnomalyFromDB(a, 0, i + 1))}
                    >
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="#78cce2" fillOpacity="0.7" />
                        <circle cx="18" cy="18" r="10" fill="#e4eff0" fillOpacity="0.5" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="bg-[#232b3b]/90 border border-[#78cce2]/30 rounded-lg px-8 py-6 text-center max-w-md">
                  <div className="text-[#e4eff0] text-lg font-semibold mb-2">No planet selected or available.</div>
                  <div className="text-[#78cce2] text-sm mb-4">Please select a planet from the sidebar or discover new ones.</div>
                </div>
              </div>
            )}
          </div>

          {/* Right-side info panel (sidebar) */}
          <div className="hidden md:flex flex-col w-[340px] min-w-[260px] max-w-[400px] h-full bg-gradient-to-br from-[#181e2a] to-[#10141c] border-l border-[#232b3b] z-20 p-0 overflow-y-auto shadow-2xl">
            {/* Mode toggle in sidebar */}
            <div className="px-6 pt-6 pb-2 border-b border-[#232b3b] bg-[#181e2a]/90 sticky top-0 z-10">
              <div className="flex flex-col gap-2">
                <span className="text-[#78cce2] text-lg font-bold">Investigation Mode</span>
                <Select value={investigationMode} onValueChange={v => setInvestigationMode(v as 'weather' | 'planets')}>
                  <SelectTrigger className="w-full bg-[#232b3b] border border-[#78cce2]/30 text-[#e4eff0]">
                    {investigationMode === 'weather' ? (
                      <span>
                        <span className="text-[#78cce2] font-bold">Weather Anomalies</span>
                        <span className="block text-xs text-slate-400">Clouds, storms, atmospheric phenomena</span>
                      </span>
                    ) : (
                      <span>
                        <span className="text-[#f2c572] font-bold">Inspect Planets</span>
                        <span className="block text-xs text-slate-400">Radius, density, orbit, temperature</span>
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weather">
                      <span className="text-[#78cce2] font-bold">Weather Anomalies</span>
                      <div className="text-xs text-slate-400">Clouds, storms, atmospheric phenomena</div>
                    </SelectItem>
                    <SelectItem value="planets">
                      <span className="text-[#f2c572] font-bold">Inspect Planets</span>
                      <div className="text-xs text-slate-400">Radius, density, orbit, temperature</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 px-6 py-4 flex flex-col gap-6">
              {/* Satellite section */}
              <div>
                <div className="text-[#78cce2] text-base font-bold mb-2 flex items-center gap-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#78cce2" fillOpacity="0.18"/><rect x="10" y="4" width="4" height="8" rx="2" fill="#78cce2"/><rect x="6" y="16" width="12" height="2" rx="1" fill="#f2c572"/></svg>
                  Satellite 1
                </div>
                <div className="text-xs text-[#e4eff0]/80 mb-2">Active Weather Satellite</div>
              </div>
              {/* Planets section */}
              <div>
                <div className="text-[#f2c572] text-base font-bold mb-2">Planets</div>
                <div className="space-y-2">
                  {planetAnomalies.length > 0 ? planetAnomalies.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition border border-transparent ${i === focusedPlanetIdx ? (investigationMode === 'planets' ? 'bg-[#f2c572]/20 border-[#f2c572]' : 'bg-[#78cce2]/20 border-[#78cce2]') : 'hover:bg-[#232b3b]'}`}
                      onClick={() => setFocusedPlanetIdx(i)}
                    >
                      <span className={`w-2 h-2 rounded-full inline-block ${investigationMode === 'planets' ? 'bg-[#f2c572]' : 'bg-[#78cce2]'}`}></span>
                      <span className="text-[#e4eff0] font-mono text-sm">TIC {p.content || p.id}</span>
                      {i === focusedPlanetIdx && <span className={`text-xs ${investigationMode === 'planets' ? 'text-[#f2c572]' : 'text-[#78cce2]'}`}>Focused</span>}
                    </div>
                  )) : (
                    <div className={investigationMode === 'planets' ? 'text-[#f2c572] text-xs' : 'text-[#78cce2] text-xs'}>
                      No planets discovered yet.
                    </div>
                  )}
                </div>
              </div>
              {/* Weather anomalies section (only in weather mode) */}
              {investigationMode === 'weather' && (
                <div>
                  <div className="text-[#78cce2] text-base font-bold mb-2">Weather Anomalies</div>
                  <div className="space-y-2">
                    {cloudAnomalies.length > 0 ? cloudAnomalies.map((a, i) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-[#232b3b] border border-[#78cce2]/30"
                        onClick={() => handleAnomalyClick(generateAnomalyFromDB(a, 0, i + 1))}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#78cce2] inline-block"></span>
                        <span className="text-[#e4eff0] font-mono text-sm">{a.content || `Cloud #${a.id}`}</span>
                      </div>
                    )) : <div className="text-[#78cce2] text-xs">No weather anomalies for this planet.</div>}
                  </div>
                </div>
              )}
              {/* Anomaly details (if open) */}
              {anomalyContent && (
                <div className="mt-8 p-4 bg-[#232b3b] rounded-lg border border-[#78cce2]/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-[#e4eff0]">Anomaly Details</span>
                    <button onClick={() => setAnomalyContent(null)} className="text-[#78cce2] hover:underline">Close</button>
                  </div>
                  <div className="mb-2 text-xs text-[#78cce2]">Type: <span className="font-semibold">{anomalyContent.type}</span></div>
                  <div className="whitespace-pre-line text-sm mb-4 text-[#e4eff0]">{anomalyContent.content}</div>
                </div>
              )}
            </div>
          </div>

          {/* D-pad and sector/planet info: bottom left, floating, responsive */}
          <div className="absolute left-6 bottom-6 z-30 flex flex-col items-center gap-2">
            <div className="bg-[#181e2a]/90 border border-[#78cce2]/30 rounded-2xl shadow-xl p-4 flex flex-col items-center">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 w-32 h-32 mb-2 relative">
                <div></div>
                <button
                  aria-label="Move Up"
                  className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
                  onClick={() => handleDPad("up")}
                >↑</button>
                <div></div>
                <button
                  aria-label="Move Left"
                  className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
                  onClick={() => handleDPad("left")}
                >←</button>
                <div className="bg-[#005066] rounded-full border-2 border-[#78cce2] w-10 h-10 flex flex-col items-center justify-center text-[10px] text-[#78cce2] font-mono">
                  <div>{planetAnomalies.length > 0 ? `${focusedPlanetIdx + 1} / ${planetAnomalies.length}` : '--'}</div>
                  {/* Sector info removed */}
                </div>
                <button
                  aria-label="Move Right"
                  className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
                  onClick={() => handleDPad("right")}
                >→</button>
                <div></div>
                <button
                  aria-label="Move Down"
                  className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-10 h-10 shadow-lg border-2 border-[#005066] flex items-center justify-center text-xl font-bold transition"
                  onClick={() => handleDPad("down")}
                >↓</button>
                <div></div>
              </div>
            </div>
          </div>

          {/* Mobile anomaly details: floating bottom card */}
          {anomalyContent && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#002439] border-t border-[#78cce2] rounded-t-lg px-6 py-4 shadow-xl text-[#e4eff0] max-w-full w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Anomaly Details</span>
                <button onClick={() => setAnomalyContent(null)} className="text-[#78cce2] hover:underline">Close</button>
              </div>
              <div className="mb-2 text-xs text-[#78cce2]">Type: <span className="font-semibold">{anomalyContent.type}</span></div>
              <div className="whitespace-pre-line text-sm">{anomalyContent.content}</div>
            </div>
          )}
        </div>

        {/* Success confirmation overlay (unchanged) */}
        {showConfirmation && deploymentResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
            <Card className="bg-[#181e2a] border-2 border-[#6be0b3] max-w-md w-full mx-2 shadow-2xl rounded-2xl">
              <CardHeader className="relative pb-2">
                <button
                  onClick={handleConfirmationClose}
                  className="absolute top-3 right-3 p-2 text-[#6be0b3] hover:bg-[#6be0b3]/20 rounded-full transition"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6be0b3] to-[#78cce2] rounded-full flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-[#181e2a]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#e4eff0] text-xl">Satellite Deployed!</CardTitle>
                    <CardDescription className="text-[#6be0b3] text-sm">
                      Your weather satellite is now monitoring anomalies
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#232b3b]/80 p-4 rounded-lg border border-[#6be0b3]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-[#6be0b3]" />
                    <span className="text-[#e4eff0] font-medium text-base">Active Anomaly Targets</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {deploymentResult.anomalies.map((name, index) => (
                      <div key={index} className="flex items-center justify-between py-1 px-2 bg-[#10141c]/60 rounded border border-[#6be0b3]/10">
                        <span className="text-[#6be0b3] text-xs font-mono">{name}</span>
                        <Badge className="bg-[#6be0b3]/10 text-[#6be0b3] text-[10px]">
                          ● Monitoring
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#6be0b3]/10 p-4 rounded-lg border border-[#6be0b3]/20">
                  <h3 className="text-[#e4eff0] font-medium text-base mb-2">What happens next?</h3>
                  <div className="space-y-2 text-xs leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="bg-[#6be0b3] text-[#181e2a] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                      <span className="text-[#e4eff0]">Your satellite will monitor <strong>{deploymentResult.anomalies.length}</strong> weather or planetary anomalies in real time.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-[#6be0b3] text-[#181e2a] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                      <span className="text-[#e4eff0]">You'll receive alerts when new data is detected from these targets.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-[#6be0b3] text-[#181e2a] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                      <span className="text-[#e4eff0]">Review and classify new discoveries in the satellite or telescope interface to help the mission.</span>
                    </div>
                  </div>
                  <p className="text-[#6be0b3] text-xs mt-3 text-center border-t border-[#6be0b3]/10 pt-2">
                    �️ Redirecting to dashboard soon...
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => router.push('/structures/telescope')}
                    size="sm"
                    className="flex-1 bg-[#6be0b3] text-[#181e2a] hover:bg-[#78cce2] h-10 text-xs font-medium rounded-lg"
                  >
                    <Telescope className="h-4 w-4 mr-2" />
                    View Satellite
                  </Button>
                  <Button
                    onClick={handleConfirmationClose}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#6be0b3] text-[#6be0b3] hover:bg-[#6be0b3]/10 h-10 text-xs rounded-lg"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}