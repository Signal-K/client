"use client"

import React, { useState, useEffect, useCallback } from "react"
import type { Anomaly, ViewMode } from "@/types/Structures/telescope"
import type { projects } from "@/src/shared/data/projects"
import { missions } from "@/src/components/deployment/missions/data"
import { generateSectorName, generateStars, filterAnomaliesBySector } from "@/src/components/classification/telescope/utils/sector-utils"
import { TelescopeView } from "./telescope-view"
import { DiscoveriesView } from "./discoveries-view"
import { SkillTreeView } from "./blocks/skill-tree/skill-tree-view"
import AnomalyDialog from "./anomaly-dialogue"
import { ClassificationDetailDialog } from "../viewport/classification-detail-dialog"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Menu } from "lucide-react"
import { DatabaseClassification } from "./blocks/types"
import { useDatabaseOperations } from "./blocks/viewport/db-ops"
import { MobileMenu } from "./blocks/viewport/mobile-menu"
import { LeftSidebar } from "./blocks/viewport/left-sidebar"
import { RightSidebar } from "./blocks/viewport/right-sidebar"

type ExtendedViewMode = ViewMode | "skill-tree"

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  color: string
  twinkleSpeed: number
}

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
  showAllAnomalies: boolean
  stars: Star[]
  viewMode: "viewport" | "discoveries" | "skill-tree"
  isDragging: boolean
  dragStart: { x: number; y: number }
  focusedAnomaly: any | null
  showAllDiscoveries: boolean
  loading: boolean
  mobileMenuOpen: boolean
}

const TelescopeViewport: React.FC = () => {
  const databaseOps = useDatabaseOperations()

  const initialState: TelescopeViewportState = {
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
    showAllAnomalies: false,
    stars: [],
    viewMode: "viewport",
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    focusedAnomaly: null,
    showAllDiscoveries: false,
    loading: true,
    mobileMenuOpen: false,
  }

  const [viewportState, setViewportState] = useState<TelescopeViewportState>(initialState)

  const createBackgroundAnomalies = (sectorX: number, sectorY: number, count: number) => {
    const backgroundItems = []
    const seedValue = Math.abs(sectorX * 1000 + sectorY)
    
    for (let index = 0; index < count; index++) {
      const itemSeed = seedValue + index
      const xPos = (Math.sin(itemSeed * 0.1) * 0.5 + 0.5) * 80 + 10
      const yPos = (Math.cos(itemSeed * 0.13) * 0.5 + 0.5) * 80 + 10
      
      backgroundItems.push({
        id: `background-${sectorX}-${sectorY}-${index}`,
        name: `Background Star ${itemSeed}`,
        type: "background",
        x: xPos,
        y: yPos,
        brightness: Math.sin(itemSeed * 0.2) * 0.3 + 0.4,
        size: Math.cos(itemSeed * 0.15) * 0.3 + 0.4,
        color: "rgba(120, 204, 226, 0.4)",
        shape: "circle" as const,
        sector: generateSectorName(sectorX, sectorY),
        isBackground: true,
        classified: false,
        glowIntensity: 0.2,
        pulseSpeed: 0.5,
        project: "background",
      })
    }
    
    return backgroundItems
  }

  const updateSectorData = useCallback(
    (sectorX: number, sectorY: number) => {
      const sectorName = generateSectorName(sectorX, sectorY)
      const starField = generateStars(sectorX, sectorY)
      const sectorAnomalies = filterAnomaliesBySector(viewportState.anomalies, sectorX, sectorY)
      
      let filteredItems = viewportState.selectedProject
        ? sectorAnomalies.filter((item) => item.project === viewportState.selectedProject.id)
        : sectorAnomalies

      if (filteredItems.length === 0 && viewportState.anomalies.length > 0) {
        console.log("🔭 No anomalies in current sector, showing fallback items")
        filteredItems = viewportState.anomalies.slice(0, 5)
      }

      if (viewportState.showAllAnomalies) {
        const backgroundItems = createBackgroundAnomalies(sectorX, sectorY, 20)
        filteredItems = [...filteredItems, ...backgroundItems as any[]]
      }

      filteredItems = filteredItems.slice(0, viewportState.showAllAnomalies ? 25 : 10)

      setViewportState((prev) => {
        const selectedExists = filteredItems.find(item => item.id === prev.selectedAnomaly?.id)
        const realAnomalies = filteredItems.filter(item => !(item as any).isBackground)
        const newSelection = selectedExists ? prev.selectedAnomaly : (realAnomalies.length > 0 ? realAnomalies[0] : null)
        
        return {
          ...prev,
          stars: starField,
          filteredAnomalies: filteredItems,
          selectedAnomaly: newSelection,
        }
      })
    },
    [viewportState.anomalies, viewportState.selectedProject, viewportState.showAllAnomalies],
  )

  const loadViewportData = async () => {
    setViewportState((prev) => ({ ...prev, loading: true }))

    try {
      const [anomaliesData, userClassData, allClassData] = await Promise.all([
        databaseOps.fetchAnomalies(),
        databaseOps.fetchUserClassifications(),
        databaseOps.fetchAllClassifications(),
      ])

      console.log("🔭 TELESCOPE DEBUG: Loaded anomalies:", anomaliesData.length)
      console.log("🔭 TELESCOPE DEBUG: Anomaly data:", anomaliesData)

      // Auto-select first anomaly if we have any AND show the modal
      const firstAnomaly = anomaliesData.length > 0 ? anomaliesData[0] : null

      setViewportState((prev) => ({
        ...prev,
        anomalies: anomaliesData,
        classifications: userClassData,
        allClassifications: allClassData,
        selectedAnomaly: firstAnomaly,
        showClassifyDialog: firstAnomaly !== null,
        loading: false,
      }))
    } catch (error) {
      console.error("Failed to load viewport data:", error)
      setViewportState((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleMouseDownEvent = (event: React.MouseEvent) => {
    setViewportState((prev) => ({
      ...prev,
      dragStart: { x: event.clientX, y: event.clientY },
    }))
  }

  const handleMouseMoveEvent = (event: React.MouseEvent) => {
    if (!viewportState.dragStart.x && !viewportState.dragStart.y) return

    const deltaX = event.clientX - viewportState.dragStart.x
    const deltaY = event.clientY - viewportState.dragStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Only start dragging if moved more than 10 pixels
    if (distance > 10 && !viewportState.isDragging) {
      setViewportState((prev) => ({ ...prev, isDragging: true }))
    }

    if (viewportState.isDragging && (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50)) {
      setViewportState((prev) => ({
        ...prev,
        currentSector: {
          x: prev.currentSector.x - Math.sign(deltaX),
          y: prev.currentSector.y - Math.sign(deltaY),
        },
        dragStart: { x: event.clientX, y: event.clientY },
      }))
    }
  }

  const handleMouseUpEvent = () => {
    setViewportState((prev) => ({ 
      ...prev, 
      isDragging: false,
      dragStart: { x: 0, y: 0 }
    }))
  }

  const onAnomalyClick = (anomaly: Anomaly) => {
    if (viewportState.isDragging) return
    if ((anomaly as any).isBackground) return

    setViewportState((prev) => ({
      ...prev,
      selectedAnomaly: anomaly,
      showClassifyDialog: true,
    }))
  }

  const onViewAnomaly = (anomaly: Anomaly) => {
    setViewportState((prev) => ({
      ...prev,
      viewMode: "viewport",
      focusedAnomaly: anomaly,
      selectedAnomaly: anomaly,
    }))
  }

  const onViewClassification = (classification: DatabaseClassification) => {
    setViewportState((prev) => ({
      ...prev,
      selectedClassification: classification,
      showClassificationDetailDialog: true,
    }))
  }

  const performClassification = async () => {
    if (!viewportState.selectedAnomaly) return

    const typeMap = {
      exoplanet: "planet",
      sunspot: "sunspot",
      asteroid: "asteroid",
      accretion_disc: "disk",
    } as const

    const classType = typeMap[viewportState.selectedAnomaly?.type as keyof typeof typeMap] || "planet"
    const result = await databaseOps.createClassification(viewportState.selectedAnomaly.id, classType)

    if (result) {
      setViewportState((prev) => ({
        ...prev,
        anomalies: prev.anomalies.map((item) =>
          item.id === prev.selectedAnomaly?.id
            ? { ...item, classified: true, discoveryDate: new Date().toLocaleDateString() }
            : item,
        ),
        showClassifyDialog: false,
        selectedAnomaly: null,
      }))

      await loadViewportData()
      updateSectorData(viewportState.currentSector.x, viewportState.currentSector.y)
    }
  }

  const onProjectSelect = (project: (typeof projects)[0] | null) => {
    setViewportState((prev) => ({ ...prev, selectedProject: project }))
  }

  const onNavigate = (direction: "up" | "down" | "left" | "right") => {
    const newSector = { ...viewportState.currentSector }
    if (direction === "up") newSector.y -= 1
    else if (direction === "down") newSector.y += 1
    else if (direction === "left") newSector.x -= 1
    else if (direction === "right") newSector.x += 1
    
    setViewportState((prev) => ({ ...prev, currentSector: newSector }))
  }

  const onViewModeChange = (mode: ExtendedViewMode) => {
    setViewportState((prev) => ({ ...prev, viewMode: mode }))
  }

  const onDiscoveriesToggle = (show: boolean) => {
    setViewportState((prev) => ({ ...prev, showAllDiscoveries: show }))
  }

  const onMobileMenuToggle = (open: boolean) => {
    setViewportState((prev) => ({ ...prev, mobileMenuOpen: open }))
  }

  const onAnomaliesToggle = (show: boolean) => {
    setViewportState((prev) => ({ ...prev, showAllAnomalies: show }))
  }

  const getSectorProjectAnomalies = (projectId: string | null) => {
    const sectorItems = filterAnomaliesBySector(
      viewportState.anomalies, 
      viewportState.currentSector.x, 
      viewportState.currentSector.y
    )
    let projectItems = projectId ? sectorItems.filter((item) => item.project === projectId) : sectorItems
    
    if (projectItems.length === 0 && viewportState.anomalies.length > 0) {
      const allItems = projectId ? viewportState.anomalies.filter((item) => item.project === projectId) : viewportState.anomalies
      return allItems
    }
    
    return projectItems
  }

  useEffect(() => {
    loadViewportData()
  }, [])

  useEffect(() => {
    if (!viewportState.loading) {
      updateSectorData(viewportState.currentSector.x, viewportState.currentSector.y)
    }
  }, [viewportState.currentSector, updateSectorData, viewportState.loading])

  const currentSectorName = generateSectorName(viewportState.currentSector.x, viewportState.currentSector.y)
  const projectMissions = missions.filter((mission) => !viewportState.selectedProject || mission.project === viewportState.selectedProject.id)
  const availableMissions = projectMissions.filter((mission) => !mission.completed)

  if (viewportState.loading) {
    return (
      <div className="h-screen bg-[#002439] flex items-center justify-center">
        <div className="text-[#78cce2] font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#002439] flex flex-col overflow-hidden">
      <div className="lg:hidden flex items-center justify-between p-2 bg-[#005066]/95 border-b border-[#78cce2]/30 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMobileMenuToggle(!viewportState.mobileMenuOpen)}
          className="text-[#78cce2] hover:bg-[#4e7988]/50"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h1 className="text-[#e4eff0] font-bold text-sm tracking-wider">TELESCOPE</h1>
          <p className="text-[#78cce2] text-xs font-mono">{currentSectorName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#78cce2] text-[#002439] text-xs px-2 py-1 font-mono">
            {viewportState.classifications.length}
          </Badge>
        </div>
      </div>

      <MobileMenu
        mobileMenuOpen={viewportState.mobileMenuOpen}
        setMobileMenuOpen={onMobileMenuToggle}
        viewMode={viewportState.viewMode}
        setViewMode={onViewModeChange}
        selectedProject={viewportState.selectedProject}
        selectProject={onProjectSelect}
        handleNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <LeftSidebar
          currentSectorName={currentSectorName}
          filteredAnomalies={viewportState.filteredAnomalies}
          classifications={viewportState.classifications}
          viewMode={viewportState.viewMode}
          setViewMode={onViewModeChange}
          selectedProject={viewportState.selectedProject}
          selectProject={onProjectSelect}
          handleNavigate={onNavigate}
          getSectorAnomaliesForProject={getSectorProjectAnomalies}
          showAllAnomalies={viewportState.showAllAnomalies}
          setShowAllAnomalies={onAnomaliesToggle}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {viewportState.viewMode === "viewport" && (
            <TelescopeView
              stars={viewportState.stars}
              filteredAnomalies={viewportState.filteredAnomalies}
              isDragging={viewportState.isDragging}
              handleMouseDown={handleMouseDownEvent}
              handleMouseMove={handleMouseMoveEvent}
              handleMouseUp={handleMouseUpEvent}
              handleAnomalyClick={onAnomalyClick}
              currentSectorName={currentSectorName}
              focusedAnomaly={viewportState.focusedAnomaly}
              anomalies={viewportState.anomalies}
            />
          )}
          {viewportState.viewMode === "discoveries" && (
            <DiscoveriesView
              classifications={viewportState.classifications || []}
              allClassifications={viewportState.allClassifications || []}
              projectMissions={projectMissions}
              selectedProject={viewportState.selectedProject}
              onBack={() => onViewModeChange("viewport")}
              onViewAnomaly={onViewAnomaly}
              onViewClassification={onViewClassification}
              showAllDiscoveries={viewportState.showAllDiscoveries}
              setShowAllDiscoveries={onDiscoveriesToggle}
              anomalies={viewportState.anomalies}
            />
          )}
          {viewportState.viewMode === "skill-tree" && (
            <SkillTreeView onBack={() => onViewModeChange("viewport")} />
          )}
        </div>

        <div className="overflow-y-auto">
          <RightSidebar
            anomalies={viewportState.anomalies}
            classifications={viewportState.classifications}
            allClassifications={viewportState.allClassifications}
            filteredAnomalies={viewportState.filteredAnomalies}
            availableMissions={availableMissions}
            selectedProject={viewportState.selectedProject}
            selectedAnomaly={viewportState.selectedAnomaly}
            getSectorAnomaliesForProject={getSectorProjectAnomalies}
            handleViewClassification={onViewClassification}
            onClassify={() => {
              setViewportState((prev) => ({
                ...prev,
                showClassifyDialog: true,
              }))
            }}
          />
        </div>
      </div>

      <AnomalyDialog
        showClassifyDialog={viewportState.showClassifyDialog}
        setShowClassifyDialog={(show) => setViewportState((prev) => ({ ...prev, showClassifyDialog: show }))}
        selectedAnomaly={viewportState.selectedAnomaly}
        handleClassify={performClassification}
      />

      <ClassificationDetailDialog
        showDetailDialog={viewportState.showClassificationDetailDialog}
        setShowDetailDialog={(show) => setViewportState((prev) => ({ ...prev, showClassificationDetailDialog: show }))}
        selectedClassification={viewportState.selectedClassification}
        config="telescope"
      />
    </div>
  )
}

export default TelescopeViewport
