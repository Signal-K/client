'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Target, Crosshair, ChevronUp, ChevronDown } from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope"
import DeployTelescopeViewportNavigationControls from "./TelescopeNavControls"

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
  const [mobileExpanded, setMobileExpanded] = useState(false)

  return (
    <div
      className={`
        lg:relative lg:w-80 lg:h-full
        fixed bottom-0 left-0 w-full
        bg-[#005066]/95 border-t-4 lg:border-t-0 lg:border-r-4 border-[#78cce2]/30
        flex flex-col
        transition-all duration-300
        ${mobileExpanded ? "h-[70vh]" : "h-[48px]"}
        overflow-hidden
      `}
    >
      {/* Mobile Toggle */}
      <div className="lg:hidden flex justify-center items-center p-2 bg-[#00374d] border-t border-[#78cce2]/30">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="text-[#78cce2] text-sm flex items-center gap-1"
        >
          {mobileExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          {mobileExpanded ? "Hide Controls" : "Show Controls"}
        </button>
      </div>

      {/* Sidebar Content */}
      <div className={`flex-1 overflow-y-auto ${mobileExpanded ? "block" : "hidden"} lg:block`}>
        <div className="p-4 border-b-2 border-[#78cce2]/30 bg-gradient-to-r from-[#002439] to-[#005066] w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#78cce2] to-[#4e7988] rounded-full flex items-center justify-center">
              <Crosshair className="h-5 w-5 text-[#002439]" />
            </div>
            <div>
              <h1 className="text-[#e4eff0] font-bold text-lg">Telescope Deploy</h1>
              <p className="text-[#78cce2] text-sm">TESS Exoplanet Search</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b-2 border-[#78cce2]/30">
          <div className="text-[#e4eff0] text-sm mb-2">Targets in view: {sectorAnomalies.length}</div>
          {selectedSector && (
            <Badge className="bg-[#78cce2] text-[#002439] text-sm px-2 py-1">Sector selected</Badge>
          )}
        </div>

        <div className="p-4">
          <DeployTelescopeViewportNavigationControls
            currentSector={currentSector}
            setCurrentSector={setCurrentSector}
            setSelectedSector={setSelectedSector}
          />
        </div>

        <Card className="m-4 bg-[#002439]/80 border-2 border-[#78cce2]/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#e4eff0] text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#78cce2]" />
              Deploy
            </CardTitle>
            <CardDescription className="text-[#78cce2] text-sm">
              Focus telescope on selected sector
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSector ? (
              <div className="space-y-3">
                <div className="bg-[#005066]/50 p-3 rounded border border-[#78cce2]/30">
                  <div className="text-[#78cce2] text-sm">
                    {sectorAnomalies.length} TESS candidates detected
                  </div>
                </div>

                <Button
                  onClick={onDeploy}
                  disabled={alreadyDeployed || deploying}
                  className="w-full bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] text-sm py-2"
                >
                  {deploying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#002439] border-t-transparent rounded-full animate-spin mr-2" />
                      Deploying...
                    </>
                  ) : alreadyDeployed ? (
                    "Already Deployed"
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4 mr-2" />
                      Deploy Telescope
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Target className="h-8 w-8 text-[#78cce2]/50 mx-auto mb-2" />
                <div className="text-[#e4eff0] text-sm mb-1">No sector selected</div>
                <div className="text-[#78cce2] text-xs">Navigate and select a sector first</div>
              </div>
            )}
          </CardContent>
        </Card>

        {deploymentMessage && (
          <div className="m-4 p-3 bg-[#78cce2]/10 border border-[#78cce2]/30 rounded">
            <div className="text-[#78cce2] text-sm">{deploymentMessage}</div>
          </div>
        )}

        <div className="mt-auto p-4 border-t-2 border-[#78cce2]/30 bg-gradient-to-r from-[#005066]/50 to-transparent">
          <div className="text-[#e4eff0] text-sm mb-1">TESS Mission</div>
          <div className="text-[#78cce2] text-xs mb-2">Transiting Exoplanet Survey Satellite</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-[#78cce2]">{tessAnomalies.length}</div>
              <div className="text-xs text-[#e4eff0]">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#4e7988]">{sectorAnomalies.length}</div>
              <div className="text-xs text-[#e4eff0]">In View</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};