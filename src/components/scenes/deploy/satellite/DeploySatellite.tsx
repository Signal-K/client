"use client"

import React, { useEffect, useState } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { DatabaseAnomaly } from "../Telescope/TelescopeUtils"
import { generateSectorName, generateStars } from "@/src/components/classification/telescope/utils/sector-utils"
import SatelliteDeployConfirmation from "./Deploy/SatelliteDeployConfirmation";
import { useState as useReactState } from "react";
import PlanetFocusView from './PlanetFocusView';
import DeploySidebar from './DeploySidebar';
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly };
export type EnrichedDatabaseAnomaly = DatabaseAnomaly & {
  stats?: {
    radius: number | string;
    density: number | string;
    temperature: number | string;
    mass: number | string;
    type: string;
    metallicity?: string | null;
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
  const { isDark } = UseDarkMode();

  // Investigation mode: 'weather' or 'planets'
  const [investigationMode, setInvestigationMode] = useState<'weather' | 'p-4' | 'planets'>('weather');

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
  const [hasStellarMetallicitySkill, setHasStellarMetallicitySkill] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<{
    anomalies: string[]
    sectorName: string
  } | null>(null);
  const [deploymentWarning, setDeploymentWarning] = useState<string | null>(null);
  const [isDeployDisabled, setIsDeployDisabled] = useState(false);
  const [isFastDeployEnabled, setIsFastDeployEnabled] = useState<boolean | null>(null);
  const [waterDiscoveryStatus, setWaterDiscoveryStatus] = useState<{
    hasCloudClassifications: boolean;
    hasValidStats: boolean;
    canDiscoverMinerals: boolean;
  }>({
    hasCloudClassifications: false,
    hasValidStats: false,
    canDiscoverMinerals: false,
  });

  // Validate deployment criteria
  useEffect(() => {
    if (investigationMode === 'p-4') {
      const planet = planetAnomalies[focusedPlanetIdx];
      if (planet && (!planet.stats || planet.stats.radius === "N/A" || !planet.stats.radius)) {
        setDeploymentWarning("Wind Survey requires a planet with a known radius. Please select another planet or inspect it to determine its radius.");
        setIsDeployDisabled(true);
      } else {
        setDeploymentWarning(null);
        setIsDeployDisabled(false);
      }
    } else {
      setDeploymentWarning(null);
      setIsDeployDisabled(false);
    }
  }, [investigationMode, focusedPlanetIdx, planetAnomalies]);

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

  // Check if user has fast deploy enabled (no classifications made)
  const checkFastDeployStatus = async () => {
    if (!session?.user?.id) {
      setIsFastDeployEnabled(false);
      return false;
    }
    
    try {
      const { count: userClassificationCount } = await supabase
        .from('classifications')
        .select('id', { count: 'exact', head: true })
        .eq('author', session.user.id);

      const isFastDeploy = (userClassificationCount || 0) === 0;
      setIsFastDeployEnabled(isFastDeploy);
      return isFastDeploy;
    } catch (error) {
      console.error('Error checking fast deploy status:', error);
      setIsFastDeployEnabled(false);
      return false;
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
      fetchPlanetStats(planet.id).then(async (stats) => {
        // Start with default N/A stats if none exist
        let finalStats = stats || {
          radius: "N/A",
          density: "N/A",
          temperature: "N/A",
          mass: "N/A",
          type: "N/A",
        };

        // If user has metallicity skill, fetch metallicity from local ExoFOP CSV via API
        console.log('🔍 Skill check:', hasStellarMetallicitySkill, 'Planet:', planet.id, planet.content);
        if (hasStellarMetallicitySkill) {
          try {
            const content = String(planet.content || '');
            let ticCandidate = '';
            const ticMatch = content.match(/TIC\s*(\d+)/i) || content.match(/^(\d{6,})$/);
            if (ticMatch) ticCandidate = ticMatch[1];
            if (!ticCandidate) ticCandidate = String(planet.id);

            console.log('🔍 Fetching metallicity for TIC:', ticCandidate);
            const res = await fetch(`/api/exofop?tic=${encodeURIComponent(ticCandidate)}`);
            if (res.ok) {
              const body = await res.json();
              console.log('🔍 API result:', body);
              if (body?.result?.metallicity) {
                // Add metallicity to stats before setting
                finalStats = {
                  ...finalStats,
                  metallicity: body.result.metallicity,
                } as any;
                console.log('✅ Final stats with metallicity:', finalStats);
              }
            }
          } catch (err) {
            console.warn('[Metallicity] Failed to fetch:', err);
          }
        }

        // Set planet stats once with all data (including metallicity if available)
        // Only update if stats actually changed to avoid triggering the surrounding effect repeatedly.
        setPlanetAnomalies((prev) => {
          const updated = [...prev];
          const existing = updated[focusedPlanetIdx];
          const existingStats = existing?.stats;

          const statsChanged = JSON.stringify(existingStats) !== JSON.stringify(finalStats);

          if (!existing || statsChanged) {
            updated[focusedPlanetIdx] = { ...existing, stats: finalStats };
            console.log('🔍 Updated planet anomalies[' + focusedPlanetIdx + ']:', updated[focusedPlanetIdx].stats);
            return updated;
          }

          // No change — return previous array reference to avoid re-renders
          console.log('🔍 Skipping planet anomalies update; stats unchanged.');
          return prev;
        });
      });
    } else {
      setCloudAnomalies([]);
      setStars([]);
    }
  }, [planetAnomalies, focusedPlanetIdx, userCloudClassifications, hasStellarMetallicitySkill]);

  // Check for water/mineral discoveries from cloud classifications
  useEffect(() => {
    const checkWaterDiscovery = async () => {
      console.log('[checkWaterDiscovery] Starting check...');
      
      if (!session?.user?.id || planetAnomalies.length === 0) {
        console.log('[checkWaterDiscovery] Early return - no session or planets');
        setWaterDiscoveryStatus({
          hasCloudClassifications: false,
          hasValidStats: false,
          canDiscoverMinerals: false,
        });
        return;
      }

      const focusedPlanet = planetAnomalies[focusedPlanetIdx];
      if (!focusedPlanet) {
        console.log('[checkWaterDiscovery] Early return - no focused planet');
        setWaterDiscoveryStatus({
          hasCloudClassifications: false,
          hasValidStats: false,
          canDiscoverMinerals: false,
        });
        return;
      }
      
      console.log('[checkWaterDiscovery] Focused planet:', focusedPlanet.id, 'Stats:', focusedPlanet.stats);

      // Check if planet has stats (density, radius, mass are not null/N/A)
      const hasValidStats = focusedPlanet.stats && 
        focusedPlanet.stats.density && focusedPlanet.stats.density !== "N/A" &&
        focusedPlanet.stats.radius && focusedPlanet.stats.radius !== "N/A" &&
        focusedPlanet.stats.mass && focusedPlanet.stats.mass !== "N/A";

      // Find the classification ID for this planet
      try {
        const { data: planetClassifications, error: planetClassError } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("author", session.user.id)
          .eq("anomaly", focusedPlanet.id)
          .eq("classificationtype", "planet");

        console.log('[checkWaterDiscovery] Planet classifications query:', {
          error: planetClassError,
          count: planetClassifications?.length || 0,
          userId: session.user.id,
          anomalyId: focusedPlanet.id
        });

        if (planetClassError || !planetClassifications || planetClassifications.length === 0) {
          console.log('[checkWaterDiscovery] Early return - no planet classifications found');
          setWaterDiscoveryStatus({
            hasCloudClassifications: false,
            hasValidStats: !!hasValidStats,
            canDiscoverMinerals: false,
          });
          return;
        }

        // Get all planet classification IDs for this planet
        const planetClassificationIds = planetClassifications.map(c => c.id);
        console.log('[checkWaterDiscovery] All planet classification IDs:', planetClassificationIds);

        // Check for cloud classifications that point to this planet
        const { data: cloudClassifications, error: cloudError } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("author", session.user.id)
          .eq("classificationtype", "cloud");

        if (cloudError || !cloudClassifications || cloudClassifications.length === 0) {
          setWaterDiscoveryStatus({
            hasCloudClassifications: false,
            hasValidStats: !!hasValidStats,
            canDiscoverMinerals: false,
          });
          return;
        }

        // Check if any cloud classification has parentPlanet matching ANY of this planet's classification IDs
        const hasCloudForPlanet = cloudClassifications.some(
          (cloudClass: any) => {
            if (!cloudClass.classificationConfiguration) return false;
            
            // Parse config if it's a string
            let config;
            try {
              config = typeof cloudClass.classificationConfiguration === 'string'
                ? JSON.parse(cloudClass.classificationConfiguration)
                : cloudClass.classificationConfiguration;
            } catch (e) {
              console.error('[checkWaterDiscovery] Failed to parse cloud config:', e);
              return false;
            }
            
            // Check if parentPlanet matches ANY of the planet classification IDs
            return config?.parentPlanet && planetClassificationIds.includes(config.parentPlanet);
          }
        );

        console.log('[checkWaterDiscovery] Planet classification IDs:', planetClassificationIds);
        console.log('[checkWaterDiscovery] Cloud classifications count:', cloudClassifications.length);
        console.log('[checkWaterDiscovery] Has cloud for planet:', hasCloudForPlanet);

        setWaterDiscoveryStatus({
          hasCloudClassifications: hasCloudForPlanet,
          hasValidStats: !!hasValidStats,
          canDiscoverMinerals: hasCloudForPlanet && !!hasValidStats,
        });
      } catch (error) {
        console.error("Error checking water discovery:", error);
        setWaterDiscoveryStatus({
          hasCloudClassifications: false,
          hasValidStats: !!hasValidStats,
          canDiscoverMinerals: false,
        });
      }
    };

    checkWaterDiscovery();
  }, [session, planetAnomalies, focusedPlanetIdx, supabase]);

  // Fetch anomalies and check deployment on mount/session change
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPlanetAnomalies();
      await fetchUserCloudClassificationCount();
      await checkFastDeployStatus();
      await checkStellarMetallicitySkill();
      await checkDeployment();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const checkStellarMetallicitySkill = async () => {
    if (!session?.user?.id) {
      setHasStellarMetallicitySkill(false);
      return false;
    }
    try {
      const { data: researched } = await supabase
        .from('researched')
        .select('tech_type')
        .eq('user_id', session.user.id)
        .eq('tech_type', 'spectroscopy');
      const has = !!(researched && researched.length > 0);
      setHasStellarMetallicitySkill(has);
      return has;
    } catch (err) {
      setHasStellarMetallicitySkill(false);
      return false;
    }
  };

  // Reset focus if planet list changes
  useEffect(() => {
    setFocusedPlanetIdx(0);
  }, [planetAnomalies.length]);

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const handleDeploy = async () => {
    console.log("handleDeploy called");
    setDeploying(true);
    
    try {
      if (!session?.user?.id) {
        console.log("No user session");
        return;
      }
      const userId = session.user.id;
      console.log("User ID:", userId);
      
      // Check if user has fast deploy enabled (no classifications made)
      const { count: userClassificationCount } = await supabase
        .from('classifications')
        .select('id', { count: 'exact', head: true })
        .eq('author', userId);

      const isFastDeployEnabled = (userClassificationCount || 0) === 0;
      console.log("Fast deploy enabled:", isFastDeployEnabled);
      
      // Set deployment date - one day prior for fast deploy, current time otherwise
      const now = new Date();
      const deploymentDate = isFastDeployEnabled 
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
        : now;
      const deploymentDateISO = deploymentDate.toISOString();
      
      console.log("Deployment date:", deploymentDateISO, isFastDeployEnabled ? "(fast deploy)" : "(normal)");
      
      // Check for satellite upgrade
      let anomalyCount = 4; // Default count
      const { data: researched } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", userId)
        .eq("tech_type", "satellitecount");
      
      if (researched && researched.length > 0) {
        anomalyCount = 6; // Increased count with upgrade
        console.log('Satellite upgrade detected - increasing anomaly count to 6');
      }

      let rows = [];
      const planet = planetAnomalies[focusedPlanetIdx];
      console.log("Planet:", planet, "Investigation mode:", investigationMode, "Anomaly count:", anomalyCount);
      if (!planet) {
        console.log("No planet selected");
        return;
      }
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
        date: deploymentDateISO,
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

      // Fetch cloud anomalies from ANYWHERE in the correct sets (upgraded count)
      const { data: allClouds, error: cloudErr } = await supabase
        .from('anomalies')
        .select('id')
        .in('anomalySet', anomalySets);

      if (cloudErr) {
        alert('Failed to fetch cloud anomalies: ' + cloudErr.message);
        return;
      }
      const shuffledClouds = (allClouds || []).sort(() => 0.5 - Math.random());
      shuffledClouds.slice(0, anomalyCount).forEach((cloud) => {
        rows.push({
          author: userId,
          anomaly_id: cloud.id,
          classification_id: classificationId || null,
          date: deploymentDateISO,
          automaton: 'WeatherSatellite',
          unlocked: false,
          unlock_time: null,
        });
      });
    } else if (investigationMode === 'p-4') {
      // Find classification for this user/planet
      const { data: classifications } = await supabase
        .from('classifications')
        .select('id')
        .eq('author', userId)
        .eq('anomaly', planet.id)
        .eq('classificationtype', 'planet');
      const classificationId = classifications && classifications[0]?.id;

      // Fetch wind survey anomalies (upgraded count)
      const { data: windAnomalies, error: windErr } = await supabase
        .from('anomalies')
        .select('id')
        .eq('anomalySet', 'satellite-planetFour');

      if (windErr) {
        alert('Failed to fetch wind survey anomalies: ' + windErr.message);
        return;
      };

      const shuffledAnomalies = (windAnomalies || []).sort(() => 0.5 - Math.random());
      shuffledAnomalies.slice(0, anomalyCount).forEach((anomaly) => {
        rows.push({
          author: userId,
          anomaly_id: anomaly.id,
          classification_id: classificationId || null,
          date: deploymentDateISO,
          automaton: 'WeatherSatellite',
          unlocked: false,
          unlock_time: null,
        });
      });
    }
    console.log("Rows to insert:", rows);
    if (rows.length > 0) {
      console.log("Attempting to insert rows into linked_anomalies");
      const { error, data } = await supabase.from('linked_anomalies').insert(rows);
      console.log("Insert result:", { error, data });
      if (!error) {
        console.log("Deployment successful");
        setShowConfirmation(true);
        setDeploymentResult({
          anomalies: rows.map(r => String(r.anomaly_id)),
          sectorName: planet.content || `TIC ${planet.id}`,
        });
      } else {
        console.error("Deployment failed:", error);
        alert('Deployment failed: ' + error.message);
      }
    } else {
      console.log("No rows to insert");
    }
    } catch (error) {
      console.error("Error in handleDeploy:", error);
      alert("An error occurred during deployment. Please try again.");
    } finally {
      setDeploying(false);
    }
  };

    // Fetch planet stats from classifications
    const fetchPlanetStats = async (planetId: number) => {
      try {
        const { data: classifications, error } = await supabase
          .from("classifications")
          .select("content, anomaly, classificationtype, classificationConfiguration")
          .eq("anomaly", planetId)
          .in("classificationtype", ["planet-inspection", "planet"]);

        if (error) {
          console.error("Error fetching planet stats:", error);
          return null;
        }

        console.log(`[fetchPlanetStats] Planet ${planetId}:`, classifications);

        if (classifications && classifications.length > 0) {
          // First try to find a planet survey classification (from satellite mission)
          // Look for one that has planet_mass, planet_radius, planet_temp in config
          const planetSurvey = classifications.find(c => {
            if (c.classificationtype !== "planet") return false;
            if (!c.classificationConfiguration) return false;
            
            let config;
            try {
              config = typeof c.classificationConfiguration === 'string' 
                ? JSON.parse(c.classificationConfiguration)
                : c.classificationConfiguration;
            } catch (e) {
              return false;
            }
            
            // Check if this config has planet survey data (not other classification data)
            return config.planet_mass !== undefined || config.planet_radius !== undefined || config.planet_temp !== undefined;
          });
          
          console.log('[fetchPlanetStats] Planet survey found:', planetSurvey);
          
          if (planetSurvey && planetSurvey.classificationConfiguration) {
            let config;
            try {
              config = typeof planetSurvey.classificationConfiguration === 'string' 
                ? JSON.parse(planetSurvey.classificationConfiguration)
                : planetSurvey.classificationConfiguration;
            } catch (e) {
              console.error('[fetchPlanetStats] Failed to parse config:', e);
              config = planetSurvey.classificationConfiguration;
            }
            
            console.log('[fetchPlanetStats] Parsed config:', config);
            
            return {
              radius: config.planet_radius?.toFixed(2) || config.stellar_radius || "N/A",
              density: config.planet_density?.toFixed(7) || "N/A",
              temperature: config.planet_temp?.toFixed(0) || config.stellar_temp || "N/A",
              mass: config.planet_mass?.toFixed(2) || config.stellar_mass || "N/A",
              type: config.planet_type || "N/A",
            };
          }
          
          // Fall back to planet-inspection classification
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
      <div className={`min-h-screen h-screen w-screen flex flex-col ${
        isDark 
          ? "bg-[#10141c]" 
          : "bg-gradient-to-br from-[#8ba3d1] via-[#9bb3e0] to-[#7a94c7]"
      }`}>
        {/* Top bar: controls and stats - HIDDEN to fix layout */}
        {/* <div className={`flex flex-row items-center justify-between px-6 py-3 border-b z-20 ${
          isDark 
            ? "bg-[#181e2a]/90 border-[#232b3b]" 
            : "bg-gradient-to-r from-[#b8c5e0]/90 to-[#a5b8d1]/90 backdrop-blur-sm border-[#7a94c7]"
        }`}>
          <div className="flex items-center gap-4">
          </div>
          {investigationMode === 'weather' && (
            <div className={`flex flex-col items-center gap-2 text-xs ${
              isDark ? 'text-[#78cce2]' : 'text-slate-700'
            }`}>
              <div className="flex gap-6">
                <span>Your Planets: <span className="font-bold">{userPlanetCount}</span></span>
                <span>Community: <span className="font-bold">{communityPlanetCount}</span></span>
              </div>
              <div>
                <p>{cloudInvestigationDescription}</p>
              </div>
            </div>
          )}
        </div> */}

      {/* Main map/viewport area */}
      <div className="flex-1 flex flex-row relative overflow-hidden h-full min-h-0 pb-0 md:pb-0">
          {/* Main viewport content (planets/clouds) */}
          <div className="relative flex-1 flex items-center justify-center z-10 pb-48 md:pb-0">
            <PlanetFocusView
              planet={planetAnomalies[focusedPlanetIdx] || null}
              onNext={() => setFocusedPlanetIdx((prev) => Math.min(planetAnomalies.length - 1, prev + 1))}
              onPrev={() => setFocusedPlanetIdx((prev) => Math.max(0, prev - 1))}
              isFirst={focusedPlanetIdx === 0}
              isLast={focusedPlanetIdx === planetAnomalies.length - 1}
              isDarkMode={isDark}
            />
          </div>

          {/* Right-side info panel (sidebar) */}
          <div className={`hidden md:flex flex-col h-full min-h-0 w-[370px] max-w-[370px] z-30 border-l ${
            isDark 
              ? "bg-[#10141c] border-[#232b3b]" 
              : "bg-white border-[#b0c4de]"
          }`}>
            <DeploySidebar
              investigationMode={investigationMode}
              setInvestigationMode={setInvestigationMode}
              duration={7} // Example default duration
              setDuration={(days) => console.log('Set duration:', days)}
              onDeploy={handleDeploy}
              isDeploying={deploying}
              cloudInvestigationDescription={cloudInvestigationDescription}
              userCloudClassifications={userCloudClassifications}
              isDeployDisabled={isDeployDisabled}
              deploymentWarning={deploymentWarning}
              isFastDeployEnabled={isFastDeployEnabled}
              isDarkMode={isDark}
              waterDiscoveryStatus={waterDiscoveryStatus}
            />
          </div>
        </div>

        {/* Mobile controls - Fixed bottom positioning */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
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
            isDeployDisabled={isDeployDisabled}
            deploymentWarning={deploymentWarning}
            isFastDeployEnabled={isFastDeployEnabled}
            isDarkMode={isDark}
            waterDiscoveryStatus={waterDiscoveryStatus}
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
            isDarkTheme={isDark}
            showAllAnomalies={false}
          />
        </div>

        {/* Stats display for focused planet */}
        {/* <div className="absolute top-4 right-4 bg-[#181e2a] p-4 rounded-lg shadow-lg z-50">
          <div className="text-xs text-[#78cce2]">
            <h3 className="font-bold text-sm mb-2">Planet Stats</h3>
            <p>Temperature: {planetAnomalies[focusedPlanetIdx]?.stats?.temperature || "N/A"} K</p>
            <p>Radius: {planetAnomalies[focusedPlanetIdx]?.stats?.radius || "N/A"} R☉</p>
            <p>Mass: {planetAnomalies[focusedPlanetIdx]?.stats?.mass || "N/A"} M☉</p>
          </div>
        </div> */}
      </div>
  );
};