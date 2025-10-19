"use client"

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
import TypeSelection from "./Telescope/TypeSelection"
import DeploymentConfirmation from "./Telescope/DeploymentConfirmation"
import MissionInfoPanel from "./Telescope/MissionInfoPanel"
import DPadControls from "./Telescope/DPadControls"
import SectorStatusOverlay from "./Telescope/SectorStatusOverlay"
import { seededRandom1, generateAnomalyFromDBFactory, DatabaseAnomaly } from "./Telescope/TelescopeUtils"
import { fetchAnomalies as fetchAnomaliesAction, checkDeployment as checkDeploymentAction, loadSector as loadSectorAction, fetchSkillProgress as fetchSkillProgressAction, handleDeployAction } from "./Telescope/TelescopeActions"
 
export type DeploymentType = "stellar" | "planetary";

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

  const generateAnomalyFromDB = useCallback(
    generateAnomalyFromDBFactory(deploymentType),
    [deploymentType]
  )

  const fetchAnomalies = async () => fetchAnomaliesAction(supabase, deploymentType, session, setTessAnomalies)

  const checkDeployment = async () => checkDeploymentAction(supabase, session, setAlreadyDeployed, setDeploymentMessage)

  const loadSector = useCallback((x: number, y: number) => loadSectorAction(x, y, tessAnomalies, setStars, setSectorAnomalies, generateAnomalyFromDB), [tessAnomalies, generateAnomalyFromDB])

    useEffect(() => {
    if (!session) return;
    (async () => fetchSkillProgressAction(supabase, session, setSkillProgress))()
  }, [session]);

  const handleDeploy = async () => {
    if (!session || !selectedSector || alreadyDeployed) return
    await handleDeployAction({ supabase, session, selectedSector, deploymentType, tessAnomalies, setDeploying, setDeploymentResult, setShowConfirmation, setDeploymentMessage, setAlreadyDeployed, generateSectorName })
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

  if (showTypeSelection && !deploymentType) {
    return (
      <TypeSelection
        onChooseType={(t) => { setDeploymentType(t); setShowTypeSelection(false) }}
        onBack={() => router.push('/')}
        session={session}
      />
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


      <MissionInfoPanel deploymentType={deploymentType} tessAnomalies={tessAnomalies} />


      <DPadControls currentSector={currentSector} onMove={handleDPad} />


      <SectorStatusOverlay sectorAnomaliesLength={sectorAnomalies.length} deploymentType={deploymentType} loading={loading} />

      {showConfirmation && deploymentResult && (
        <DeploymentConfirmation deploymentResult={deploymentResult} onClose={handleConfirmationClose} />
      )}
    </div>
  )
}