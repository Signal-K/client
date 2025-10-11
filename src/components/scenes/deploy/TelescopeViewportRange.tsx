'use client'

import { useState, useEffect, useCallback } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
import { TelescopeView } from "@/src/components/classification/telescope/telescope-view"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { generateSectorName, generateStars } from "@/src/components/classification/telescope/utils/sector-utils"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { CheckCircle, Telescope, X, Target, Info, Sun, ArrowLeft } from "lucide-react"
import DeployTelescopeSidebar from "./sub/TelescopeSidebar"
import DeployTelescopeMobileHeader from "./sub/TelescopeMobileHeader"
import DeployTelescopeOverlay from "./sub/TelescopeOverlay"
 
export interface DatabaseAnomaly {
  id: number
  content: string | null
  anomalytype: string | null
  avatar_url: string | null
  created_at: string
  configuration: any
  type?: string
  parentAnomaly: number | null
  anomalySet: string | null
};
type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly };

export type DeploymentType = "stellar" | "planetary";

function seededRandom1(seed: number, salt: number = 0) {
  let x = Math.sin(seed + salt) * 10000
  return x - Math.floor(x)
};

export default function DeployTelescopeViewport() {
  const supabase = useSupabaseClient()
  const session = useSession();

  const router = useRouter()

  // New deployment type selection state
  const [deploymentType, setDeploymentType] = useState<DeploymentType | null>(null)
  const [showTypeSelection, setShowTypeSelection] = useState(true)

  const [currentSector, setCurrentSector] = useState({ x: 0, y: 0 })
  const [tessAnomalies, setTessAnomalies] = useState<DatabaseAnomaly[]>([])
  const [sectorAnomalies, setSectorAnomalies] = useState<Anomaly[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [selectedSector, setSelectedSector] = useState<{ x: number; y: number } | null>(null)
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

  const generateAnomalyFromDB = useCallback((dbAnomaly: DatabaseAnomaly, sectorX: number, sectorY: number): LocalAnomaly => {
    const seed = dbAnomaly.id + sectorX * 1000 + sectorY

    // Determine type based on anomaly set
    let type: "planet" | "asteroid" | "sunspot" = "planet"
    let color = "#78cce2" // default blue for planets
    let shape: "circle" | "triangle" | "star" = "circle"
    let project = "planet-hunters" // default
    
    if (dbAnomaly.anomalySet === "telescope-minorPlanet") {
      type = "asteroid"
      color = "#f2c572" // gold for asteroids
      shape = "triangle"
      project = "daily-minor-planet"
    } else if (dbAnomaly.anomalySet === "diskDetective") {
      type = "sunspot" // Using sunspot as the closest stellar type
      color = "#ff6b6b" // red for stellar objects (disk detective)
      shape = "star"
      project = "disk-detective"
    } else if (dbAnomaly.anomalySet === "superwasp-variable" || dbAnomaly.anomalySet === "telescope-superwasp-variable") {
      type = "sunspot" // Using sunspot as the closest stellar type
      color = "#ff9966" // orange for variable stars (superwasp)
      shape = "star"
      project = "superwasp-variable"
    } else if (dbAnomaly.anomalySet === "telescope-tess") {
      project = "planet-hunters"
    } else if (dbAnomaly.anomalySet === "active-asteroids") {
      type = "asteroid"
      color = "#f2c572"
      shape = "triangle"
      project = "active-asteroids"
    }

    return {
      id: `db-${dbAnomaly.id}`,
      name: dbAnomaly.content || `${deploymentType === "stellar" ? "DSK" : "TESS"}-${String(dbAnomaly.id).padStart(3, "0")}`,
      x: seededRandom1(seed, 1) * 80 + 10,
      y: seededRandom1(seed, 2) * 80 + 10,
      brightness: seededRandom1(seed, 3) * 0.7 + 0.5,
      size: seededRandom1(seed, 4) * 0.8 + 0.6,
      pulseSpeed: seededRandom1(seed, 5) * 2 + 1,
      glowIntensity: seededRandom1(seed, 6) * 0.5 + 0.3,
      color,
      shape,
      sector: generateSectorName(sectorX, sectorY),
      discoveryDate: new Date().toLocaleDateString(),
      type,
      project,
      dbData: dbAnomaly,
    };
  }, [deploymentType])

  const fetchAnomalies = async () => {
    try {
      let setsToFetch: string[] = [];
      
      if (deploymentType === "stellar") {
        // Fetch stellar objects (diskDetective and superwasp-variable sets)
        setsToFetch = ['diskDetective', 'superwasp-variable', 'telescope-superwasp-variable'];
      } else if (deploymentType === "planetary") {
        // Always include these sets for planetary objects
        setsToFetch = ['telescope-tess', 'telescope-minorPlanet'];

        // Check if user has 2+ telescope-minorPlanet classifications
        let includeActiveAsteroids = false;
        if (session?.user?.id) {
          const { count, error: countError } = await supabase
            .from("classifications")
            .select("id", { count: "exact", head: true })
            .eq("author", session.user.id)
            .eq("classificationtype", "telescope-minorPlanet");
          if (!countError && typeof count === 'number' && count >= 2) {
            includeActiveAsteroids = true;
          }
        }
        if (includeActiveAsteroids) {
          setsToFetch.push('active-asteroids');
        }
      } else {
        return; // No deployment type selected yet
      }

      const { data, error } = await supabase
        .from("anomalies")
        .select("*")
        .in("anomalySet", setsToFetch);

      if (error) {
        console.error("Error fetching anomalies: ", error);
        return;
      };

      if (data) {
        console.log('Fetched anomalies by set:', {
          totalFetched: data.length,
          deploymentType,
          setsRequested: setsToFetch,
          bySet: setsToFetch.map(set => ({
            set,
            count: data.filter(a => a.anomalySet === set).length
          }))
        });
        
        // Debug the first few anomalies to see their structure
        console.log('Sample anomalies:', data.slice(0, 3).map(a => ({
          id: a.id,
          content: a.content,
          anomalySet: a.anomalySet,
          anomalytype: a.anomalytype
        })));
        
        setTessAnomalies(data);
      };
    } catch (error: any) {
      console.error("Unexpected error in fetchAnomalies: ", error);
    };
  };

  const checkDeployment = async () => {
    if (!session?.user?.id) return
    const userId = session.user.id
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: linkedAnomalies, error: linkedAnomaliesError } = await supabase
      .from("linked_anomalies")
      .select("*")
      .eq("automaton", "Telescope")
      .eq("author", userId)
      .gte("date", oneWeekAgo.toISOString())

    if (linkedAnomaliesError) {
      console.error("Error fetching linked anomalies:", linkedAnomaliesError)
      return
    }

    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("id, classification_id, classification:classifications(author)")
      .eq("author", userId)
      .gte("created_at", oneWeekAgo.toISOString())

    if (commentsError) {
      console.error("Error fetching comments:", commentsError)
      return
    }

    const validComments = (comments || []).filter(
      (c: any) => c.classification?.author && c.classification.author !== userId
    )

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("id, classification_id, classification:classifications(author)")
      .eq("user_id", userId)
      .eq("vote_type", "up")
      .gte("created_at", oneWeekAgo.toISOString())

    if (votesError) {
      console.error("Error fetching votes:", votesError)
      return
    }

    const validVotes = (votes || []).filter(
      (v: any) => v.classification?.author && v.classification.author !== userId
    )

    const linkedCount = linkedAnomalies?.length ?? 0
    const commentsCount = validComments.length
    const votesCount = validVotes.length
    const additionalDeploys = Math.floor(votesCount / 3) + commentsCount
    const totalAllowedDeploys = linkedCount + additionalDeploys
    const userCanRedeploy = totalAllowedDeploys > linkedCount

    console.log("Linked anomalies deployed this week:", linkedCount)
    console.log("Valid comments on others' classifications this week:", commentsCount)
    console.log(`Valid votes on others' classifications this week: ${votesCount} (counts as ${Math.floor(votesCount / 3)} deploys)`)
    console.log("Total allowed deploys:", totalAllowedDeploys)
    console.log("User can redeploy?", userCanRedeploy ? "YES" : "NO")

    if (linkedCount === 0) {
      setAlreadyDeployed(false)
      setDeploymentMessage(null)
    } else if (userCanRedeploy) {
      setAlreadyDeployed(false)
      setDeploymentMessage("You have earned additional deploys by interacting with the community this week!")
    } else {
      setAlreadyDeployed(true)
      setDeploymentMessage("Telescope has already been deployed this week. Recalibrate & search again next week.")
    }
  }

  const loadSector = useCallback((x: number, y: number) => {
    setStars(generateStars(x, y))
    const seed = x * 1000 + y
    const candidates = tessAnomalies
      .filter((_, i) => Math.floor(seededRandom1(seed + i) * 10) < 3)
      .slice(0, 8)
      .map(a => generateAnomalyFromDB(a, x, y))
    setSectorAnomalies(candidates)
  }, [tessAnomalies])

    useEffect(() => {
    if (!session) {
      return;
    };

    const fetchSkillProgress = async () => {
      const skillCounts: { [key: string]: number} = {
        telescope: 0,
        weather: 0,
      };

      const start = new Date("2000-01-01").toISOString();

      const queries = [
        supabase
          .from("classifications")
          .select("*", { count: "exact" })
          .eq("author", session.user.id)
          .in("classificationtype", ["planet", "telescope-minorPlanet"])
          .gte("created_at", start),
        supabase
          .from("classifications")
          .select("*", { count: "exact" })
          .eq("author", session.user.id)
          .in("classificationtype", ["cloud", "lidar-jovianVortexHunter"])
          .gte("created_at", start),
      ];

      const [telescopeRes, weatherRes] = await Promise.all(queries);

      if (!telescopeRes.error && telescopeRes.count !== null) {
        skillCounts.telescope = telescopeRes.count;
      }

      if (!weatherRes.error && weatherRes.count !== null) {
        skillCounts.weather = weatherRes.count;
      }

      setSkillProgress(skillCounts);
    };

    fetchSkillProgress();
  }, [session]);

  const handleDeploy = async () => {
    if (!session || !selectedSector || alreadyDeployed) {
      return;
    };

    setDeploying(true);
    const seed = selectedSector.x * 1000 + selectedSector.y;

    // Check for telescope upgrade
    let anomalyCount = 4; // Default count
    if (session?.user?.id) {
      const { data: researched } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", session.user.id)
        .eq("tech_type", "probereceptors");
      
      if (researched && researched.length > 0) {
        anomalyCount = 6; // Increased count with upgrade
        console.log('Telescope upgrade detected - increasing anomaly count to 6');
      }
    }

    // HARD CAP: Absolutely no more than 6 anomalies can be deployed, regardless of any other factors
    anomalyCount = Math.min(anomalyCount, 6);
    console.log('Final anomaly count after hard cap applied:', anomalyCount);

    let selectedAnomalies: DatabaseAnomaly[] = [];

    if (deploymentType === "stellar") {
      // For stellar objects - pick from both diskDetective and superwasp-variable sets
      const diskDetectiveObjects = tessAnomalies.filter(a => a.anomalySet === 'diskDetective');
      const superwaspObjects = tessAnomalies.filter(a => 
        a.anomalySet === 'superwasp-variable' || a.anomalySet === 'telescope-superwasp-variable'
      );
      
      console.log(`Using stellar object logic - diskDetective available: ${diskDetectiveObjects.length}, superwasp available: ${superwaspObjects.length}, deploying: ${anomalyCount}`);
      
      const shuffleAndPick = (arr: DatabaseAnomaly[], count: number) => {
        if (arr.length === 0) return [];
        const safeCount = Math.min(count, 6, arr.length);
        return arr
          .map((item, i) => ({ item, r: seededRandom1(seed, i) }))
          .sort((a, b) => a.r - b.r)
          .slice(0, safeCount)
          .map(obj => obj.item);
      };

      // Mix both types of stellar objects
      if (diskDetectiveObjects.length > 0 && superwaspObjects.length > 0) {
        console.log('Using mixed stellar logic - both disk detective and superwasp available');
        const diskPick = shuffleAndPick(diskDetectiveObjects, Math.ceil(anomalyCount / 2));
        const superwaspPick = shuffleAndPick(superwaspObjects, Math.ceil(anomalyCount / 2));
        
        const remainingPool = [...diskDetectiveObjects, ...superwaspObjects].filter(
          a => !diskPick.includes(a) && !superwaspPick.includes(a)
        );
        const remaining = shuffleAndPick(remainingPool, anomalyCount - diskPick.length - superwaspPick.length);
        
        selectedAnomalies = [...diskPick, ...superwaspPick, ...remaining];
      } else {
        // If only one type is available, use that
        const allStellarObjects = [...diskDetectiveObjects, ...superwaspObjects];
        selectedAnomalies = shuffleAndPick(allStellarObjects, anomalyCount);
      }
      
      // Final safety check
      selectedAnomalies = selectedAnomalies.slice(0, Math.min(anomalyCount, 6));
    } else if (deploymentType === "planetary") {
      // Existing planetary logic but with upgrade-aware count
      const planets = tessAnomalies.filter(a => a.anomalySet === 'telescope-tess');
      const asteroids = tessAnomalies.filter(a => a.anomalySet === 'telescope-minorPlanet');
      const activeAsteroids = tessAnomalies.filter(a => a.anomalySet === 'active-asteroids');

      console.log(`Available anomalies by type:`, {
        totalAnomalies: tessAnomalies.length,
        planets: planets.length,
        asteroids: asteroids.length,
        activeAsteroids: activeAsteroids.length,
        deployingCount: anomalyCount
      });

      const shuffleAndPick = (arr: DatabaseAnomaly[], count: number) => {
        if (arr.length === 0) return [];
        // Additional safety: never pick more than 6 total anomalies
        const safeCount = Math.min(count, 6, arr.length);
        return arr
          .map((item, i) => ({ item, r: seededRandom1(seed, i) }))
          .sort((a, b) => a.r - b.r)
          .slice(0, safeCount)
          .map(obj => obj.item);
      };

      let canSeeActiveAsteroids = activeAsteroids.length > 0;

      if (canSeeActiveAsteroids && activeAsteroids.length > 0) {
        console.log('Using active asteroid logic - 3 sets available');
        const planetPick = shuffleAndPick(planets, Math.ceil(anomalyCount / 3));
        const asteroidPick = shuffleAndPick(asteroids, Math.ceil(anomalyCount / 3));
        const activeAsteroidPick = shuffleAndPick(activeAsteroids, Math.ceil(anomalyCount / 3));
        
        const remainingPool = [...planets, ...asteroids, ...activeAsteroids].filter(
          a => !planetPick.includes(a) && !asteroidPick.includes(a) && !activeAsteroidPick.includes(a)
        );
        const remaining = shuffleAndPick(remainingPool, anomalyCount - planetPick.length - asteroidPick.length - activeAsteroidPick.length);
        
        selectedAnomalies = [...planetPick, ...asteroidPick, ...activeAsteroidPick, ...remaining];
      } else if (asteroids.length > 0) {
        console.log('Using 2-set logic - planets and asteroids');
        const planetPick = shuffleAndPick(planets, Math.ceil(anomalyCount / 2));
        const asteroidPick = shuffleAndPick(asteroids, Math.ceil(anomalyCount / 2));
        
        const remainingPool = [...planets, ...asteroids].filter(
          a => !planetPick.includes(a) && !asteroidPick.includes(a)
        );
        const remaining = shuffleAndPick(remainingPool, anomalyCount - planetPick.length - asteroidPick.length);
        
        selectedAnomalies = [...planetPick, ...asteroidPick, ...remaining];
      } else {
        console.log('Using planet-only logic');
        selectedAnomalies = shuffleAndPick(planets, anomalyCount);
      }
    }

    console.log('Selected anomalies for deployment:', selectedAnomalies.map(a => ({ id: a.id, set: a.anomalySet, content: a.content })));
    console.log('About to create', selectedAnomalies.length, 'linked_anomalies entries');

    if (selectedAnomalies.length === 0) {
      setDeploymentMessage("No anomalies found in selected sector")
      setDeploying(false);
      return;
    };

    // CRITICAL SAFETY CHECK: Absolutely ensure we never exceed the maximum allowed count
    if (selectedAnomalies.length > 6) {
      console.error(`CRITICAL: Selected ${selectedAnomalies.length} anomalies but maximum allowed is 6. Forcing trim to 6.`);
      selectedAnomalies = selectedAnomalies.slice(0, 6);
    }

    // Additional safety check against the calculated count
    if (selectedAnomalies.length > anomalyCount) {
      console.warn(`WARNING: Selected ${selectedAnomalies.length} anomalies but expected only ${anomalyCount}. Trimming to expected count.`);
      selectedAnomalies = selectedAnomalies.slice(0, anomalyCount);
    }

    console.log('Final anomalies to deploy after safety checks:', selectedAnomalies.length);

    const inserts = selectedAnomalies.map(anomaly =>
      supabase.from("linked_anomalies").insert({
        author: session.user.id,
        anomaly_id: anomaly.id,
        classification_id: null,
        automaton: "Telescope",
      })
    );

    const results = await Promise.all(inserts);
    const hasError = results.some(r => r.error);

    if (!hasError) {
      const anomalyNames = selectedAnomalies.map(a => a.content || `${deploymentType === "stellar" ? "DSK" : "TESS"}-${String(a.id).padStart(3, "0")}`);
      const sectorName = generateSectorName(selectedSector.x, selectedSector.y);
      
      setDeploymentResult({
        anomalies: anomalyNames,
        sectorName: sectorName
      });

      // Send deployment notification only to the current user
      try {
        const notificationTitle = "Telescope Deployed Successfully";
        const targetType = deploymentType === "stellar" ? "stellar objects" : "exoplanet candidates";
        const notificationBody = `${selectedAnomalies.length} ${targetType} discovered in ${sectorName}`;
        
        await fetch('/api/notify-my-discoveries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            customMessage: {
              title: notificationTitle,
              body: notificationBody,
              url: '/structures/telescope'
            }
          })
        });
        
        console.log('Deployment notification sent successfully to user:', session.user.id);
      } catch (notificationError) {
        console.error('Failed to send deployment notification:', notificationError);
      }

      setShowConfirmation(true);
    }

    setDeploymentMessage(
      hasError
        ? "Error deploying telescope. Please try again."
        : `Telescope deployed! ${selectedAnomalies.length} ${deploymentType} targets are now active.`
    );

    setAlreadyDeployed(!hasError);
    setDeploying(false);
  };

  const handleAnomalyClick = (a: Anomaly) => setFocusedAnomaly(a)
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY })
    setIsDragging(true)
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      setCurrentSector({
        x: currentSector.x - Math.sign(deltaX),
        y: currentSector.y - Math.sign(deltaY),
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }
  const handleMouseUp = () => setIsDragging(false)

  // D-Pad handlers
  const handleDPad = (dir: "up" | "down" | "left" | "right") => {
    setCurrentSector((prev) => {
      switch (dir) {
        case "up": return { x: prev.x, y: prev.y - 1 };
        case "down": return { x: prev.x, y: prev.y + 1 };
        case "left": return { x: prev.x - 1, y: prev.y };
        case "right": return { x: prev.x + 1, y: prev.y };
        default: return prev;
      }
    });
  }

  const handleBackToTypeSelection = () => {
    setDeploymentType(null)
    setShowTypeSelection(true)
    setTessAnomalies([])
    setSectorAnomalies([])
    setSelectedSector(null)
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    // Redirect to home after a brief delay to allow user to see the confirmation
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchAnomalies()
      await checkDeployment()
      setLoading(false)
    }
    if (deploymentType) {
      load()
    } else {
      // If no deployment type is selected, we're not loading data, so set loading to false
      setLoading(false)
    }
  }, [session, deploymentType])

  useEffect(() => {
    if (!loading && tessAnomalies.length > 0) {
      loadSector(currentSector.x, currentSector.y)
    }
  }, [currentSector, loadSector, loading, tessAnomalies])

  if (loading) {
    return (
      <div className="h-screen bg-[#002439] flex items-center justify-center">
        <div className="text-[#e4eff0] text-xl font-mono">Loading telescope data....</div>
      </div>
    )
  }

  // Deployment Type Selection Screen
  if (showTypeSelection && !deploymentType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#002439] to-[#001a2a] flex items-center justify-center p-2 sm:p-4 py-4 sm:py-8 overflow-y-auto">
        <Card className="bg-[#002439]/95 border-2 border-[#78cce2] max-w-5xl w-full shadow-2xl backdrop-blur-sm my-2">
          <CardHeader className="text-center pb-3 sm:pb-6 px-3 sm:px-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
              <Telescope className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-[#002439]" />
            </div>
            <CardTitle className="text-[#e4eff0] text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3">Choose Your Mission Focus</CardTitle>
            <CardDescription className="text-[#78cce2] text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-snug sm:leading-relaxed px-2">
              Configure your telescope to specialize in different cosmic objects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-6 px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Stellar Objects Option */}
              <Card className="bg-[#005066]/30 border-2 border-[#ff6b6b]/40 hover:border-[#ff6b6b]/80 transition-all duration-300 cursor-pointer group hover:bg-[#005066]/50" 
                    onClick={() => {setDeploymentType("stellar"); setShowTypeSelection(false)}}>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#ff6b6b] to-[#e55555] rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Sun className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <CardTitle className="text-[#e4eff0] text-base sm:text-lg md:text-xl flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-3">
                    <span>Stellar Objects</span>
                    <Badge className="bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/40 self-start sm:self-auto text-xs">
                      Advanced
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-[#ff6b6b] text-xs sm:text-sm">
                    Focus on stars and stellar phenomena
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                      <span>Circumstellar disks and debris</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                      <span>Protoplanetary structures</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                      <span>Stellar formation regions</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff6b6b] flex-shrink-0"></div>
                      <span>Binary star interactions</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#ff6b6b]/10 p-2 sm:p-3 rounded-lg border border-[#ff6b6b]/20 mt-2 sm:mt-3">
                    <div className="text-[#ff6b6b] text-xs font-medium mb-0.5 sm:mb-1">🔬 RESEARCH FOCUS</div>
                    <div className="text-[#e4eff0] text-xs leading-snug sm:leading-relaxed">
                      Help astronomers understand star formation and stellar system evolution.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Planetary/Asteroid Objects Option */}
              <Card className="bg-[#005066]/30 border-2 border-[#78cce2]/40 hover:border-[#78cce2]/80 transition-all duration-300 cursor-pointer group hover:bg-[#005066]/50"
                    onClick={() => {setDeploymentType("planetary"); setShowTypeSelection(false)}}>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-[#002439]" />
                  </div>
                  <CardTitle className="text-[#e4eff0] text-base sm:text-lg md:text-xl flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-3">
                    <span>Planetary Objects</span>
                    <Badge className="bg-[#78cce2]/20 text-[#78cce2] border border-[#78cce2]/40 self-start sm:self-auto text-xs">
                      Popular
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-[#78cce2] text-xs sm:text-sm">
                    Hunt for exoplanets and asteroids
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                      <span>Exoplanet transit detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                      <span>Minor planet identification</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                      <span>Active asteroid tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#e4eff0]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#78cce2] flex-shrink-0"></div>
                      <span>Planetary system analysis</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#78cce2]/10 p-2 sm:p-3 rounded-lg border border-[#78cce2]/20 mt-2 sm:mt-3">
                    <div className="text-[#78cce2] text-xs font-medium mb-0.5 sm:mb-1">🪐 DISCOVERY MISSION</div>
                    <div className="text-[#e4eff0] text-xs leading-snug sm:leading-relaxed">
                      Search for potentially habitable worlds and catalog small bodies.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-[#005066]/20 p-3 sm:p-4 md:p-6 rounded-xl border border-[#78cce2]/30">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#78cce2]/20 rounded-full flex items-center justify-center">
                  <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-[#78cce2]" />
                </div>
                <h3 className="text-[#e4eff0] text-sm sm:text-base md:text-lg font-medium">Mission Information</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
                <div className="text-center">
                  <div className="text-[#78cce2] font-medium mb-1 sm:mb-2">⏱️</div>
                  <div className="text-[#e4eff0] leading-tight">1 week monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-[#78cce2] font-medium mb-1 sm:mb-2">🎯</div>
                  <div className="text-[#e4eff0] leading-tight">4 selected objects</div>
                </div>
                <div className="text-center">
                  <div className="text-[#78cce2] font-medium mb-1 sm:mb-2">📊</div>
                  <div className="text-[#e4eff0] leading-tight">Real science</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2 sm:pt-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/20 text-sm h-9 sm:h-10"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#002439] relative overflow-hidden flex flex-col">
      {/* Top Sidebar controls - now as a top bar below navbar */}
      <div className="relative z-30">
        <DeployTelescopeSidebar
          tessAnomalies={tessAnomalies}
          sectorAnomalies={sectorAnomalies}
          selectedSector={selectedSector}
          alreadyDeployed={alreadyDeployed}
          deploying={deploying}
          deploymentMessage={deploymentMessage}
          onDeploy={handleDeploy}
          currentSector={currentSector}
          setCurrentSector={setCurrentSector}
          setSelectedSector={setSelectedSector}
          deploymentType={deploymentType}
          onBackToTypeSelection={handleBackToTypeSelection}
        />
      </div>

      {/* Telescope View - Full screen background */}
      <div className="absolute inset-0 z-0">
        <DeployTelescopeOverlay
          selectedSector={selectedSector}
          currentSector={currentSector}
          sectorAnomalies={sectorAnomalies}
        />
        <TelescopeView
          stars={stars}
          filteredAnomalies={sectorAnomalies}
          isDragging={isDragging}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleAnomalyClick={handleAnomalyClick}
          currentSectorName=""
          focusedAnomaly={focusedAnomaly}
          anomalies={sectorAnomalies}
        />
      </div>

      {/* Mission info panel - responsive bottom left positioning */}
      <div className="fixed bottom-2 sm:bottom-4 md:bottom-8 left-1 sm:left-2 md:left-8 z-40 p-1.5 sm:p-2 md:p-3 rounded bg-[#00304a]/80 border border-[#78cce2]/20 text-[#e4eff0] text-[10px] sm:text-xs font-mono w-[180px] sm:w-[240px] md:min-w-[260px] md:max-w-[340px] shadow-lg max-h-[30vh] overflow-y-auto">
        <span className="font-bold text-[#78cce2] block mb-1">Mission:</span>
        {deploymentType === "stellar" ? (
          <>
            <ul className="list-disc ml-3 sm:ml-4 md:ml-5 mt-0.5 sm:mt-1 space-y-0.5">
              <li className="text-[#ff6b6b] leading-tight">Stellar Objects</li>
              <li className="text-[10px] sm:text-xs leading-tight">Circumstellar disks</li>
              <li className="text-[10px] sm:text-xs leading-tight">Variable stars</li>
              <li className="text-[10px] sm:text-xs leading-tight hidden sm:list-item">Protoplanetary structures</li>
            </ul>
            <div className="mt-1 sm:mt-2 text-[#ff6b6b] text-[10px] sm:text-xs leading-tight">
              <span className="font-semibold">🔬</span> Advanced stellar analysis
            </div>
          </>
        ) : (
          <>
            <ul className="list-disc ml-3 sm:ml-4 md:ml-5 mt-0.5 sm:mt-1 space-y-0.5">
              <li className="text-[10px] sm:text-xs leading-tight">Planets (TESS)</li>
              <li className="text-[10px] sm:text-xs leading-tight">Asteroids</li>
              {tessAnomalies.some(a => a.anomalySet === 'active-asteroids') && (
                <li className="text-[10px] sm:text-xs leading-tight hidden sm:list-item">Active Asteroids</li>
              )}
            </ul>
            <div className="mt-1 sm:mt-2 text-[#78cce2] text-[10px] sm:text-xs leading-tight">
              <span className="font-semibold">🎯</span> Comprehensive discovery
            </div>
          </>
        )}
      </div>

      {/* D-Pad Controls - responsive bottom right positioning */}
      <div className="fixed bottom-2 sm:bottom-4 md:bottom-12 right-1 sm:right-2 md:right-12 z-40 flex flex-col items-center">
        <div className="bg-[#002439]/90 border border-[#78cce2]/30 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 flex flex-col items-center">
          <div className="grid grid-cols-3 grid-rows-3 gap-1 sm:gap-2 md:gap-4 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 mb-2 relative">
            <div></div>
            <button
              aria-label="Move Up"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
              onClick={() => handleDPad("up")}
            >↑</button>
            <div></div>
            <button
              aria-label="Move Left"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
              onClick={() => handleDPad("left")}
            >←</button>
            <div className="bg-[#005066] rounded-full border border-[#78cce2] sm:border-2 w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 flex items-center justify-center text-[10px] sm:text-sm md:text-xl text-[#78cce2] font-mono">{currentSector.x},{currentSector.y}</div>
            <button
              aria-label="Move Right"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
              onClick={() => handleDPad("right")}
            >→</button>
            <div></div>
            <button
              aria-label="Move Down"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-7 h-7 sm:w-10 sm:h-10 md:w-16 md:h-16 shadow-lg border border-[#005066] sm:border-2 flex items-center justify-center text-base sm:text-lg md:text-2xl font-bold transition"
              onClick={() => handleDPad("down")}
            >↓</button>
            <div></div>
          </div>
        </div>
      </div>

      {/* Sector Status Overlay - responsive positioning */}
      {sectorAnomalies.length === 0 && !loading && (
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-[#005066]/90 backdrop-blur-sm border border-[#78cce2]/30 rounded-lg px-2 sm:px-3 md:px-6 py-1.5 sm:py-2 md:py-3 max-w-[90vw] sm:max-w-[280px] md:max-w-none">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-[#78cce2]">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs md:text-sm leading-tight">No {deploymentType === "stellar" ? "stellar objects" : "exoplanet candidates"} in this sector • Navigate to explore</span>
          </div>
        </div>
      )}

      {/* Deployment Confirmation Dialog */}
      {showConfirmation && deploymentResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-[#002439] border-2 border-[#78cce2] max-w-2xl w-full mx-4 shadow-2xl">
            <CardHeader className="relative pb-4">
              <button
                onClick={handleConfirmationClose}
                className="absolute top-4 right-4 p-2 text-[#78cce2] hover:bg-[#78cce2]/20 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-[#002439]" />
                </div>
                <div>
                  <CardTitle className="text-[#e4eff0] text-2xl">Telescope Deployed Successfully!</CardTitle>
                  <CardDescription className="text-[#78cce2] text-base">
                    Your telescope is now monitoring sector {deploymentResult.sectorName}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#005066]/30 p-6 rounded-lg border border-[#78cce2]/30">
                <div className="flex items-center gap-3 mb-4">
                  <Telescope className="h-6 w-6 text-[#78cce2]" />
                  <span className="text-[#e4eff0] font-medium text-lg">Active Monitoring Targets</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deploymentResult.anomalies.map((name, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-[#002439]/50 rounded border border-[#78cce2]/20">
                      <span className="text-[#78cce2] text-sm font-mono">{name}</span>
                      <Badge className="bg-[#78cce2]/20 text-[#78cce2] text-xs">
                        ● Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#78cce2]/10 p-6 rounded-lg border border-[#78cce2]/30">
                <h3 className="text-[#e4eff0] font-medium text-lg mb-3">What happens next?</h3>
                <div className="space-y-3 text-sm leading-relaxed">
                  <div className="flex items-start gap-3">
                    <span className="bg-[#78cce2] text-[#002439] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <span className="text-[#e4eff0]">Your telescope will continuously monitor <strong>{deploymentResult.anomalies.length}</strong> potential exoplanet candidates</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-[#78cce2] text-[#002439] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <span className="text-[#e4eff0]">When planet transits are detected, you'll receive notifications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-[#78cce2] text-[#002439] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <span className="text-[#e4eff0]">Classify the discoveries in the telescope interface to help confirm exoplanets</span>
                  </div>
                </div>
                <p className="text-[#78cce2] text-sm mt-4 text-center border-t border-[#78cce2]/20 pt-3">
                  🚀 You'll be redirected to the main dashboard shortly...
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => router.push('/structures/telescope')}
                  size="lg"
                  className="flex-1 bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] h-12 text-base font-medium"
                >
                  <Telescope className="h-5 w-5 mr-3" />
                  View Telescope Interface
                </Button>
                <Button
                  onClick={handleConfirmationClose}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-[#78cce2] text-[#78cce2] hover:bg-[#78cce2]/20 h-12 text-base"
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