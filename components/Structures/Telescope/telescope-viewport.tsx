"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import type { Anomaly, ViewMode } from "@/types/Structures/telescope"
import type { projects } from "@/data/projects"
import { missions } from "@/data/missions"
import { generateSectorName, generateStars, filterAnomaliesBySector } from "@/utils/Structures/Telescope/sector-utils"
import { TelescopeView } from "./telescope-view"
import { DiscoveriesView } from "./discoveries-view"
import { SkillTreeView } from "./blocks/skill-tree/skill-tree-view"
import AnomalyDialog from "./anomaly-dialogue"
import { AnomalyDetailDialog } from "../Viewport/anomaly-detail-dialogue"
import { ClassificationDetailDialog } from "../Viewport/classification-detail-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu } from "lucide-react"
import { DatabaseClassification } from "./blocks/types"
import { useDatabaseOperations } from "./blocks/viewport/db-ops"
import { MobileMenu } from "./blocks/viewport/mobile-menu"
import { LeftSidebar } from "./blocks/viewport/left-sidebar"
import { RightSidebar } from "./blocks/viewport/right-sidebar"

type ExtendedViewMode = ViewMode | "skill-tree";

export interface TelescopeViewportState {
  currentSector: { x: number; y: number }
  anomalies: any[]
  filteredAnomalies: any[]
  classifications: DatabaseClassification[]
  allClassifications: DatabaseClassification[]
  selectedProject: any | null
  selectedAnomaly: any | null
  selectedClassification: DatabaseClassification | null
  showClassifyDialog: boolean
  showDetailDialog: boolean
  showClassificationDetailDialog: boolean
  stars: Array<{
    x: number
    y: number
    size: number
    opacity: number
    color: string
    twinkleSpeed: number
  }>
  viewMode: "viewport" | "discoveries" | "skill-tree"
  isDragging: boolean
  dragStart: { x: number; y: number }
  focusedAnomaly: any | null
  showAllDiscoveries: boolean
  loading: boolean
  mobileMenuOpen: boolean
};

export default function TelescopeViewport() {
  const session = useSession();

  const { fetchAnomalies, fetchUserClassifications, fetchAllClassifications, createClassification } =
    useDatabaseOperations()

  // State management
  const [state, setState] = useState<TelescopeViewportState>({
    currentSector: { x: 0, y: 0 },
    anomalies: [],
    filteredAnomalies: [],
    classifications: [],
    allClassifications: [],
    selectedProject: null,
    selectedAnomaly: null,
    selectedClassification: null,
    showClassifyDialog: false,
    showDetailDialog: false,
    showClassificationDetailDialog: false,
    stars: [],
    viewMode: "viewport",
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    focusedAnomaly: null,
    showAllDiscoveries: false,
    loading: true,
    mobileMenuOpen: false,
  })

  // Sector management
  const loadSector = useCallback(
    (sectorX: number, sectorY: number) => {
      const sectorStars = generateStars(sectorX, sectorY)
      const sectorAnomalies = filterAnomaliesBySector(state.anomalies, sectorX, sectorY)
      let filtered = state.selectedProject
        ? sectorAnomalies.filter((a) => a.project === state.selectedProject.id)
        : sectorAnomalies

      // Limit to 10 anomalies per sector view
      filtered = filtered.slice(0, 10)

      setState((prev) => ({
        ...prev,
        stars: sectorStars,
        filteredAnomalies: filtered,
      }))
    },
    [state.anomalies, state.selectedProject],
  )

  // Data loading
  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true }))

    const userId = session?.user?.id || "4d9a57e6-ea3c-4836-aa18-1c3ee7f6f725"

    const [anomalies, userClassifications, allClassifications] = await Promise.all([
      fetchAnomalies(),
      fetchUserClassifications(),
      fetchAllClassifications(),
    ])

    setState((prev) => ({
      ...prev,
      anomalies,
      classifications: userClassifications,
      allClassifications,
      loading: false,
    }))
  }

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
    }))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!state.isDragging) return

    const deltaX = e.clientX - state.dragStart.x
    const deltaY = e.clientY - state.dragStart.y

    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      setState((prev) => ({
        ...prev,
        currentSector: {
          x: prev.currentSector.x - Math.sign(deltaX),
          y: prev.currentSector.y - Math.sign(deltaY),
        },
        dragStart: { x: e.clientX, y: e.clientY },
      }))
    }
  }

  const handleMouseUp = () => {
    setState((prev) => ({ ...prev, isDragging: false }))
  }

  const handleAnomalyClick = (anomaly: Anomaly) => {
    if (state.isDragging) return

    setState((prev) => ({
      ...prev,
      selectedAnomaly: anomaly,
      showDetailDialog: anomaly.classified || false,
      showClassifyDialog: !anomaly.classified,
    }))
  }

  const handleViewAnomaly = (anomaly: Anomaly) => {
    setState((prev) => ({
      ...prev,
      viewMode: "viewport",
      focusedAnomaly: anomaly,
      selectedAnomaly: anomaly,
    }))
    setTimeout(() => {
      setState((prev) => ({ ...prev, showDetailDialog: true }))
    }, 500)
  }

  const handleViewClassification = (classification: DatabaseClassification) => {
    setState((prev) => ({
      ...prev,
      selectedClassification: classification,
      showClassificationDetailDialog: true,
    }))
  }

  const handleClassify = async () => {
    if (!state.selectedAnomaly) return

    const userId = session?.user?.id || "4d9a57e6-ea3c-4836-aa18-1c3ee7f6f725"

    // Map UI types to database classification types
    const typeMapping = {
      exoplanet: "planet",
      sunspot: "sunspot",
      asteroid: "asteroid",
      accretion_disc: "disk",
    }

    const classificationType = typeMapping[state.selectedAnomaly?.type as keyof typeof typeMapping] || "planet"
    const result = await createClassification(state.selectedAnomaly.id, classificationType, userId)

    if (result) {
      setState((prev) => ({
        ...prev,
        anomalies: prev.anomalies.map((a) =>
          a.id === prev.selectedAnomaly?.id
            ? { ...a, classified: true, discoveryDate: new Date().toLocaleDateString() }
            : a,
        ),
        showClassifyDialog: false,
        selectedAnomaly: null,
      }))

      // Reload data
      await loadData()
      loadSector(state.currentSector.x, state.currentSector.y)
    }
  }

  const selectProject = (project: (typeof projects)[0] | null) => {
    setState((prev) => ({ ...prev, selectedProject: project }))
  }

  const handleNavigate = (direction: "up" | "down" | "left" | "right") => {
    const newSector = { ...state.currentSector }
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
    setState((prev) => ({ ...prev, currentSector: newSector }))
  }

  const setViewMode = (mode: ExtendedViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }))
  }

  const setShowAllDiscoveries = (show: boolean) => {
    setState((prev) => ({ ...prev, showAllDiscoveries: show }))
  }

  const setMobileMenuOpen = (open: boolean) => {
    setState((prev) => ({ ...prev, mobileMenuOpen: open }))
  }

  // Effects
  useEffect(() => {
    loadData()
  }, [session])

  useEffect(() => {
    if (!state.loading) {
      loadSector(state.currentSector.x, state.currentSector.y)
    }
  }, [state.currentSector, loadSector, state.loading])

  useEffect(() => {
    if (!state.loading && state.anomalies.length > 0) {
      const alreadyClassifiedIds = new Set(state.classifications.map((c) => `db-${c.anomaly}`))
      const unclassified = state.anomalies.filter((a) => !alreadyClassifiedIds.has(a.id))
      const pool = unclassified.length > 0 ? unclassified : state.anomalies
      const randomAnomaly = pool[Math.floor(Math.random() * pool.length)]

      if (randomAnomaly) {
        setState((prev) => ({
          ...prev,
          selectedAnomaly: randomAnomaly,
          showDetailDialog: randomAnomaly.classified || false,
          showClassifyDialog: !randomAnomaly.classified,
        }))
      }
    }
  }, [state.loading, state.anomalies, state.classifications])

  // Computed values
  const currentSectorName = generateSectorName(state.currentSector.x, state.currentSector.y)
  const projectMissions = missions.filter((m) => !state.selectedProject || m.project === state.selectedProject.id)
  const availableMissions = projectMissions.filter((m) => !m.completed)

  // Get sector-specific counts for projects
  const getSectorAnomaliesForProject = (projectId: string | null) => {
    const sectorAnomalies = filterAnomaliesBySector(state.anomalies, state.currentSector.x, state.currentSector.y)
    return projectId ? sectorAnomalies.filter((a) => a.project === projectId) : sectorAnomalies
  }

  if (state.loading) {
    return (
      <div className="h-screen bg-[#002439] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#78cce2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#e4eff0] text-lg font-mono">INITIALIZING TELESCOPE ARRAY...</div>
          <div className="text-[#78cce2] text-sm mt-2">Loading deep space data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#002439] flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-2 bg-[#005066]/95 border-b border-[#78cce2]/30 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!state.mobileMenuOpen)}
          className="text-[#78cce2] hover:bg-[#4e7988]/50"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h1 className="text-[#e4eff0] font-bold text-sm tracking-wider">DEEP SPACE OBSERVATORY</h1>
          <p className="text-[#78cce2] text-xs font-mono">{currentSectorName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#78cce2] text-[#002439] text-xs px-2 py-1 font-mono">
            {state.classifications.length}
          </Badge>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        mobileMenuOpen={state.mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        viewMode={state.viewMode}
        setViewMode={setViewMode}
        selectedProject={state.selectedProject}
        selectProject={selectProject}
        handleNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Desktop Left Sidebar */}
        <LeftSidebar
          currentSectorName={currentSectorName}
          filteredAnomalies={state.filteredAnomalies}
          classifications={state.classifications}
          viewMode={state.viewMode}
          setViewMode={setViewMode}
          selectedProject={state.selectedProject}
          selectProject={selectProject}
          handleNavigate={handleNavigate}
          getSectorAnomaliesForProject={getSectorAnomaliesForProject}
        />

        {/* Main Viewport */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          {/* Telescope Frame - Hidden on mobile */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-10">
            {/* Outer Ring */}
            <div className="absolute inset-6 border-4 border-[#005066] rounded-full shadow-2xl">
              {/* Inner Ring */}
              <div className="absolute inset-3 border-2 border-[#78cce2]/50 rounded-full">
                {/* Crosshair Lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#78cce2]/30 to-transparent transform -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#78cce2]/30 to-transparent transform -translate-x-1/2"></div>

                {/* Corner Markers */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#78cce2]/60"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#78cce2]/60"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#78cce2]/60"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#78cce2]/60"></div>

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-[#78cce2] rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#78cce2] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Telescope Markings */}
            <div className="absolute top-8 left-8 text-[#78cce2] font-mono text-xs">
              <div>MAGNIFICATION: 1000x</div>
              <div>FIELD: {currentSectorName}</div>
            </div>

            <div className="absolute top-8 right-8 text-[#78cce2] font-mono text-xs text-right">
              <div>TARGETS: {state.filteredAnomalies.length}</div>
              <div>STATUS: SCANNING</div>
            </div>
          </div>

          {state.viewMode === "viewport" ? (
            <TelescopeView
              stars={state.stars}
              filteredAnomalies={state.filteredAnomalies}
              isDragging={state.isDragging}
              handleMouseDown={handleMouseDown}
              handleMouseMove={handleMouseMove}
              handleMouseUp={handleMouseUp}
              handleAnomalyClick={handleAnomalyClick}
              currentSectorName={currentSectorName}
              focusedAnomaly={state.focusedAnomaly}
              anomalies={state.anomalies}
            />
          ) : state.viewMode === "discoveries" ? (
            <DiscoveriesView
              classifications={state.classifications || []}
              allClassifications={state.allClassifications || []}
              projectMissions={projectMissions}
              selectedProject={state.selectedProject}
              onBack={() => setViewMode("viewport")}
              onViewAnomaly={handleViewAnomaly}
              onViewClassification={handleViewClassification}
              showAllDiscoveries={state.showAllDiscoveries}
              setShowAllDiscoveries={setShowAllDiscoveries}
              anomalies={state.anomalies}
            />
          ) : state.viewMode === "skill-tree" ? (
            <SkillTreeView onBack={() => setViewMode("viewport")} />
          ) : null}
        </div>

        {/* Desktop Right Sidebar */}
        <RightSidebar
          anomalies={state.anomalies}
          classifications={state.classifications}
          allClassifications={state.allClassifications}
          filteredAnomalies={state.filteredAnomalies}
          availableMissions={availableMissions}
          selectedProject={state.selectedProject}
          getSectorAnomaliesForProject={getSectorAnomaliesForProject}
          handleViewClassification={handleViewClassification}
        />
      </div>

      {/* Dialogs */}
      <AnomalyDialog
        showClassifyDialog={state.showClassifyDialog}
        setShowClassifyDialog={(show) => setState((prev) => ({ ...prev, showClassifyDialog: show }))}
        selectedAnomaly={state.selectedAnomaly}
        handleClassify={handleClassify}
      />

      <AnomalyDetailDialog
        showDetailDialog={state.showDetailDialog}
        setShowDetailDialog={(show) => setState((prev) => ({ ...prev, showDetailDialog: show }))}
        selectedAnomaly={state.selectedAnomaly}
        onClassify={() => {
          setState((prev) => ({
            ...prev,
            showDetailDialog: false,
            showClassifyDialog: true,
          }))
        }}
        config="telescope"
      />

      <ClassificationDetailDialog
        showDetailDialog={state.showClassificationDetailDialog}
        setShowDetailDialog={(show) => setState((prev) => ({ ...prev, showClassificationDetailDialog: show }))}
        selectedClassification={state.selectedClassification}
        config="telescope"
      />
    </div>
  )
};