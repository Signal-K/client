"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import type { Anomaly, ViewMode } from "@/types/Structures/telescope"
import { projects } from "@/data/projects"
import { missions } from "@/data/missions"
import { generateSectorName, generateStars, generateSectorAnomalies } from "@/utils/Structures/Telescope/sector-utils"
import { ViewportHeader } from "@/components/Structures/Telescope/viewport-header"
import { ProjectPanel } from "@/components/Structures/Telescope/project-panel"
import { TelescopeView } from "@/components/Structures/Telescope/telescope-view"
import { DiscoveriesView } from "@/components/Structures/Telescope/discoveries-view"
import { AnomalyDialog } from "@/components/Structures/Telescope/anomaly-dialog"
import { AnomalyDetailDialog } from "@/components/Structures/Telescope/anomaly-detail-dialog"

export default function TelescopeViewport() {
  const [currentSector, setCurrentSector] = useState({ x: 0, y: 0 })
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([])
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
  const [allClassifiedAnomalies, setAllClassifiedAnomalies] = useState<Anomaly[]>([])
  const [focusedAnomaly, setFocusedAnomaly] = useState<Anomaly | null>(null)
  const [showAllDiscoveries, setShowAllDiscoveries] = useState(false)

  // Load sector data
  const loadSector = useCallback(
    (sectorX: number, sectorY: number) => {
      const sectorAnomalies = generateSectorAnomalies(sectorX, sectorY)
      const sectorStars = generateStars(sectorX, sectorY)

      setAnomalies(sectorAnomalies)
      setStars(sectorStars)

      // Apply current project filter
      if (selectedProject) {
        setFilteredAnomalies(sectorAnomalies.filter((a) => a.project === selectedProject.id))
      } else {
        setFilteredAnomalies(sectorAnomalies)
      }
    },
    [selectedProject],
  )

  useEffect(() => {
    loadSector(currentSector.x, currentSector.y)
  }, [currentSector, loadSector])

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

    if (project) {
      setFilteredAnomalies(anomalies.filter((a) => a.project === project.id))
    } else {
      setFilteredAnomalies(anomalies)
    }

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

  const handleClassify = () => {
    if (!selectedAnomaly) return

    // Mark the anomaly as classified
    const updatedAnomalies = anomalies.map((a) =>
      a.id === selectedAnomaly.id ? { ...a, classified: true, discoveryDate: new Date().toLocaleDateString() } : a,
    )

    setAnomalies(updatedAnomalies)

    // Add to global classified anomalies
    const classifiedAnomaly = { ...selectedAnomaly, classified: true, discoveryDate: new Date().toLocaleDateString() }
    setAllClassifiedAnomalies((prev) => [...prev.filter((a) => a.id !== selectedAnomaly.id), classifiedAnomaly])

    // Update filtered anomalies
    if (selectedProject) {
      setFilteredAnomalies(updatedAnomalies.filter((a) => a.project === selectedProject.id))
    } else {
      setFilteredAnomalies(updatedAnomalies)
    }

    setShowClassifyDialog(false)
    setSelectedAnomaly(null)
  }

  const toggleProjectPanel = () => {
    setShowProjectPanel(!showProjectPanel)
  }

  const currentSectorName = generateSectorName(currentSector.x, currentSector.y)
  const classifiedAnomalies = allClassifiedAnomalies.concat(anomalies.filter((a) => a.classified))
  const projectMissions = missions.filter((m) => !selectedProject || m.project === selectedProject.id)
  const availableMissions = projectMissions.filter((m) => !m.completed)

  return (
    <div className="h-screen bg-[#2E3440] flex flex-col overflow-hidden">
      {/* Header */}
      <ViewportHeader
        selectedProject={selectedProject}
        viewMode={viewMode}
        toggleProjectPanel={toggleProjectPanel}
        setViewMode={setViewMode}
        classifiedCount={classifiedAnomalies.length}
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
            classifiedAnomalies={classifiedAnomalies}
            projectMissions={projectMissions}
            selectedProject={selectedProject}
            onBack={() => setViewMode("viewport")}
            onViewAnomaly={handleViewAnomaly}
            showAllDiscoveries={showAllDiscoveries}
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
}
