"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "@/src/lib/auth/session-context"
import { useRouter } from "next/navigation"
import { TelescopeView } from "@/src/components/classification/telescope/telescope-view"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { generateSectorName, generateStars } from "@/src/components/classification/telescope/utils/sector-utils"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { CheckCircle, Telescope, X, Target, Info, Sun, ArrowLeft } from "lucide-react"
import DeploymentConfirmation from "./Telescope/DeploymentConfirmation"
import TelescopeDeploySidebar from "./Telescope/TelescopeDeploySidebar"
import { seededRandom1, generateAnomalyFromDBFactory, DatabaseAnomaly } from "./Telescope/TelescopeUtils"
import { fetchAnomalies as fetchAnomaliesAction, checkDeployment as checkDeploymentAction, loadSector as loadSectorAction, fetchSkillProgress as fetchSkillProgressAction, handleDeployAction } from "./Telescope/TelescopeActions"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background"
import { useUserPreferences, TelescopeFocusType } from "@/src/hooks/useUserPreferences"
 
export type DeploymentType = "stellar" | "planetary";

export default function DeployTelescopeViewport() {
  const session = useSession();

  const router = useRouter()
  
  // Get stored telescope focus preference
  const { preferences, setTelescopeFocus, isLoading: prefsLoading } = useUserPreferences();

  // Deployment type - defaults to "planetary" (most popular), can be changed via sidebar
  const [deploymentType, setDeploymentType] = useState<DeploymentType | null>(null)
  
  // Initialize from stored preferences or default to planetary
  useEffect(() => {
    if (!prefsLoading) {
      const storedFocus = preferences?.telescopeFocus as DeploymentType | null;
      const focusType = storedFocus || "planetary"; // Default to planetary
      setDeploymentType(focusType);
      
      // Save default preference if none was set
      if (!storedFocus) {
        setTelescopeFocus("planetary");
      }
    }
  }, [prefsLoading, preferences?.telescopeFocus, setTelescopeFocus]);

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

  const fetchAnomalies = async () => fetchAnomaliesAction(deploymentType, setTessAnomalies)

  const checkDeployment = async () => checkDeploymentAction(setAlreadyDeployed, setDeploymentMessage)

  const loadSector = useCallback((x: number, y: number) => loadSectorAction(x, y, tessAnomalies, setStars, setSectorAnomalies, generateAnomalyFromDB), [tessAnomalies, generateAnomalyFromDB])

    useEffect(() => {
    if (!session) return;
    (async () => fetchSkillProgressAction(setSkillProgress))()
  }, [session]);

  const handleDeploy = async () => {
    if (!session || !selectedSector || alreadyDeployed) return
    await handleDeployAction({ userId: session?.user?.id, selectedSector, deploymentType, tessAnomalies, setDeploying, setDeploymentResult, setShowConfirmation, setDeploymentMessage, setAlreadyDeployed, generateSectorName })
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

  // Toggle between stellar and planetary focus
  const handleToggleMissionType = () => {
    const newType: DeploymentType = deploymentType === "stellar" ? "planetary" : "stellar";
    setDeploymentType(newType);
    setTelescopeFocus(newType as TelescopeFocusType);
    setTessAnomalies([]);
    setSectorAnomalies([]);
    setSelectedSector(null);
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

  const { isDark } = UseDarkMode()

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        isDark 
          ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
          : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
      }`}>
        <div className={`text-xl font-mono ${isDark ? 'text-[#e4eff0]' : 'text-white'}`}>
          Loading telescope data....
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full w-full flex flex-col ${
      isDark 
        ? "bg-[#10141c]" 
        : "bg-gradient-to-br from-[#8ba3d1] via-[#9bb3e0] to-[#7a94c7]"
    }`}>
      {/* Main viewport area - similar to satellite layout */}
      <div className="flex-1 flex flex-row relative overflow-hidden h-full min-h-0 mt-14">
        {/* Telescope View with star field - takes up remaining space */}
        <div className="relative flex-1 flex items-center justify-center z-10 pb-48 md:pb-0">
          <div className="absolute inset-0 w-full h-full">
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

        {/* Right-side sidebar (desktop) */}
        <div className={`hidden md:flex flex-col h-full min-h-0 w-[370px] max-w-[370px] z-30 border-l ${
          isDark 
            ? "bg-[#002439]/95 border-[#78cce2]/30" 
            : "bg-white border-[#b0c4de]"
        }`}>
          <TelescopeDeploySidebar
            deploymentType={deploymentType}
            currentSector={currentSector}
            onMove={handleDPad}
            sectorAnomalies={sectorAnomalies}
            selectedSector={selectedSector}
            onSelectSector={() => setSelectedSector({ ...currentSector })}
            onDeploy={handleDeploy}
            isDeploying={deploying}
            alreadyDeployed={alreadyDeployed}
            deploymentMessage={deploymentMessage}
            onBackToTypeSelection={handleToggleMissionType}
            isDarkMode={isDark}
            tessAnomaliesCount={tessAnomalies.length}
          />
        </div>
      </div>

      {/* Mobile sidebar - Fixed bottom positioning */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <TelescopeDeploySidebar
          deploymentType={deploymentType}
          currentSector={currentSector}
          onMove={handleDPad}
          sectorAnomalies={sectorAnomalies}
          selectedSector={selectedSector}
          onSelectSector={() => setSelectedSector({ ...currentSector })}
          onDeploy={handleDeploy}
          isDeploying={deploying}
          alreadyDeployed={alreadyDeployed}
          deploymentMessage={deploymentMessage}
          onBackToTypeSelection={handleToggleMissionType}
          isMobile
          isDarkMode={isDark}
          tessAnomaliesCount={tessAnomalies.length}
        />
      </div>

      {/* Success confirmation overlay */}
      {showConfirmation && deploymentResult && (
        <DeploymentConfirmation deploymentResult={deploymentResult} onClose={handleConfirmationClose} />
      )}

      {/* Background texture */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 mt-14">
        <TelescopeBackground
          sectorX={currentSector.x}
          sectorY={currentSector.y}
          variant="default"
          isDarkTheme={isDark}
          showAllAnomalies={false}
        />
      </div>
    </div>
  )
}
