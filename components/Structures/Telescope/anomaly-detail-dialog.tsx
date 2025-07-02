"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MapPin, Calendar, Zap, Globe } from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope"
import { projects } from "@/data/projects"
import Link from "next/link"

interface AnomalyDetailDialogProps {
  showDetailDialog: boolean
  setShowDetailDialog: (show: boolean) => void
  selectedAnomaly: Anomaly | null
}

export function AnomalyDetailDialog({
  showDetailDialog,
  setShowDetailDialog,
  selectedAnomaly,
}: AnomalyDetailDialogProps) {
  if (!selectedAnomaly) return null

  const project = projects.find((p) => p.id === selectedAnomaly.project)
  const hasClassificationId = (selectedAnomaly as any).classificationId

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="bg-gradient-to-br from-[#3B4252] to-[#2E3440] border-2 border-[#5E81AC] text-[#ECEFF4] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-5 w-5 text-[#A3BE8C]" />
            Classified Anomaly
          </DialogTitle>
          <DialogDescription className="text-[#D8DEE9]">Detailed analysis of this discovered anomaly</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Anomaly Visualization */}
          <div className="relative h-40 bg-gradient-to-br from-[#2E3440] to-[#434C5E] rounded-lg border border-[#5E81AC] overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(ellipse 300px 150px at 30% 30%, ${selectedAnomaly.color}44 0%, transparent 50%),
                  radial-gradient(ellipse 200px 250px at 70% 70%, ${selectedAnomaly.color}33 0%, transparent 50%),
                  radial-gradient(ellipse 400px 100px at 50% 10%, ${selectedAnomaly.color}22 0%, transparent 50%)
                `,
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${30 * selectedAnomaly.size}px`,
                height: `${30 * selectedAnomaly.size}px`,
                background: `radial-gradient(circle, ${selectedAnomaly.color}22 0%, ${selectedAnomaly.color} 40%, ${selectedAnomaly.color}CC 100%)`,
                borderRadius: selectedAnomaly.shape === "circle" ? "50%" : "0%",
                clipPath:
                  selectedAnomaly.shape === "star"
                    ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                    : selectedAnomaly.shape === "diamond"
                      ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                      : selectedAnomaly.shape === "hexagon"
                        ? "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)"
                        : "none",
                boxShadow: `0 0 ${40 * selectedAnomaly.size}px ${20 * selectedAnomaly.size}px ${selectedAnomaly.color}66`,
                animation: `pulse ${selectedAnomaly.pulseSpeed}s ease-in-out infinite alternate`,
              }}
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#A3BE8C] text-[#2E3440]">Classified</Badge>
            </div>
          </div>

          {/* Anomaly Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#ECEFF4] mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-[#EBCB8B]" />
                    <span className="text-[#D8DEE9]">Type:</span>
                    <Badge className="bg-[#5E81AC] text-white">{selectedAnomaly.type.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[#88C0D0]" />
                    <span className="text-[#D8DEE9]">Sector:</span>
                    <span className="text-[#ECEFF4] font-mono">{selectedAnomaly.sector}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[#A3BE8C]" />
                    <span className="text-[#D8DEE9]">Discovered:</span>
                    <span className="text-[#ECEFF4]">{selectedAnomaly.discoveryDate}</span>
                  </div>
                  {project && (
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: project.bgGradient }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                      </div>
                      <span className="text-[#D8DEE9]">Project:</span>
                      <span className="text-[#ECEFF4]">{project.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#ECEFF4] mb-2">Physical Properties</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#D8DEE9]">Brightness:</span>
                    <span className="text-[#ECEFF4]">{(selectedAnomaly.brightness * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D8DEE9]">Size Factor:</span>
                    <span className="text-[#ECEFF4]">{selectedAnomaly.size.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D8DEE9]">Pulse Rate:</span>
                    <span className="text-[#ECEFF4]">{selectedAnomaly.pulseSpeed.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D8DEE9]">Glow Intensity:</span>
                    <span className="text-[#ECEFF4]">{(selectedAnomaly.glowIntensity * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Classification Details */}
          {(selectedAnomaly as any).classificationContent && (
            <div className="bg-[#434C5E] rounded-lg p-4 border border-[#5E81AC]">
              <h3 className="font-semibold text-[#ECEFF4] mb-2">Classification Notes</h3>
              <p className="text-sm text-[#D8DEE9]">{(selectedAnomaly as any).classificationContent}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setShowDetailDialog(false)}
              variant="outline"
              className="flex-1 border-[#5E81AC] text-[#D8DEE9] hover:bg-[#434C5E]"
            >
              Close
            </Button>
            {hasClassificationId && (
              <Link href={`/next/${hasClassificationId}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-[#5E81AC] to-[#81A1C1] text-white hover:from-[#81A1C1] hover:to-[#5E81AC]">
                  <Globe className="h-4 w-4 mr-2" />
                  View Planet
                </Button>
              </Link>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0% {
              opacity: 0.7;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.05);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};