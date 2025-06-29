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
  anomalytype: string | null
  avatar_url: string | null
  created_at: string
  configuration: any
  parentAnomaly: number | null
  anomalySet: string | null
};

interface DatabaseClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  anomaly: number | null
  media: any
  classificationtype: string | null
  classificationConfiguration: any
};

// Anomaly type mapping configuration
const ANOMALY_TYPES = {
  exoplanet: {
    project: "planet-hunters",
    colors: ["#4FC3F7", "#AB47BC", "#FFD54F", "#26C6DA", "#7E57C2", "#FFCA28", "#29B6F6", "#BA68C8"],
    shapes: ["circle", "star", "hexagon"] as const
  },
  sunspot: {
    project: "sunspots",
    colors: ["#FF7043", "#F44336", "#FF9800", "#FF5722", "#E91E63", "#FF6F00", "#D84315", "#BF360C"],
    shapes: ["circle", "oval", "star"] as const
  },
  asteroid: {
    project: "daily-minor-planet",
    colors: ["#9C27B0", "#00BCD4", "#607D8B", "#673AB7", "#009688", "#795548", "#8BC34A", "#3F51B5"],
    shapes: ["diamond", "triangle", "hexagon"] as const
  },
  accretion_disc: {
    project: "disk-detective",
    colors: ["#00E676", "#E91E63", "#00BCD4", "#8BC34A", "#FF4081", "#1DE9B6", "#536DFE", "#69F0AE"],
    shapes: ["oval", "circle", "hexagon"] as const
  }
} as const

type AnomalyType = keyof typeof ANOMALY_TYPES

function normalizeAnomalyType(type: string | null): AnomalyType {
  switch (type) {
    case "planet":
      // return "planet";
    case "telescope-tess":
      // return "planet";
    case "exoplanet":
      return "exoplanet"
    case "sunspot":
      return "sunspot"
    case "telescope-awa":
      return "accretion_disc";
    // case "" - whatever the correct DD anomalySet is
    case "asteroid":
      return "asteroid";
    case "active-asteroids":
      return "asteroid"
    case "telescope-minorPlanet":
      return "asteroid"
    case "minor-planet":
      return "asteroid"
    case "accretion_disc":
    case "disk":
      return "accretion_disc"
    default:
      return "exoplanet"
  }
}

function generateAnomalyProperties(dbAnomaly: DatabaseAnomaly): Anomaly & { dbData: DatabaseAnomaly } {
  const seed = dbAnomaly.id
  const type = normalizeAnomalyType(dbAnomaly.anomalySet)
  const config = ANOMALY_TYPES[type]
  
  return {
    id: `db-${dbAnomaly.id}`,
    name: dbAnomaly.content || `${type.toUpperCase()}-${String(dbAnomaly.id).padStart(3, "0")}`,
    type,
    project: config.project,
    x: seededRandom(seed, 1) * 80 + 10,
    y: seededRandom(seed, 2) * 80 + 10,
    brightness: seededRandom(seed, 3) * 0.7 + 0.5,
    size: seededRandom(seed, 4) * 0.8 + 0.6,
    pulseSpeed: seededRandom(seed, 5) * 2 + 1,
    glowIntensity: seededRandom(seed, 6) * 0.5 + 0.3,
    color: config.colors[Math.floor(seededRandom(seed, 7) * config.colors.length)],
    shape: config.shapes[Math.floor(seededRandom(seed, 8) * config.shapes.length)],
    sector: generateSectorName(
      Math.floor(seededRandom(seed, 9) * 10) - 5,
      Math.floor(seededRandom(seed, 10) * 10) - 5
    ),
    discoveryDate: new Date().toLocaleDateString(),
    dbData: dbAnomaly,
  };
};

export default function TelescopeViewport() {
  const session = useSession()
  const supabase = useSupabaseClient()
  
  // State management
  const [currentSector, setCurrentSector] = useState({ x: 0, y: 0 })
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([])
  const [classifications, setClassifications] = useState<DatabaseClassification[]>([])
  const [allClassifications, setAllClassifications] = useState<DatabaseClassification[]>([])
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [showClassifyDialog, setShowClassifyDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [stars, setStars] = useState<Array<{
    x: number; y: number; size: number; opacity: number; 
    color: string; twinkleSpeed: number
  }>>([])
  const [showProjectPanel, setShowProjectPanel] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("viewport")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null)
  const [showAllDiscoveries, setShowAllDiscoveries] = useState(false)
  const [loading, setLoading] = useState(true)

  // Database operations
  const fetchAnomalies = async () => {
    try {
      const { data, error } = await supabase
        .from("anomalies")
        .select("*")
        // .limit(100)

      if (!error && data) {
        const processedAnomalies = data.map(generateAnomalyProperties)
        setAnomalies(processedAnomalies)
      }
    } catch (error) {
      console.error("Error fetching anomalies:", error)
    }
  }

  const fetchUserClassifications = async () => {
    if (!session?.user?.id) return
    
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id, created_at, content, author, anomaly, media, 
          classificationtype, classificationConfiguration
        `)
        .eq("author", session.user.id)

      if (!error && data) {
        setClassifications(data)
      }
    } catch (error) {
      console.error("Error fetching user classifications:", error)
    }
  }

  const fetchAllClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id, created_at, content, author, anomaly, media, 
          classificationtype, classificationConfiguration
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

  const createClassification = async (anomalyId: string, classificationType: string) => {
    if (!session?.user?.id) return null

    try {
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
        await Promise.all([fetchUserClassifications(), fetchAllClassifications()])
        return data
      }
    } catch (error) {
      console.error("Error creating classification:", error)
    }
    return null
  }

  // Sector management
  const loadSector = useCallback((sectorX: number, sectorY: number) => {
    const sectorStars = generateStars(sectorX, sectorY)
    setStars(sectorStars)

    const sectorAnomalies = filterAnomaliesBySector(anomalies, sectorX, sectorY)
    const filtered = selectedProject 
      ? sectorAnomalies.filter((a) => a.project === selectedProject.id)
      : sectorAnomalies
    
    setFilteredAnomalies(filtered)
  }, [anomalies, selectedProject])

  // Data loading
  const loadData = async () => {
    setLoading(true)
    await fetchAnomalies()
    if (session?.user?.id) {
      await fetchUserClassifications()
    }
    await fetchAllClassifications()
    setLoading(false)
  }

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      setCurrentSector({
        x: currentSector.x - Math.sign(deltaX),
        y: currentSector.y - Math.sign(deltaY)
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleAnomalyClick = (anomaly: Anomaly) => {
    if (isDragging) return
    
    setSelectedAnomaly(anomaly)
    if (anomaly.classified) {
      setShowDetailDialog(true)
    } else {
      setShowClassifyDialog(true)
    }
  }

  const handleViewAnomaly = (anomaly: Anomaly) => {
    setViewMode("viewport")
    setFocusedAnomaly(anomaly)
    setSelectedAnomaly(anomaly)
    setTimeout(() => setShowDetailDialog(true), 500)
  }

  const handleClassify = async () => {
    if (!selectedAnomaly || !session?.user?.id) return

    // Map UI types to database classification types
    const typeMapping = {
      exoplanet: "planet",
      sunspot: "sunspot", 
      asteroid: "asteroid",
      accretion_disc: "disk"
    }
    
    const classificationType = typeMapping[selectedAnomaly.type] || "planet"
    const result = await createClassification(selectedAnomaly.id, classificationType)

    if (result) {
      setAnomalies(anomalies.map(a => 
        a.id === selectedAnomaly.id 
          ? { ...a, classified: true, discoveryDate: new Date().toLocaleDateString() }
          : a
      ))
      loadSector(currentSector.x, currentSector.y)
    }

    setShowClassifyDialog(false)
    setSelectedAnomaly(null)
  }

  const selectProject = (project: (typeof projects)[0] | null) => {
    setSelectedProject(project)
    setShowProjectPanel(false)
  };

  const toggleProjectPanel = () => setShowProjectPanel(!showProjectPanel)

  // Effects
  useEffect(() => {
    loadData()
  }, [session])

  useEffect(() => {
    if (!loading) {
      loadSector(currentSector.x, currentSector.y)
    }
  }, [currentSector, loadSector, loading]);

  useEffect(() => {
  if (!loading && anomalies.length > 0) {
    const alreadyClassifiedIds = new Set(classifications.map(c => `db-${c.anomaly}`));
    const unclassified = anomalies.filter(a => !alreadyClassifiedIds.has(a.id));
    const pool = unclassified.length > 0 ? unclassified : anomalies;
    const randomAnomaly = pool[Math.floor(Math.random() * pool.length)];

    if (randomAnomaly) {
      setSelectedAnomaly(randomAnomaly)
      if (randomAnomaly.classified) {
        setShowDetailDialog(true)
      } else {
        setShowClassifyDialog(true)
      }
    }
  }
}, [loading, anomalies, classifications]);

  // Computed values
  const currentSectorName = generateSectorName(currentSector.x, currentSector.y)
  const projectMissions = missions.filter(m => !selectedProject || m.project === selectedProject.id)
  const availableMissions = projectMissions.filter(m => !m.completed)

  if (loading) {
    return (
      <div className="h-screen bg-[#2E3440] flex items-center justify-center">
        <div className="text-[#ECEFF4] text-xl">Loading telescope data...</div>
      </div>
    );
  };

  const handleNavigate = (direction: "up" | "down" | "left" | "right") => {
    const newSector = { ...currentSector }
    switch (direction) {
      case "up":
        newSector.y -= 1
        break
      case "down":
        newSector.y += 1
        break
      case "left":
        newSector.x -= 1
        break
      case "right":
        newSector.x += 1
        break
    }
    setCurrentSector(newSector)
  };

  return (
    <div className="h-screen bg-[#2E3440] flex flex-col overflow-hidden">
      <ViewportHeader
        selectedProject={selectedProject}
        viewMode={viewMode}
        toggleProjectPanel={toggleProjectPanel}
        setViewMode={setViewMode}
        classifiedCount={classifications.length}
        availableMissionsCount={availableMissions.length}
        onNavigate={handleNavigate}
        showAllDiscoveries={showAllDiscoveries}
        setShowAllDiscoveries={setShowAllDiscoveries}
      />

      <ProjectPanel
        projects={projects}
        selectedProject={selectedProject}
        selectProject={selectProject}
        showProjectPanel={showProjectPanel}
        onNavigate={handleNavigate}
        onClose={() => setShowProjectPanel(false)}
        anomalies={anomalies}
      />

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
            onNavigate={handleNavigate}
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

      <AnomalyDialog
        showClassifyDialog={showClassifyDialog}
        setShowClassifyDialog={setShowClassifyDialog}
        selectedAnomaly={selectedAnomaly}
        handleClassify={handleClassify}
      />

      <AnomalyDetailDialog
        showDetailDialog={showDetailDialog}
        setShowDetailDialog={setShowDetailDialog}
        selectedAnomaly={selectedAnomaly}
      />
    </div>
  )
};