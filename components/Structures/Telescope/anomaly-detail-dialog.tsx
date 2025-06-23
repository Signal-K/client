"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Anomaly } from "@/types/Structures/telescope"
import { SpaceIcon as Planet, Sun, Asterisk, Disc, MapPin, Calendar, Eye, User } from "lucide-react"
import { projects } from "@/data/projects"

interface AnomalyDetailDialogProps {
  showDetailDialog: boolean
  setShowDetailDialog: (show: boolean) => void
  selectedAnomaly: Anomaly | null
};

export function AnomalyDetailDialog({
  showDetailDialog,
  setShowDetailDialog,
  selectedAnomaly,
}: AnomalyDetailDialogProps) {
  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "exoplanet":
        return <Planet className="h-8 w-8" />
      case "sunspot":
        return <Sun className="h-8 w-8" />
      case "asteroid":
        return <Asterisk className="h-8 w-8" />
      case "accretion_disc":
        return <Disc className="h-8 w-8" />
      default:
        return <Planet className="h-8 w-8" />
    }
  }

  const getAnomalyTypeLabel = (type: string) => {
    switch (type) {
      case "exoplanet":
        return "Exoplanet"
      case "sunspot":
        return "Sunspot"
      case "asteroid":
        return "Asteroid"
      case "accretion_disc":
        return "Accretion Disc"
      default:
        return type
    }
  }

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="bg-gradient-to-br from-[#3B4252] to-[#2E3440] border-2 border-[#5E81AC] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#ECEFF4] flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#88C0D0]" />
            Discovery Information
          </DialogTitle>
        </DialogHeader>
        {selectedAnomaly && (
          <div className="space-y-6">
            {/* Main Display */}
            <div className="bg-gradient-to-br from-[#434C5E] to-[#3B4252] rounded-lg p-6 border border-[#4C566A]">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                  style={{
                    background:
                      projects.find((p) => p.id === selectedAnomaly.project)?.bgGradient ||
                      "linear-gradient(to right, #D8DEE9, #C2C8D2)",
                  }}
                >
                  {getAnomalyIcon(selectedAnomaly.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#ECEFF4] mb-1">{selectedAnomaly.name}</h3>
                  <Badge className="bg-[#5E81AC] text-white">{getAnomalyTypeLabel(selectedAnomaly.type)}</Badge>
                </div>
              </div>

              {/* Discovery Details */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 text-[#D8DEE9]">
                  <MapPin className="h-4 w-4 text-[#88C0D0]" />
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-xs opacity-80">{selectedAnomaly.sector}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#D8DEE9]">
                  <Calendar className="h-4 w-4 text-[#A3BE8C]" />
                  <div>
                    <div className="text-sm font-medium">Discovery Date</div>
                    <div className="text-xs opacity-80">{selectedAnomaly.discoveryDate}</div>
                  </div>
                </div>

                {/* If it's from another user */}
                {"discoveredBy" in selectedAnomaly && (
                  <div className="flex items-center gap-3 text-[#D8DEE9]">
                    <User className="h-4 w-4 text-[#B48EAD]" />
                    <div>
                      <div className="text-sm font-medium">Discovered By</div>
                      <div className="text-xs opacity-80">{(selectedAnomaly as any).discoveredBy}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-[#D8DEE9]">
                  <div className="w-4 h-4 flex items-center justify-center">
                    {projects.find((p) => p.id === selectedAnomaly.project)?.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">Project</div>
                    <div className="text-xs opacity-80">
                      {projects.find((p) => p.id === selectedAnomaly.project)?.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Data */}
            <div className="bg-gradient-to-br from-[#434C5E] to-[#3B4252] rounded-lg p-4 border border-[#4C566A]">
              <h4 className="text-sm font-bold text-[#ECEFF4] mb-3 flex items-center gap-2">Technical Data</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[#88C0D0] font-medium">Coordinates</div>
                  <div className="text-[#D8DEE9] font-mono">
                    {selectedAnomaly.x.toFixed(1)}%, {selectedAnomaly.y.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-[#88C0D0] font-medium">Brightness</div>
                  <div className="text-[#D8DEE9] font-mono">{(selectedAnomaly.brightness * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[#88C0D0] font-medium">Size Factor</div>
                  <div className="text-[#D8DEE9] font-mono">{selectedAnomaly.size.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-[#88C0D0] font-medium">Shape</div>
                  <div className="text-[#D8DEE9] capitalize">{selectedAnomaly.shape}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDetailDialog(false)}
                className="flex-1 bg-[#5E81AC] hover:bg-[#81A1C1] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};