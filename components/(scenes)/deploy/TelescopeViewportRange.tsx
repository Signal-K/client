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
  return {
    id: `db-${dbAnomaly.id}`,
    name: dbAnomaly.content || `TESS-${String(dbAnomaly.id).padStart(3, "0")}`,
    x: seededRandom1(seed, 1) * 80 + 10,
    y: seededRandom1(seed, 2) * 80 + 10,
    brightness: seededRandom1(seed, 3) * 0.7 + 0.5,
    size: seededRandom1(seed, 4) * 0.8 + 0.6,
    pulseSpeed: seededRandom1(seed, 5) * 2 + 1,
    glowIntensity: seededRandom1(seed, 6) * 0.5 + 0.3,
    color: "#78cce2",
    shape: "circle",
    sector: generateSectorName(sectorX, sectorY),
    discoveryDate: new Date().toLocaleDateString(),
    type: "exoplanet",
    project: "planet-hunters",
    dbData: dbAnomaly,
  }
}

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
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null)

  const fetchTessAnomalies = async () => {
    const { data, error } = await supabase
      .from("anomalies")
      .select("*")
      .eq("anomalySet", "telescope-tess")

    if (error) {
      console.error("Error fetching anomalies:", error)
      return
    }
    if (data) {
      setTessAnomalies(data)
    }
  }

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

    setAlreadyDeployed(!userCanRedeploy)
    if (userCanRedeploy) {
      setDeploymentMessage("You have earned additional deploys by interacting with the community this week!")
    } else if (linkedCount > 0) {
      setDeploymentMessage("Telescope has already been deployed this week. Recalibrate & search again next week.")
    } else {
      setDeploymentMessage(null)
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

  const handleDeploy = async () => {
    if (!session?.user?.id || !selectedSector || alreadyDeployed) return
    setDeploying(true)
    const seed = selectedSector.x * 1000 + selectedSector.y
    const selectedAnomalies = tessAnomalies
      .filter((_, i) => Math.floor(seededRandom1(seed, i) * 10) < 3)
      .slice(0, 4)
    if (selectedAnomalies.length === 0) {
      setDeploymentMessage("No TESS anomalies found in selected sector.")
      setDeploying(false)
      return
    }
    const inserts = selectedAnomalies.map(anomaly =>
      supabase.from("linked_anomalies").insert({
        author: session.user.id,
        anomaly_id: anomaly.id,
        classification_id: null,
        automaton: "Telescope",
      })
    )
    const results = await Promise.all(inserts)
    const hasError = results.some(r => r.error)
    setDeploymentMessage(
      hasError
        ? "Error deploying telescope. Please try again."
        : `Telescope successfully deployed! ${selectedAnomalies.length} TESS exoplanet candidates are now being monitored.`
    )
    setAlreadyDeployed(!hasError)
    setDeploying(false)
  }

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
    <div className="h-screen bg-[#002439] flex flex-col lg:flex-row overflow-hidden">
      <DeployTelescopeMobileHeader
        sectorAnomalies={sectorAnomalies}
        selectedSector={selectedSector}
        alreadyDeployed={alreadyDeployed}
        deploying={deploying}
        onDeploy={handleDeploy}
      />
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
      <div className="flex-1 relative">
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
    </div>
  )
}