"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import type { Anomaly, ViewMode } from "./types/Structures/telescope"
import { projects } from "@/data/projects"
import { missions } from "@/data/missions"
import { generateSectorName, generateStars, filterAnomaliesBySector, seededRandom } from "./utils/Structures/Telescope/sector-utils"
import { ViewportHeader } from "./components/Structures/Telescope/viewport-header"
import { ProjectPanel } from "./components/Structures/Telescope/project-panel"
import { TelescopeView } from "./components/Structures/Telescope/telescope-view"
import { DiscoveriesView } from "./components/Structures/Telescope/discoveries-view"
import { AnomalyDialog } from "./components/Structures/Telescope/anomaly-dialog"
import { AnomalyDetailDialog } from "./components/Structures/Telescope/anomaly-detail-dialog"

interface DatabaseAnomaly {
  id: number
  content: string | null
  ticId: string | null
  anomalytype: string | null
  type: string | null
  radius: number | null
  mass: number | null
  density: number | null
  gravity: number | null
  temperatureEq: number | null
  temperature: number | null
  smaxis: number | null 
  orbital_period: number | null
  classification_status: string | null
  avatar_url: string | null
  created_at: string
  deepnote: string | null
  lightkurve: string | null
  configuration: any
  parentAnomaly: number | null
  anomalySet: string | null
}

interface DatabaseClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  anomaly: number | null
  media: any
  classificationtype: string | null
  classificationConfiguration: any
}

export default function TelescopeViewport() {
  const session = useSession()
  const supabase = useSupabaseClient()

  const [currentSector, setCurrentSector] = useState({ x: 0, y: 0 })
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([])
  const [classifications, setClassifications] = useState<DatabaseClassification[]>([])
  const [allClassifications, setAllClassifications] = useState<DatabaseClassification[]>([])
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [showClassifyDialog, setShowClassifyDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [stars, setStars] = useState<
    Array<{ x: number; y: number; size: number; opacity: number; color: string; twinkleSpeed: number }>
  >([])
  const [showProjectPanel, setShowProjectPanel] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("viewport")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null)
  const [showAllDiscoveries, setShowAllDiscoveries] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch anomalies from database
  const fetchAnomalies = async () => {
    try {
      const { data, error } = await supabase.from("anomalies").select("*").limit(100)

      if (!error && data) {
        const processedAnomalies = data.map((dbAnomaly: DatabaseAnomaly) => {
          // Generate visual properties based on anomaly ID
          const seed = dbAnomaly.id
          const x = seededRandom(seed, 1) * 80 + 10
          const y = seededRandom(seed, 2) * 80 + 10
          const brightness = seededRandom(seed, 3) * 0.7 + 0.5
          const size = seededRandom(seed, 4) * 0.8 + 0.6
          const pulseSpeed = seededRandom(seed, 5) * 2 + 1
          const glowIntensity = seededRandom(seed, 6) * 0.5 + 0.3

          // Map database type to our UI types
          let mappedType: "exoplanet" | "sunspot" | "asteroid" | "accretion_disc"
          let project: string
          let color: string
          let shape: "circle" | "star" | "diamond" | "hexagon" | "triangle" | "oval"

          switch (dbAnomaly.anomalytype || dbAnomaly.type) {
            case "planet":
            case "exoplanet":
              mappedType = "exoplanet"
              project = "planet-hunters"
              const planetColors = [
                "#4FC3F7",
                "#AB47BC",
                "#FFD54F",
                "#26C6DA",
                "#7E57C2",
                "#FFCA28",
                "#29B6F6",
                "#BA68C8",
              ]
              color = planetColors[Math.floor(seededRandom(seed, 7) * planetColors.length)]
              shape = ["circle", "star", "hexagon"][Math.floor(seededRandom(seed, 8) * 3)] as any
              break
            case "sunspot":
              mappedType = "sunspot"
              project = "sunspots"
              const sunColors = ["#FF7043", "#F44336", "#FF9800", "#FF5722", "#E91E63", "#FF6F00", "#D84315", "#BF360C"]
              color = sunColors[Math.floor(seededRandom(seed, 7) * sunColors.length)]
              shape = ["circle", "oval", "star"][Math.floor(seededRandom(seed, 8) * 3)] as any
              break
            case "asteroid":
            case "minor-planet":
              mappedType = "asteroid"
              project = "daily-minor-planet"
              const asteroidColors = [
                "#9C27B0",
                "#00BCD4",
                "#607D8B",
                "#673AB7",
                "#009688",
                "#795548",
                "#8BC34A",
                "#3F51B5",
              ]
              color = asteroidColors[Math.floor(seededRandom(seed, 7) * asteroidColors.length)]
              shape = ["diamond", "triangle", "hexagon"][Math.floor(seededRandom(seed, 8) * 3)] as any
              break
            case "accretion_disc":
            case "disk":
              mappedType = "accretion_disc"
              project = "disk-detective"
              const discColors = [
                "#00E676",
                "#E91E63",
                "#00BCD4",
                "#8BC34A",
                "#FF4081",
                "#1DE9B6",
                "#536DFE",
                "#69F0AE",
              ]
              color = discColors[Math.floor(seededRandom(seed, 7) * discColors.length)]
              shape = ["oval", "circle", "hexagon"][Math.floor(seededRandom(seed, 8) * 3)] as any
              break
            default:
              mappedType = "exoplanet"
              project = "planet-hunters"
              color = "#4FC3F7"
              shape = "circle"
          }

          // Generate sector based on anomaly ID
          const sectorX = Math.floor(seededRandom(seed, 9) * 10) - 5
          const sectorY = Math.floor(seededRandom(seed, 10) * 10) - 5
          const sector = generateSectorName(sectorX, sectorY)

          return {
            id: `db-${dbAnomaly.id}`,
            name: dbAnomaly.ticId || `${mappedType.toUpperCase()}-${String(dbAnomaly.id).padStart(3, "0")}`,
            type: mappedType,
            project,
            x,
            y,
            brightness,
            size,
            color,
            sector,
            shape,
            pulseSpeed,
            glowIntensity,
            classified: dbAnomaly.classification_status === "classified",
            discoveryDate:
              dbAnomaly.classification_status === "classified"
                ? new Date(dbAnomaly.created_at).toLocaleDateString()
                : undefined,
            // Store original database data
            dbData: dbAnomaly,
          } as Anomaly & { dbData: DatabaseAnomaly }
        })

        setAnomalies(processedAnomalies)
      }
    } catch (error) {
      console.error("Error fetching anomalies:", error)
    }
  }

  // Fetch user's classifications
  const fetchUserClassifications = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id, 
          created_at, 
          content, 
          author, 
          anomaly, 
          media, 
          classificationtype, 
          classificationConfiguration
        `)
        .eq("author", session.user.id)

      if (!error && data) {
        setClassifications(data)
      }
    } catch (error) {
      console.error("Error fetching user classifications:", error)
    }
  }

  // Fetch all classifications (for "all users" view)
  const fetchAllClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id, 
          created_at, 
          content, 
          author, 
          anomaly, 
          media, 
          classificationtype, 
          classificationConfiguration
        `)
        .limit(50)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setAllClassifications(data)
      }
    } catch (error) {
      console.error("Error fetching all classifications:", error)
    }
  }

  // Create a new classification
  const createClassification = async (anomalyId: string, classificationType: string) => {
    if (!session?.user?.id) return null

    try {
      // Extract database ID from our anomaly ID
      const dbId = Number.parseInt(anomalyId.replace("db-", ""))

      const { data, error } = await supabase
        .from("classifications")
        .insert({
          author: session.user.id,
          anomaly: dbId,
          classificationtype: classificationType,
          content: `Classified as ${classificationType}`,
        })
        .select()
        .single()

      if (!error && data) {
        // Refresh classifications
        await fetchUserClassifications()
        await fetchAllClassifications()
        return data
      }
    } catch (error) {
      console.error("Error creating classification:", error)
    }

    return null
  }

  // Load all data
  const loadData = async () => {
    setLoading(true)
    await fetchAnomalies()
    if (session?.user?.id) {
      await fetchUserClassifications()
    }
    await fetchAllClassifications()
    setLoading(false)
  }

  // Load sector data
  const loadSector = useCallback(
    (sectorX: number, sectorY: number) => {
      const sectorStars = generateStars(sectorX, sectorY)
      setStars(sectorStars)

      // Filter anomalies by current sector
      const sectorAnomalies = filterAnomaliesBySector(anomalies, sectorX, sectorY)

      // Apply project filter
      if (selectedProject) {
        setFilteredAnomalies(sectorAnomalies.filter((a) => a.project === selectedProject.id))
      } else {
        setFilteredAnomalies(sectorAnomalies)
      }
    },
    [anomalies, selectedProject],
  )

  useEffect(() => {
    loadData()
  }, [session])

  useEffect(() => {
    if (!loading) {
      loadSector(currentSector.x, currentSector.y)
    }
  }, [currentSector, loadSector, loading])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    // Only move if drag is significant enough
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      const newSectorX = currentSector.x - Math.sign(deltaX)
      const newSectorY = currentSector.y - Math.sign(deltaY)

      setCurrentSector({ x: newSectorX, y: newSectorY })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const selectProject = (project: (typeof projects)[0] | null) => {
    setSelectedProject(project)
    setShowProjectPanel(false)
  }

  const handleAnomalyClick = (anomaly: Anomaly) => {
    if (isDragging) return // Don't open dialog if we're dragging
    setSelectedAnomaly(anomaly)

    if (anomaly.classified) {
      setShowDetailDialog(true)
    } else {
      setShowClassifyDialog(true)
    }
  }

  const handleViewAnomaly = (anomaly: Anomaly) => {
    // Switch to viewport mode and focus on the anomaly
    setViewMode("viewport")
    setFocusedAnomaly(anomaly)
    setSelectedAnomaly(anomaly)

    // Show detail dialog after a short delay
    setTimeout(() => {
      setShowDetailDialog(true)
    }, 500)
  }

  const handleClassify = async () => {
    if (!selectedAnomaly || !session?.user?.id) return

    // Map our UI types to database classification types
    let classificationType: string
    switch (selectedAnomaly.type) {
      case "exoplanet":
        classificationType = "planet"
        break
      case "sunspot":
        classificationType = "sunspot"
        break
      case "asteroid":
        classificationType = "asteroid"
        break
      case "accretion_disc":
        classificationType = "disk"
        break
      default:
        classificationType = "planet"
    }

    const result = await createClassification(selectedAnomaly.id, classificationType)

    if (result) {
      // Update the anomaly to show as classified
      const updatedAnomalies = anomalies.map((a) =>
        a.id === selectedAnomaly.id ? { ...a, classified: true, discoveryDate: new Date().toLocaleDateString() } : a,
      )
      setAnomalies(updatedAnomalies)

      // Refresh the current sector view
      loadSector(currentSector.x, currentSector.y)
    }

    setShowClassifyDialog(false)
    setSelectedAnomaly(null)
  }

  const toggleProjectPanel = () => {
    setShowProjectPanel(!showProjectPanel)
  }

  const currentSectorName = generateSectorName(currentSector.x, currentSector.y)
  const projectMissions = missions.filter((m) => !selectedProject || m.project === selectedProject.id)
  const availableMissions = projectMissions.filter((m) => !m.completed)

  if (loading) {
    return (
      <div className="h-screen bg-[#2E3440] flex items-center justify-center">
        <div className="text-[#ECEFF4] text-xl">Loading telescope data...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#2E3440] flex flex-col overflow-hidden">
      {/* Header */}
      <ViewportHeader
        selectedProject={selectedProject}
        viewMode={viewMode}
        toggleProjectPanel={toggleProjectPanel}
        setViewMode={setViewMode}
        classifiedCount={classifications.length}
        availableMissionsCount={availableMissions.length}
        showAllDiscoveries={showAllDiscoveries}
        setShowAllDiscoveries={setShowAllDiscoveries}
      />

      {/* Project Selection Panel */}
      <ProjectPanel
        projects={projects}
        selectedProject={selectedProject}
        selectProject={selectProject}
        showProjectPanel={showProjectPanel}
        onClose={() => setShowProjectPanel(false)}
      />

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === "viewport" ? (
          <TelescopeView
            stars={stars}
            filteredAnomalies={filteredAnomalies}
            isDragging={isDragging}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleAnomalyClick={handleAnomalyClick}
            currentSectorName={currentSectorName}
            focusedAnomaly={focusedAnomaly}
          />
        ) : (
          <DiscoveriesView
            classifications={classifications}
            allClassifications={allClassifications}
            projectMissions={projectMissions}
            selectedProject={selectedProject}
            onBack={() => setViewMode("viewport")}
            onViewAnomaly={handleViewAnomaly}
            showAllDiscoveries={showAllDiscoveries}
            anomalies={anomalies}
          />
        )}
      </div>

      {/* Classification Dialog */}
      <AnomalyDialog
        showClassifyDialog={showClassifyDialog}
        setShowClassifyDialog={setShowClassifyDialog}
        selectedAnomaly={selectedAnomaly}
        handleClassify={handleClassify}
      />

      {/* Detail Dialog */}
      <AnomalyDetailDialog
        showDetailDialog={showDetailDialog}
        setShowDetailDialog={setShowDetailDialog}
        selectedAnomaly={selectedAnomaly}
      />
    </div>
  )
};