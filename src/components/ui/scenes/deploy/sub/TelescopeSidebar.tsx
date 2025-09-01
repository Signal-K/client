'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Switch } from "@/src/components/ui/switch"
import { 
  Zap, Target, Crosshair, ChevronDown, ChevronRight, 
  Navigation, Info, Settings2, ChevronUp, ChevronLeft,
  ArrowLeft, Sun, Moon, User, Telescope
} from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"

interface DatabaseAnomaly {
  id: number
  content: string | null
  anomalytype: string | null
  avatar_url: string | null
  created_at: string
  configuration: any
  parentAnomaly: number | null
  anomalySet: string | null
}

type LocalAnomaly = Anomaly & {
  dbData: DatabaseAnomaly
}

interface Props {
  sectorAnomalies: Anomaly[]
  tessAnomalies: DatabaseAnomaly[]
  selectedSector: { x: number; y: number } | null
  currentSector: { x: number; y: number }
  setCurrentSector: (val: { x: number; y: number }) => void
  setSelectedSector: (val: { x: number; y: number } | null) => void
  onDeploy: () => void
  alreadyDeployed: boolean
  deploying: boolean
  deploymentMessage: string | null
};

export default function DeployTelescopeSidebar({
  sectorAnomalies,
  tessAnomalies,
  selectedSector,
  currentSector,
  setCurrentSector,
  setSelectedSector,
  onDeploy,
  alreadyDeployed,
  deploying,
  deploymentMessage,
}: Props) {
  const router = useRouter()
  const { isDark, toggleDarkMode } = UseDarkMode()
  const [navExpanded, setNavExpanded] = useState(false)
  const [infoExpanded, setInfoExpanded] = useState(false)

  const handleNavigate = (direction: "up" | "down" | "left" | "right") => {
    const newSector = { ...currentSector };
    switch (direction) {
      case "up":
        newSector.y -= 1;
        break;
      case "down":
        newSector.y += 1;
        break;
      case "left":
        newSector.x -= 1;
        break;
      case "right":
        newSector.x += 1;
        break;
    };
    setCurrentSector(newSector);
  };

  const handleSectorSelect = () => {
    setSelectedSector({ ...currentSector });
  };

  return (
    <div className="bg-[#005066]/95 backdrop-blur-sm border-b border-[#78cce2]/30 h-16">
      {/* Main Control Bar - Simplified and Compact */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 h-full">
        {/* Left: Navigation and Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-md hover:bg-[#78cce2]/20 transition text-[#78cce2] flex-shrink-0"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Title and Status - Compact */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center">
              <Crosshair className="h-3 w-3 text-[#002439]" />
            </div>
            {/* <div className="min-w-0">
              <h1 className="text-[#e4eff0] font-medium text-sm leading-tight truncate">Telescope Deploy</h1>
              <div className="text-[#78cce2] text-xs flex items-center gap-2">
                <span className="font-mono">({currentSector.x}, {currentSector.y})</span>
                <span>•</span>
                <span>{sectorAnomalies.length} targets</span>
                {selectedSector && (
                  <>
                    <span>•</span>
                    <span className="text-[#f2c572]">Ready</span>
                  </>
                )}
              </div>
            </div> */}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Navigation Controls - Desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-[#002439]/50 rounded p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("left")}
              className="h-6 w-6 p-0 text-[#78cce2] hover:bg-[#78cce2]/20"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("up")}
              className="h-6 w-6 p-0 text-[#78cce2] hover:bg-[#78cce2]/20"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("down")}
              className="h-6 w-6 p-0 text-[#78cce2] hover:bg-[#78cce2]/20"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("right")}
              className="h-6 w-6 p-0 text-[#78cce2] hover:bg-[#78cce2]/20"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Action Buttons */}
          {!selectedSector && sectorAnomalies.length > 0 && (
            <Button
              onClick={handleSectorSelect}
              size="sm"
              className="bg-[#4e7988] text-[#e4eff0] hover:bg-[#78cce2] hover:text-[#002439] h-7 px-3 text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              Select
            </Button>
          )}

          {selectedSector && (
            <Button
              onClick={onDeploy}
              disabled={alreadyDeployed || deploying}
              size="sm"
              className="bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] h-7 px-3 text-xs font-medium"
            >
              {deploying ? (
                <>
                  <div className="w-3 h-3 border border-[#002439] border-t-transparent rounded-full animate-spin mr-1" />
                  Deploying...
                </>
              ) : alreadyDeployed ? (
                "Deployed"
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Deploy
                </>
              )}
            </Button>
          )}

          {/* Mobile/Info Toggles */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNavExpanded(!navExpanded)}
            className="lg:hidden h-7 w-7 p-0 text-[#78cce2] hover:bg-[#78cce2]/20"
          >
            <Navigation className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="h-7 w-7 p-0 text-[#78cce2] hover:bg-[#78cce2]/20"
          >
            <Info className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Mobile Status Bar - Removed to save space */}

      {/* Mobile Navigation Panel - Simplified */}
      {navExpanded && (
        <div className="lg:hidden bg-[#002439]/90 p-4 border-t border-[#78cce2]/30">
          <div className="flex flex-col gap-4">
            {/* Navigation Grid */}
            <div>
              <h3 className="text-[#e4eff0] font-medium text-sm mb-3 flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Navigate Sectors
              </h3>
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                <div></div>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate("up")}
                  className="h-10 w-10 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <div></div>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate("left")}
                  className="h-10 w-10 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 flex items-center justify-center text-[#78cce2] text-xs font-mono border border-[#78cce2]/20 rounded bg-[#78cce2]/10">
                  ({currentSector.x},{currentSector.y})
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate("right")}
                  className="h-10 w-10 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div></div>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate("down")}
                  className="h-10 w-10 p-0 text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                <div></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {!selectedSector && sectorAnomalies.length > 0 && (
                <Button
                  onClick={handleSectorSelect}
                  className="flex-1 bg-[#4e7988] text-[#e4eff0] hover:bg-[#78cce2] hover:text-[#002439] h-10"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Select Sector
                </Button>
              )}
              {selectedSector && (
                <Button
                  onClick={onDeploy}
                  disabled={alreadyDeployed || deploying}
                  className="flex-1 bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] h-10 font-medium"
                >
                  {deploying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#002439] border-t-transparent rounded-full animate-spin mr-2" />
                      Deploying...
                    </>
                  ) : alreadyDeployed ? (
                    "Deployed"
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Deploy
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Status */}
            <div className="bg-[#005066]/30 p-3 rounded-lg border border-[#78cce2]/30">
              <div className="text-sm">
                <div className="text-[#e4eff0] mb-1">
                  Targets in sector: <span className="text-[#78cce2] font-bold">{sectorAnomalies.length}</span>
                </div>
                {selectedSector && (
                  <div className="text-[#78cce2] text-xs">Ready to deploy telescope</div>
                )}
                {deploymentMessage && (
                  <div className="text-[#f2c572] text-xs mt-1">{deploymentMessage}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel - Condensed */}
      {infoExpanded && (
        <div className="bg-[#002439]/90 p-4 border-t border-[#78cce2]/30">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-[#e4eff0] font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                How to Deploy
              </h3>
              <div className="space-y-2 text-[#78cce2]">
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Navigate to find exoplanet candidates</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Select sector with targets</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Deploy telescope to monitor</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[#e4eff0] font-medium mb-2 flex items-center gap-2">
                <Telescope className="h-4 w-4" />
                Current Mission
              </h3>
              <div className="space-y-1 text-[#78cce2]">
                <div>Search for exoplanet transits</div>
                <div>Confirm planetary candidates</div>
                <div>Contribute to space discovery</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Navigation Panel */}
      {navExpanded && (
        <div className="border-t border-[#78cce2]/30 p-6 bg-[#002439]/50">
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-[#e4eff0] font-medium text-base mb-2">Navigate Space Sectors</h3>
              <p className="text-[#78cce2] text-sm">Use directional controls to explore different areas of space</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div></div>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleNavigate("up")}
                className="h-16 w-full text-[#78cce2] hover:bg-[#78cce2]/20 border-2 border-[#78cce2]/30 rounded-lg"
              >
                <ChevronUp className="h-8 w-8" />
              </Button>
              <div></div>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleNavigate("left")}
                className="h-16 w-full text-[#78cce2] hover:bg-[#78cce2]/20 border-2 border-[#78cce2]/30 rounded-lg"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 bg-[#78cce2] rounded-full animate-pulse"></div>
              </div>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleNavigate("right")}
                className="h-16 w-full text-[#78cce2] hover:bg-[#78cce2]/20 border-2 border-[#78cce2]/30 rounded-lg"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
              <div></div>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleNavigate("down")}
                className="h-16 w-full text-[#78cce2] hover:bg-[#78cce2]/20 border-2 border-[#78cce2]/30 rounded-lg"
              >
                <ChevronDown className="h-8 w-8" />
              </Button>
              <div></div>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleSectorSelect}
                size="lg"
                className="w-full bg-[#4e7988] text-[#e4eff0] hover:bg-[#78cce2] hover:text-[#002439] h-14 text-lg font-medium"
                disabled={sectorAnomalies.length === 0}
              >
                <Target className="h-6 w-6 mr-3" />
                {sectorAnomalies.length > 0 
                  ? `Select Sector (${sectorAnomalies.length} targets)` 
                  : "No targets in this sector"
                }
              </Button>
              <div className="text-center text-[#78cce2] text-sm bg-[#005066]/30 py-2 px-3 rounded border border-[#78cce2]/30">
                💡 Tip: You can also drag the star field directly to navigate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Info Panel */}
      {infoExpanded && (
        <div className="border-t border-[#78cce2]/30 p-4 bg-[#002439]/50">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* How to Use */}
            <Card className="bg-[#002439]/80 border border-[#78cce2]/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#e4eff0] text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#78cce2]" />
                  How to Deploy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span className="text-[#e4eff0]">Navigate space using arrow buttons or drag the star field</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span className="text-[#e4eff0]">Find a sector with potential targets (bright spots)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span className="text-[#e4eff0]">Click "Select Sector" to target the area</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-[#78cce2] text-[#002439] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span className="text-[#e4eff0]">Deploy telescope to begin monitoring</span>
                </div>
              </CardContent>
            </Card>

            {/* Mission Status */}
            <Card className="bg-[#002439]/80 border border-[#78cce2]/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#e4eff0] text-sm flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-[#78cce2]" />
                  Mission Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-[#78cce2]">{tessAnomalies.length}</div>
                    <div className="text-xs text-[#e4eff0]">Total Candidates</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#4e7988]">{sectorAnomalies.length}</div>
                    <div className="text-xs text-[#e4eff0]">Current View</div>
                  </div>
                </div>
                <div className="text-[#78cce2] text-xs pt-2 border-t border-[#78cce2]/20">
                  TESS (Transiting Exoplanet Survey Satellite) mission data
                </div>
              </CardContent>
            </Card>

            {/* Current Sector Info */}
            <Card className="bg-[#002439]/80 border border-[#78cce2]/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#e4eff0] text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#78cce2]" />
                  Sector Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-[#78cce2] text-sm font-mono">
                    Coordinates: ({currentSector.x}, {currentSector.y})
                  </div>
                  {sectorAnomalies.length > 0 ? (
                    <div className="bg-[#78cce2]/20 p-2 rounded border border-[#78cce2]/30">
                      <div className="text-[#78cce2] text-xs">
                        ✓ {sectorAnomalies.length} potential exoplanet candidates detected
                      </div>
                      {selectedSector ? (
                        <div className="text-[#e4eff0] text-xs mt-1">
                          Ready for telescope deployment
                        </div>
                      ) : (
                        <div className="text-[#e4eff0] text-xs mt-1">
                          Click "Select Sector" to target this area
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[#e4eff0] text-xs opacity-70 bg-[#005066]/20 p-2 rounded">
                      No candidates in this sector. Try navigating to different coordinates.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deploy Status */}
            <Card className="bg-[#002439]/80 border border-[#78cce2]/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#e4eff0] text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#78cce2]" />
                  Deployment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentMessage ? (
                  <div className="text-[#78cce2] text-sm leading-relaxed">
                    {deploymentMessage}
                  </div>
                ) : selectedSector ? (
                  <div className="space-y-2">
                    <div className="text-[#e4eff0] text-sm">
                      Ready to deploy on sector ({selectedSector.x}, {selectedSector.y})
                    </div>
                    <div className="text-[#78cce2] text-xs bg-[#78cce2]/10 p-2 rounded">
                      Deployment will monitor {sectorAnomalies.length} targets for exoplanet transits
                    </div>
                  </div>
                ) : (
                  <div className="text-[#e4eff0] text-sm opacity-70">
                    Select a sector with targets to enable deployment
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};