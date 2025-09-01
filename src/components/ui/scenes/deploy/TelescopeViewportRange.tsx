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
import { CheckCircle, Telescope, X, Target } from "lucide-react"
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
  const router = useRouter()

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
  } | null>(null)

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

    if (!hasError) {
      // Prepare deployment result data
      const anomalyNames = selectedAnomalies.map(a => a.content || `TESS-${String(a.id).padStart(3, "0")}`);
      const sectorName = generateSectorName(selectedSector.x, selectedSector.y);
      
      setDeploymentResult({
        anomalies: anomalyNames,
        sectorName: sectorName
      });

      // Send notification about the deployment
      try {
        const notificationTitle = "Telescope Deployed Successfully";
        const notificationBody = `New targets discovered in ${sectorName}: ${anomalyNames.join(", ")}`;
        
        await fetch('/api/send-test-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: notificationTitle,
            message: notificationBody,
            url: '/structures/telescope'
          })
        });
        
        console.log('Deployment notification sent successfully');
      } catch (notificationError) {
        console.error('Failed to send deployment notification:', notificationError);
        // Don't let notification failure affect the deployment success
      }

      // Show confirmation popup
      setShowConfirmation(true);
    }

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
      {/* Telescope View - Full screen background with proper padding for header */}
      <div className="absolute inset-0 z-0" style={{ paddingTop: '64px' }}>
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

      {/* Radically new layout: vertical sidebar, floating D-Pad, immersive viewport */}
      {/* Sidebar controls - vertical left panel, now larger */}
      <div className="absolute top-0 left-0 h-full z-30 flex flex-col items-start justify-start pt-8 pl-4 gap-4">
        <div className="bg-[#002439]/90 border border-[#78cce2]/30 rounded-3xl shadow-2xl p-10 min-w-[380px] max-w-[480px] w-[420px] flex flex-col gap-8">
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

      {/* D-Pad Controls - floating bottom right overlay, cross layout */}
      <div className="fixed bottom-12 right-12 z-40 flex flex-col items-center">
        <div className="bg-[#002439]/90 border border-[#78cce2]/30 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
          <div className="grid grid-cols-3 grid-rows-3 gap-4 w-48 h-48 mb-2 relative">
            <div></div>
            <button
              aria-label="Move Up"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-16 h-16 shadow-lg border-2 border-[#005066] flex items-center justify-center text-2xl font-bold transition"
              onClick={() => handleDPad("up")}
            >↑</button>
            <div></div>
            <button
              aria-label="Move Left"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-16 h-16 shadow-lg border-2 border-[#005066] flex items-center justify-center text-2xl font-bold transition"
              onClick={() => handleDPad("left")}
            >←</button>
            <div className="bg-[#005066] rounded-full border-2 border-[#78cce2] w-16 h-16 flex items-center justify-center text-xl text-[#78cce2] font-mono">{currentSector.x},{currentSector.y}</div>
            <button
              aria-label="Move Right"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-16 h-16 shadow-lg border-2 border-[#005066] flex items-center justify-center text-2xl font-bold transition"
              onClick={() => handleDPad("right")}
            >→</button>
            <div></div>
            <button
              aria-label="Move Down"
              className="bg-[#78cce2] hover:bg-[#e4eff0] text-[#002439] rounded-full w-16 h-16 shadow-lg border-2 border-[#005066] flex items-center justify-center text-2xl font-bold transition"
              onClick={() => handleDPad("down")}
            >↓</button>
            <div></div>
          </div>
        </div>
      </div>

      {/* Sector Status Overlay */}
      {sectorAnomalies.length === 0 && !loading && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-[#005066]/90 backdrop-blur-sm border border-[#78cce2]/30 rounded-lg px-6 py-3">
          <div className="flex items-center gap-3 text-[#78cce2]">
            <Target className="h-5 w-5" />
            <span className="text-sm">No exoplanet candidates in this sector • Navigate to explore more areas</span>
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