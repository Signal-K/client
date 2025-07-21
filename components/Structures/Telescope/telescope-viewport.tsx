"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import type { Anomaly, ViewMode } from "@/types/Structures/telescope"
import { projects } from "@/data/projects"
import { missions } from "@/data/missions"
import { generateSectorName, generateStars, filterAnomaliesBySector, seededRandom } from "@/utils/Structures/Telescope/sector-utils"
import { generateAnomalyProperties, ANOMALY_TYPES, PASTEL_COLORS, DatabaseClassification, DatabaseAnomaly } from "./blocks/types"
import { TelescopeView } from "./telescope-view"
import { DiscoveriesView } from "./discoveries-view"
import AnomalyDialog from "./anomaly-dialogue"
import { AnomalyDetailDialog } from "../Viewport/anomaly-detail-dialogue"
import { ClassificationDetailDialog } from "../Viewport/classification-detail-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Archive,
  Radio,
  Crosshair,
  Power,
  Calendar,
  Building,
  Filter,
} from "lucide-react"
import TelescopeNavControls from "./blocks/navigation-controls"

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
  const [selectedClassification, setSelectedClassification] = useState<DatabaseClassification | null>(null)
  const [showClassifyDialog, setShowClassifyDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showClassificationDetailDialog, setShowClassificationDetailDialog] = useState(false)
  const [stars, setStars] = useState<
    Array<{
      x: number
      y: number
      size: number
      opacity: number
      color: string
      twinkleSpeed: number
    }>
  >([])
  const [viewMode, setViewMode] = useState<ViewMode>("viewport")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null)
  const [showAllDiscoveries, setShowAllDiscoveries] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [mobileBottomTab, setMobileBottomTab] = useState<"controls" | "projects" | "stats" | "archive">("controls")

  // Database operations
    const fetchAnomalies = async () => {
    try {
      const { data, error } = await supabase.from("anomalies").select("*")

      if (!error && data) {
        const processedAnomalies = data.map(generateAnomalyProperties)
        setAnomalies(processedAnomalies)
      }
    } catch (error) {
      console.error("Error fetching anomalies:", error)
    };
  };
// const fetchAnomalies = async (userId: string) => {
//   try {
//     console.log("fetchAnomalies called with userId:", userId)

//     if (!userId) {
//       console.warn("No userId provided to fetchAnomalies.")
//       return
//     }

//     // Step 1: Fetch linked anomalies for the current user
//     const { data: linkedData, error: linkedError } = await supabase
//       .from("linked_anomalies")
//       .select("anomaly_id")
//       .eq("author", userId)

//     console.log("Linked anomalies query result:", { linkedData, linkedError })

//     if (linkedError) {
//       console.error("Error fetching linked anomalies:", linkedError)
//       return
//     }

//     const anomalyIds = linkedData?.map((entry) => entry.anomaly_id) || []
//     console.log("Extracted anomaly IDs:", anomalyIds)

//     if (anomalyIds.length === 0) {
//       console.log("No linked anomalies found for user")
//       setAnomalies([]) // Clear state if none
//       return
//     }

//     // Step 2: Fetch anomalies matching the linked IDs
//     const { data: anomaliesData, error: anomaliesError } = await supabase
//       .from("anomalies")
//       .select("*")
//       .in("id", anomalyIds)

//     console.log("Anomalies query result:", { anomaliesData, anomaliesError })

//     if (anomaliesError) {
//       console.error("Error fetching anomalies:", anomaliesError)
//       return
//     }

//     if (anomaliesData) {
//       const processedAnomalies = anomaliesData.map(generateAnomalyProperties)
//       console.log("Processed anomalies:", processedAnomalies.length)
//       setAnomalies(processedAnomalies)
//     }

//   } catch (error) {
//     console.error("Unexpected error in fetchAnomalies:", error)
//   }
// }

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
        .order("created_at", { ascending: false })

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

  // Sector management
  const loadSector = useCallback(
    (sectorX: number, sectorY: number) => {
      const sectorStars = generateStars(sectorX, sectorY)
      setStars(sectorStars)

      const sectorAnomalies = filterAnomaliesBySector(anomalies, sectorX, sectorY)
      let filtered = selectedProject ? sectorAnomalies.filter((a) => a.project === selectedProject.id) : sectorAnomalies

      // Limit to 15 anomalies per sector view for better visibility
      filtered = filtered.slice(0, 15)

      setFilteredAnomalies(filtered)
    },
    [anomalies, selectedProject],
  )

  // Data loading
const loadData = async () => {
  setLoading(true)

  if (session?.user?.id) {
    await fetchAnomalies()//(session.user.id)
    await fetchUserClassifications()
  } else {
    console.warn("Session not ready, skipping user-specific fetches")
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
        y: currentSector.y - Math.sign(deltaY),
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

  const handleViewClassification = (classification: DatabaseClassification) => {
    setSelectedClassification(classification)
    setShowClassificationDetailDialog(true)
  }

  const selectProject = (project: (typeof projects)[0] | null) => {
    setSelectedProject(project)
  }

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
  }

  // Effects
  useEffect(() => {
    loadData()
  }, [session])

  useEffect(() => {
    if (!loading) {
      loadSector(currentSector.x, currentSector.y)
    }
  }, [currentSector, loadSector, loading])

  useEffect(() => {
    if (!loading && anomalies.length > 0) {
      const alreadyClassifiedIds = new Set(classifications.map((c) => `db-${c.anomaly}`))
      const unclassified = anomalies.filter((a) => !alreadyClassifiedIds.has(a.id))
      const pool = unclassified.length > 0 ? unclassified : anomalies
      const randomAnomaly = pool[Math.floor(Math.random() * pool.length)]

      if (randomAnomaly) {
        setSelectedAnomaly(randomAnomaly)
        if (randomAnomaly.classified) {
          setShowDetailDialog(true)
        } else {
          setShowClassifyDialog(true)
        }
      }
    }
  }, [loading, anomalies, classifications])

  // Computed values
  const currentSectorName = generateSectorName(currentSector.x, currentSector.y)
  const projectMissions = missions.filter((m) => !selectedProject || m.project === selectedProject.id)
  const availableMissions = projectMissions.filter((m) => !m.completed)

  // Get sector-specific counts for projects
  const getSectorAnomaliesForProject = (projectId: string | null) => {
    const sectorAnomalies = filterAnomaliesBySector(anomalies, currentSector.x, currentSector.y)
    return projectId ? sectorAnomalies.filter((a) => a.project === projectId) : sectorAnomalies
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a8d8ea] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#e8f4f8] text-xl font-mono">INITIALIZING TELESCOPE ARRAY...</div>
          <div className="text-[#a8d8ea] text-sm mt-2">Loading deep space data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#1a1a2e] flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop Left Sidebar - Controls */}
      <div className="hidden lg:flex w-80 h-full bg-[#16213e]/95 border-r border-[#a8d8ea]/20 flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-[#a8d8ea]/20 bg-gradient-to-r from-[#1a1a2e] to-[#16213e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#a8d8ea] to-[#87ceeb] rounded-full flex items-center justify-center shadow-lg">
              <Search className="h-5 w-5 text-[#1a1a2e]" />
            </div>
            <div>
              <h1 className="text-[#e8f4f8] font-bold text-lg tracking-wider">Telescope</h1>
              <p className="text-[#a8d8ea] text-xs font-mono">OBSERVATORY</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="p-4 border-b border-[#a8d8ea]/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#b8e6b8] rounded-full animate-pulse"></div>
              <span className="text-[#b8e6b8] text-xs font-mono">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <Power className="h-3 w-3 text-[#e8f4f8]" />
              <span className="text-[#e8f4f8] text-xs font-mono">PWR: 98%</span>
            </div>
          </div>
          {/* <div className="text-[#e8f4f8] text-sm font-mono mb-1">Sector: {currentSectorName}</div> */}
          <div className="text-[#a8d8ea] text-sm font-mono mb-2">Targets: {filteredAnomalies.length}/15</div>
          <Badge className="bg-[#b8e6b8] text-[#1a1a2e] text-xs px-2 py-1 font-mono">
            {classifications.length} CLASSIFIED
          </Badge>
        </div>

        {/* Navigation Controls */}
        <TelescopeNavControls
            sector={currentSector}
            setSector={setCurrentSector}
            sectorName={currentSectorName}
            targetsCount={filteredAnomalies.length}
            maxTargets={15}
        />

        {/* Project Selection */}
        <Card className="m-4 bg-[#1a1a2e]/60 border border-[#a8d8ea]/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#e8f4f8] text-sm font-mono flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#a8d8ea]" />
              PROJECTS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            <Button
              variant={!selectedProject ? "default" : "ghost"}
              className={`w-full justify-start text-xs font-mono ${
                !selectedProject
                  ? "bg-[#a8d8ea] text-[#1a1a2e] hover:bg-[#87ceeb]"
                  : "text-[#e8f4f8] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
              }`}
              onClick={() => selectProject(null)}
            >
              <Star className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate">ALL PROJECTS</span>
              <span className="ml-auto text-xs flex-shrink-0">({getSectorAnomaliesForProject(null).length})</span>
            </Button>

            {projects.map((project) => {
              const sectorCount = getSectorAnomaliesForProject(project.id).length

              return (
                <Button
                  key={project.id}
                  variant={selectedProject?.id === project.id ? "default" : "ghost"}
                  className={`w-full justify-start text-xs font-mono ${
                    selectedProject?.id === project.id
                      ? "bg-[#a8d8ea] text-[#1a1a2e] hover:bg-[#87ceeb]"
                      : "text-[#e8f4f8] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                  }`}
                  onClick={() => selectProject(project)}
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
                      style={{ background: project.bgGradient }}
                    >
                      {project.icon}
                    </div>
                    <span className="flex-1 text-left truncate">{project.name.toUpperCase()}</span>
                    <span className="text-xs flex-shrink-0">({sectorCount})</span>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <Button
            onClick={() => setViewMode(viewMode === "viewport" ? "discoveries" : "viewport")}
            className="w-full bg-[#a8d8ea] text-[#1a1a2e] hover:bg-[#87ceeb] font-mono"
          >
            {viewMode === "viewport" ? (
              <>
                <Archive className="h-4 w-4 mr-2" />
                ARCHIVE
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                TELESCOPE
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {/* Simple Header for Mobile */}
        <div className="lg:hidden absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-[#1a1a2e]/90 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a8d8ea] to-[#87ceeb] rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 text-[#1a1a2e]" />
              </div>
              <div>
                <div className="text-[#e8f4f8] font-bold text-sm">{currentSectorName}</div>
                <div className="text-[#a8d8ea] text-xs">{filteredAnomalies.length} targets</div>
              </div>
            </div>
            <Button
              onClick={() => setViewMode(viewMode === "viewport" ? "discoveries" : "viewport")}
              className="bg-[#a8d8ea]/20 text-[#a8d8ea] hover:bg-[#a8d8ea]/30 border border-[#a8d8ea]/30"
              size="sm"
            >
              {viewMode === "viewport" ? <Archive className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

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
            anomalies={anomalies}
          />
        ) : (
          <DiscoveriesView
            classifications={classifications || []}
            allClassifications={allClassifications || []}
            projectMissions={projectMissions}
            selectedProject={selectedProject}
            onBack={() => setViewMode("viewport")}
            onViewAnomaly={handleViewAnomaly}
            onViewClassification={handleViewClassification}
            showAllDiscoveries={showAllDiscoveries}
            setShowAllDiscoveries={setShowAllDiscoveries}
            anomalies={anomalies}
          />
        )}
      </div>

      {/* Desktop Right Sidebar - Stats */}
      <div className="hidden lg:flex w-80 h-full bg-[#16213e]/95 border-l border-[#a8d8ea]/20 flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-[#a8d8ea]/20 bg-gradient-to-r from-[#16213e] to-[#1a1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#87ceeb] to-[#a8d8ea] rounded-full flex items-center justify-center shadow-lg">
              <Building className="h-5 w-5 text-[#1a1a2e]" />
            </div>
            <div>
              <h1 className="text-[#e8f4f8] font-bold text-lg tracking-wider">STATISTICS</h1>
              <p className="text-[#a8d8ea] text-xs font-mono">DISCOVERY DATA</p>
            </div>
          </div>
        </div>

        {/* Discovery Stats */}
        <div className="p-4 border-b border-[#a8d8ea]/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#e8f4f8] font-mono">{classifications.length}</div>
              <div className="text-xs text-[#a8d8ea] font-mono">YOUR FINDS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a8d8ea] font-mono">{allClassifications.length}</div>
              <div className="text-xs text-[#a8d8ea] font-mono">TOTAL FINDS</div>
            </div>
          </div>
        </div>

        {/* Recent Classifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-4 w-4 text-[#a8d8ea]" />
            <span className="text-[#e8f4f8] text-sm font-mono">RECENT ACTIVITY</span>
          </div>

         <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
  {classifications.slice(0, 20).map((classification) => (
    <Card
      key={classification.id}
      className="bg-[#1a1a2e]/60 border border-[#a8d8ea]/20 hover:border-[#a8d8ea]/40 transition-all cursor-pointer backdrop-blur-sm"
      onClick={() => handleViewClassification(classification)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#e8f4f8] text-sm font-mono">#{classification.id}</div>
          <Badge className="bg-[#a8d8ea] text-[#1a1a2e] text-xs font-mono">
            {classification.classificationtype?.toUpperCase() || "UNKNOWN"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a8d8ea] font-mono">
          <Calendar className="h-3 w-3" />
          <span>{new Date(classification.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

          {classifications.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-2 border-dashed border-[#a8d8ea]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-[#a8d8ea]/50" />
              </div>
              <p className="text-[#e8f4f8] text-sm font-mono mb-1">NO CLASSIFICATIONS YET</p>
              <p className="text-[#a8d8ea] text-xs font-mono">Start exploring!</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#16213e]/95 border-t border-[#a8d8ea]/20 backdrop-blur-sm">
        {/* Tab Bar */}
        <div className="flex">
          <Button
            variant="ghost"
            onClick={() => setMobileBottomTab("controls")}
            className={`flex-1 py-3 rounded-none ${
              mobileBottomTab === "controls"
                ? "bg-[#a8d8ea]/20 text-[#a8d8ea] border-t-2 border-[#a8d8ea]"
                : "text-[#b8c5d1] hover:bg-[#a8d8ea]/10"
            }`}
          >
            <Crosshair className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMobileBottomTab("projects")}
            className={`flex-1 py-3 rounded-none ${
              mobileBottomTab === "projects"
                ? "bg-[#a8d8ea]/20 text-[#a8d8ea] border-t-2 border-[#a8d8ea]"
                : "text-[#b8c5d1] hover:bg-[#a8d8ea]/10"
            }`}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMobileBottomTab("stats")}
            className={`flex-1 py-3 rounded-none ${
              mobileBottomTab === "stats"
                ? "bg-[#a8d8ea]/20 text-[#a8d8ea] border-t-2 border-[#a8d8ea]"
                : "text-[#b8c5d1] hover:bg-[#a8d8ea]/10"
            }`}
          >
            <Building className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMobileBottomTab("archive")}
            className={`flex-1 py-3 rounded-none ${
              mobileBottomTab === "archive"
                ? "bg-[#a8d8ea]/20 text-[#a8d8ea] border-t-2 border-[#a8d8ea]"
                : "text-[#b8c5d1] hover:bg-[#a8d8ea]/10"
            }`}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Content */}
        <div className="max-h-48 overflow-y-auto">
          {mobileBottomTab === "controls" && (
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 w-fit mx-auto mb-4">
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("up")}
                  className="h-10 w-10 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("left")}
                  className="h-10 w-10 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-[#a8d8ea] to-[#87ceeb] rounded-full"></div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("right")}
                  className="h-10 w-10 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("down")}
                  className="h-10 w-10 p-0 text-[#a8d8ea] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div></div>
              </div>
              <div className="text-center">
                <div className="text-[#e8f4f8] text-sm font-mono mb-1">{currentSectorName}</div>
                <div className="text-[#a8d8ea] text-xs font-mono">Targets: {filteredAnomalies.length}/15</div>
              </div>
            </div>
          )}

          {mobileBottomTab === "projects" && (
            <div className="p-4 space-y-2">
              <Button
                variant={!selectedProject ? "default" : "ghost"}
                className={`w-full justify-start text-xs font-mono ${
                  !selectedProject
                    ? "bg-[#a8d8ea] text-[#1a1a2e]"
                    : "text-[#e8f4f8] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                }`}
                onClick={() => selectProject(null)}
              >
                <Star className="h-3 w-3 mr-2" />
                ALL PROJECTS ({getSectorAnomaliesForProject(null).length})
              </Button>

              {projects.map((project) => {
                const sectorCount = getSectorAnomaliesForProject(project.id).length
                return (
                  <Button
                    key={project.id}
                    variant={selectedProject?.id === project.id ? "default" : "ghost"}
                    className={`w-full justify-start text-xs font-mono ${
                      selectedProject?.id === project.id
                        ? "bg-[#a8d8ea] text-[#1a1a2e]"
                        : "text-[#e8f4f8] hover:bg-[#a8d8ea]/20 border border-[#a8d8ea]/30"
                    }`}
                    onClick={() => selectProject(project)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-3 h-3 rounded-full" style={{ background: project.bgGradient }} />
                      <span className="flex-1 text-left truncate">{project.name}</span>
                      <span className="text-xs">({sectorCount})</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          )}

          {mobileBottomTab === "stats" && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#e8f4f8] font-mono">{classifications.length}</div>
                  <div className="text-xs text-[#a8d8ea] font-mono">YOUR FINDS</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#a8d8ea] font-mono">{allClassifications.length}</div>
                  <div className="text-xs text-[#a8d8ea] font-mono">TOTAL FINDS</div>
                </div>
              </div>
              <div className="space-y-2">
                {classifications.slice(0, 3).map((classification) => (
                  <div
                    key={classification.id}
                    className="bg-[#1a1a2e]/60 border border-[#a8d8ea]/20 rounded p-2 cursor-pointer"
                    onClick={() => handleViewClassification(classification)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#e8f4f8] text-xs font-mono">#{classification.id}</span>
                      <span className="text-[#a8d8ea] text-xs font-mono">
                        {classification.classificationtype?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mobileBottomTab === "archive" && (
            <div className="p-4">
              <Button
                onClick={() => setViewMode("discoveries")}
                className="w-full bg-[#a8d8ea] text-[#1a1a2e] hover:bg-[#87ceeb] font-mono"
              >
                <Archive className="h-4 w-4 mr-2" />
                VIEW ARCHIVE
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AnomalyDialog
        showClassifyDialog={showClassifyDialog}
        setShowClassifyDialog={setShowClassifyDialog}
        selectedAnomaly={selectedAnomaly}
        // handleClassify={handleClassify}
      />

      <AnomalyDetailDialog
        showDetailDialog={showDetailDialog}
        setShowDetailDialog={setShowDetailDialog}
        selectedAnomaly={selectedAnomaly}
        onClassify={() => {
          setShowDetailDialog(false)
          setShowClassifyDialog(true)
        }}
        config="telescope"
      />

      <ClassificationDetailDialog
        showDetailDialog={showClassificationDetailDialog}
        setShowDetailDialog={setShowClassificationDetailDialog}
        selectedClassification={selectedClassification}
        config="telescope"
      />
    </div>
  );
};


// const createClassification = async (anomalyId: string, classificationType: string) => {
  //   if (!session?.user?.id) return null

  //   try {
  //     const dbId = Number.parseInt(anomalyId.replace("db-", ""))
  //     const { data, error } = await supabase
  //       .from("classifications")
  //       .insert({
  //         author: session.user.id,
  //         anomaly: dbId,
  //         classificationtype: classificationType,
  //         content: `Classified as ${classificationType}`,
  //       })
  //       .select()
  //       .single()

  //     if (!error && data) {
  //       await Promise.all([fetchUserClassifications(), fetchAllClassifications()])
  //       return data
  //     }
  //   } catch (error) {
  //     console.error("Error creating classification:", error)
  //   }
  //   return null
  // }

  //   const handleClassify = async () => {
//     if (!selectedAnomaly || !session?.user?.id) return

//     // Map UI types to database classification types
//     const typeMapping = {
//       exoplanet: "planet",
//       sunspot: "sunspot",
//       asteroid: "asteroid",
//       accretion_disc: "disk",
//     }

//     const classificationType = typeMapping[selectedAnomaly.type] || "planet"
//     const result = await createClassification(selectedAnomaly.id, classificationType)

//     if (result) {
//       setAnomalies(
//         anomalies.map((a) =>
//           a.id === selectedAnomaly.id ? { ...a, classified: true, discoveryDate: new Date().toLocaleDateString() } : a,
//         ),
//       )
//       loadSector(currentSector.x, currentSector.y)
//     }

//     setShowClassifyDialog(false)
//     setSelectedAnomaly(null)
//   }