"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Anomaly } from "@/types/Structures/telescope"
import { SpaceIcon as Planet, Sun, Asterisk, Disc } from "lucide-react"
import { projects } from "@/data/projects"

interface AnomalyDialogProps {
  showClassifyDialog: boolean
  setShowClassifyDialog: (show: boolean) => void
  selectedAnomaly: Anomaly | null
  handleClassify: () => void
};

export function AnomalyDialog({
  showClassifyDialog,
  setShowClassifyDialog,
  selectedAnomaly,
  handleClassify,
}: AnomalyDialogProps) {
  return (
    <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
      <DialogContent className="bg-[#E5E9F0] border-[#C2C8D2]">
        <DialogHeader>
          <DialogTitle className="text-[#2E3440]">Classify Anomaly</DialogTitle>
        </DialogHeader>
        {selectedAnomaly && (
          <div className="space-y-4">
            <div className="bg-[#ECEFF4] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      selectedAnomaly.type === "exoplanet"
                        ? "linear-gradient(to bottom right, #EBCB8B, #D08770)"
                        : selectedAnomaly.type === "sunspot"
                          ? "linear-gradient(to bottom right, #D08770, #BF616A)"
                          : selectedAnomaly.type === "asteroid"
                            ? "linear-gradient(to bottom right, #B48EAD, #81A1C1)"
                            : "linear-gradient(to bottom right, #88C0D0, #5E81AC)",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {selectedAnomaly.type === "exoplanet" && <Planet className="h-6 w-6 text-[#2E3440]" />}
                  {selectedAnomaly.type === "sunspot" && <Sun className="h-6 w-6 text-[#2E3440]" />}
                  {selectedAnomaly.type === "asteroid" && <Asterisk className="h-6 w-6 text-[#2E3440]" />}
                  {selectedAnomaly.type === "accretion_disc" && <Disc className="h-6 w-6 text-[#2E3440]" />}
                </div>
                <div>
                  <h4 className="font-semibold text-[#2E3440]">{selectedAnomaly.name}</h4>
                  <p className="text-sm text-[#4C566A] capitalize">{selectedAnomaly.type.replace("_", " ")}</p>
                  <p className="text-xs text-[#4C566A]">{selectedAnomaly.sector}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4C566A]">ID:</span>
                  <span className="font-mono text-[#2E3440]">{selectedAnomaly.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4C566A]">Project:</span>
                  <span className="text-[#2E3440]">{projects.find((p) => p.id === selectedAnomaly.project)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4C566A]">Position:</span>
                  <span className="font-mono text-[#2E3440]">
                    ({selectedAnomaly.x.toFixed(1)}%, {selectedAnomaly.y.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClassify}
                className="flex-1 bg-[#5E81AC] hover:bg-[#81A1C1] text-white border-none"
              >
                Classify
              </Button>
              <Button
                onClick={() => setShowClassifyDialog(false)}
                variant="outline"
                className="flex-1 border-[#C2C8D2] text-[#2E3440] bg-[#E5E9F0] hover:bg-[#D8DEE9]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};