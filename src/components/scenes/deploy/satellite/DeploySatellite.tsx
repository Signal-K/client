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

type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly };

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
      <div className="min-h-screen h-screen w-screen flex flex-col bg-[#10141c]">
        {/* Top bar: controls and stats */}
        <div className="flex flex-row items-center justify-between px-6 py-3 bg-[#181e2a]/90 border-b border-[#232b3b] z-20">
          <div className="flex items-center gap-4">
            {/* InvestigationModeSelect moved to sidebar */}
          </div>
          {investigationMode === 'weather' && (
            <div className="flex gap-6 text-xs text-[#78cce2]">
              <span>Your Planets: <span className="font-bold">{userPlanetCount}</span></span>
              <span>Community: <span className="font-bold">{communityPlanetCount}</span></span>
            </div>
          )}
        </div>

  {/* Main map/viewport area */}
  <div className="flex-1 flex flex-row relative overflow-hidden h-full min-h-0">
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
                {(() => {
                  const planet = planetAnomalies[focusedPlanetIdx];
                  const content = planet.content || String(planet.id);
                  let hash = 0;
                  for (let i = 0; i < content.length; i++) hash = content.charCodeAt(i) + ((hash << 5) - hash);
                  const colors = [
                    ["#78cce2", "#e4eff0"],
                    ["#f2c572", "#ffe9b3"],
                    ["#b8e6b8", "#e4ffe4"],
                    ["#e2a6cc", "#fbe4f0"],
                    ["#b3b3e6", "#e4e4ff"],
                    ["#e4eff0", "#b8e6e6"],
                  ];
                  const shapes = ["circle", "ellipse", "hexagon", "diamond", "star", "pentagon"];
                  const textures = [null, "dots", "stripes", "rings"];
                  const colorIdx = Math.abs(hash) % colors.length;
                  const shapeIdx = Math.abs(Math.floor(hash / 10)) % shapes.length;
                  const textureIdx = Math.abs(Math.floor(hash / 100)) % textures.length;
                  const [mainColor, accentColor] = colors[colorIdx];
                  const shape = shapes[shapeIdx];
                  const texture = textures[textureIdx];
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
                  return (
                    <>
                      <SatellitePlanetSVG
                        planet={planet}
                        mainColor={mainColor}
                        accentColor={accentColor}
                        shape={shape}
                        texture={texture}
                        patternDefs={patternDefs}
                      >
                        <div className="absolute w-full text-center left-0 top-[60%] text-[#e4eff0] text-2xl font-mono font-bold tracking-wider drop-shadow-lg">
                          {planet.content || `TIC ${planet.id}`}
                        </div>
                        <SatelliteDeployButton onClick={handleDeploy} loading={deploying}>
                          Deploy Weather Satellite
                        </SatelliteDeployButton>
                      </SatellitePlanetSVG>
                      <SatelliteCloudIcons cloudAnomalies={cloudAnomalies} handleAnomalyClick={handleAnomalyClick} generateAnomalyFromDB={generateAnomalyFromDB} />
                    </>
                  );
                })()}
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
          {/* Desktop sidebar */}
          <div className="hidden md:flex flex-col h-full min-h-0 w-[370px] max-w-[370px] z-30 bg-[#10141c] border-l border-[#232b3b]">
            <SatelliteSidebar
              planetAnomalies={planetAnomalies}
              focusedPlanetIdx={focusedPlanetIdx}
              setFocusedPlanetIdx={setFocusedPlanetIdx}
              investigationMode={investigationMode}
              setInvestigationMode={setInvestigationMode}
              cloudAnomalies={cloudAnomalies}
              handleAnomalyClick={handleAnomalyClick}
              anomalyContent={anomalyContent}
              setAnomalyContent={setAnomalyContent}
              userPlanetCount={userPlanetCount}
              communityPlanetCount={communityPlanetCount}
            />
          </div>

          {/* Mobile controls: show a floating button to open controls, and a bottom sheet/modal */}
          <div className="md:hidden">
            <button
              className="fixed bottom-6 right-6 z-50 bg-[#181e2a] border border-[#78cce2] text-[#78cce2] rounded-full px-5 py-3 shadow-lg font-bold text-base flex items-center gap-2"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Controls"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#78cce2" fillOpacity="0.18"/><rect x="10" y="4" width="4" height="8" rx="2" fill="#78cce2"/><rect x="6" y="16" width="12" height="2" rx="1" fill="#f2c572"/></svg>
              Controls
            </button>
            {mobileSidebarOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end">
                <div className="bg-gradient-to-br from-[#181e2a] to-[#10141c] border-t border-[#232b3b] rounded-t-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#78cce2] text-lg font-bold">Controls</span>
                    <button onClick={() => setMobileSidebarOpen(false)} className="text-[#78cce2] text-xl font-bold">×</button>
                  </div>
                  {/* Investigation mode toggle */}
                  <div className="mb-4">
                    <InvestigationModeSelect value={investigationMode} onChange={setInvestigationMode} />
                  </div>
                  {/* Planets list */}
                  <div className="mb-4">
                    <div className="text-[#f2c572] text-base font-bold mb-2">Planets</div>
                    <div className="space-y-2">
                      {planetAnomalies.length > 0 ? planetAnomalies.map((p, i) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition border border-transparent ${i === focusedPlanetIdx ? (investigationMode === 'planets' ? 'bg-[#f2c572]/20 border-[#f2c572]' : 'bg-[#78cce2]/20 border-[#78cce2]') : 'hover:bg-[#232b3b]'}`}
                          onClick={() => { setFocusedPlanetIdx(i); setMobileSidebarOpen(false); }}
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
                  {/* Weather anomalies (if in weather mode) */}
                  {investigationMode === 'weather' && (
                    <div className="mb-4">
                      <div className="text-[#78cce2] text-base font-bold mb-2">Weather Anomalies</div>
                      <div className="space-y-2">
                        {cloudAnomalies.length > 0 ? cloudAnomalies.map((a, i) => (
                          <div
                            key={a.id}
                            className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-[#232b3b] border border-[#78cce2]/30"
                            onClick={() => {
                              handleAnomalyClick(generateAnomalyFromDB(a, planetAnomalies[focusedPlanetIdx]?.id || 0, 0));
                              setMobileSidebarOpen(false);
                            }}
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
            )}
          </div>
          {/* Bottom description box in main viewport */}
          <div className="pointer-events-none select-none absolute left-1/2 bottom-8 transform -translate-x-1/2 z-30">
            <div className="bg-[#00304a]/90 border border-[#78cce2]/20 rounded px-5 py-3 text-xs md:text-sm text-[#e4eff0] font-mono shadow-lg max-w-md text-center">
              {investigationMode === 'weather' ? (
                <>
                  <span className="font-bold text-[#78cce2]">Weather Investigation:</span> Deploy satellites to planets to search for clouds and weather events. Select a planet and click "Deploy Weather Satellite" to begin atmospheric analysis.
                </>
              ) : (
                <>
                  <span className="font-bold text-[#78cce2]">Planet Investigation:</span> Deploy satellites to confirm planetary properties and monitor for new discoveries. Select a planet and click "Deploy Weather Satellite" to start your mission.
                </>
              )}
            </div>
          </div>

          {/* D-pad and sector/planet info: bottom left, floating, responsive */}
          <SatelliteDPad
            planetAnomalies={planetAnomalies}
            focusedPlanetIdx={focusedPlanetIdx}
            handleDPad={handleDPad}
          />

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

        {/* Success confirmation overlay */}
        {showConfirmation && deploymentResult && (
          <SatelliteDeployConfirmation
            deploymentResult={deploymentResult}
            onClose={handleConfirmationClose}
            onTelescope={() => router.push('/structures/telescope')}
          />
        )}
      </div>
  )
}