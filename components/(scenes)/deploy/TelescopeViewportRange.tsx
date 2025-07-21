'use client'

import { useState, useEffect, useCallback } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { TelescopeView } from "@/components/Structures/Telescope/telescope-view"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { generateSectorName, generateStars } from "@/utils/Structures/Telescope/sector-utils"
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
}
type LocalAnomaly = Anomaly & { dbData: DatabaseAnomaly }

function seededRandom1(seed: number, salt: number = 0) {
  let x = Math.sin(seed + salt) * 10000
  return x - Math.floor(x)
}

function generateAnomalyFromDB(dbAnomaly: DatabaseAnomaly, sectorX: number, sectorY: number): LocalAnomaly {
  const seed = dbAnomaly.id + sectorX * 1000 + sectorY

  // Determine type
  let type: "planet" | "asteroid" = "planet"
  if (dbAnomaly.anomalySet === "telescope-minorPlanet") type = "asteroid"

  return {
    id: `db-${dbAnomaly.id}`,
    name: dbAnomaly.content || `TESS-${String(dbAnomaly.id).padStart(3, "0")}`,
    x: seededRandom1(seed, 1) * 80 + 10,
    y: seededRandom1(seed, 2) * 80 + 10,
    brightness: seededRandom1(seed, 3) * 0.7 + 0.5,
    size: seededRandom1(seed, 4) * 0.8 + 0.6,
    pulseSpeed: seededRandom1(seed, 5) * 2 + 1,
    glowIntensity: seededRandom1(seed, 6) * 0.5 + 0.3,
    color: type === "planet" ? "#78cce2" : "#f2c572", // blue for planet, gold for minor-planet
    shape: type === "planet" ? "circle" : "triangle",
    sector: generateSectorName(sectorX, sectorY),
    discoveryDate: new Date().toLocaleDateString(),
    type,
    project: "planet-hunters",
    dbData: dbAnomaly,
  }
};

export default function DeployTelescopeViewport() {
  const supabase = useSupabaseClient()
  const session = useSession()

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

  const fetchTessAnomalies = async () => {
    try {
      const setsToFetch = ['telescope-tess']

      if (skillProgress.telescope >= 4) {
        setsToFetch.push("telescope-minorPlanet");
      };

      const { data, error } = await supabase
        .from("anomalies")
        .select("*")
        .in("anomalySet", setsToFetch);

      if (error) {
        console.error("Error fetching anomalies: ", error);
        return;
      };

      if (data) {
        setTessAnomalies(data);
      };
    } catch (error: any) {
      console.error("Unexpected error in fetchTessAnomalies: ", error);
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

    // Separate two anomaly sets
    const planets = tessAnomalies.filter(a => a.anomalySet === 'telescope-tess');
    const asteroids = tessAnomalies.filter(a => a.anomalySet === 'telescope-minorPlanet');

    const shuffleAndPick = (arr: DatabaseAnomaly[], count: number) =>
      arr
        .map((item, i) => ({ item, r: seededRandom1(seed, i) }))
        .sort((a, b) => a.r - b.r)
        .slice(0, count)
        .map(obj => obj.item);

    let selectedAnomalies: DatabaseAnomaly[] = [];

    if (skillProgress.telescope >= 4) {
      const planetPick = shuffleAndPick(planets, 1);
      const asteroidPick = shuffleAndPick(asteroids, 1);
      const remaining = shuffleAndPick([...planets, ...asteroids].filter(a => !planetPick.includes(a) && !asteroidPick.includes(a)), 2);

      selectedAnomalies = [...planetPick, ...asteroidPick, ...remaining];
    } else {
      selectedAnomalies = shuffleAndPick(planets, 4); // If the user hasn't unlocked asteroid/DMP project yet
    };

    if (selectedAnomalies.length === 0) {
      setDeploymentMessage("No anomalies found in selected sector")
      setDeploying(false);
      return;
    };

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

    setDeploymentMessage(
      hasError
        ? "Error deploying telescope. Please try again."
        : `Telescope deployed! ${selectedAnomalies.length} targets are now active.`
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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await fetchTessAnomalies()
      await checkDeployment()
      setLoading(false)
    }
    load()
  }, [session])

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

  return (
  <div className="h-screen bg-[#002439] relative overflow-hidden">
  {/* Telescope View */}
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

  {/* Mobile Header */}
  <div className="relative z-20 lg:hidden">
    <DeployTelescopeMobileHeader
      sectorAnomalies={sectorAnomalies}
      selectedSector={selectedSector}
      alreadyDeployed={alreadyDeployed}
      deploying={deploying}
      onDeploy={handleDeploy}
    />
  </div>

  {/* Sidebar Controls */}
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
    />
  </div>
</div>
)
}