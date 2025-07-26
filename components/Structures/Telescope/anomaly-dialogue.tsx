"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Target, Disc } from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope"

export interface AnomalyDialogProps {
  showClassifyDialog: boolean
  setShowClassifyDialog: (show: boolean) => void
  selectedAnomaly: any
  handleClassify?: () => Promise<void> 
}

export default function AnomalyDialog({
  showClassifyDialog,
  setShowClassifyDialog,
  selectedAnomaly,
}: AnomalyDialogProps) {
  const router = useRouter()

  if (!selectedAnomaly) return null

  const handleClassify = () => {
    const id = selectedAnomaly?.id?.toString()
    if (!id) return

    let path = ""

    switch (selectedAnomaly.type) {
      case "exoplanet":
        path = `/structures/telescope/planet-hunters/${id}/classify`
        break
      case "sunspot":
        path = `/structures/telescope/sunspots/${id}/classify`
        break
      case "asteroid":
        path = `/structures/telescope/daily-minor-planet/${id}/classify`
        break
      case "accretion_disc":
        path = `/structures/telescope/disk-detective/${id}/classify`
        break
      default:
        return
    }

    router.push(path)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exoplanet":
        return <Star className="h-5 w-5" />
      case "sunspot":
        return <Zap className="h-5 w-5" />
      case "asteroid":
        return <Target className="h-5 w-5" />
      case "accretion_disc":
        return <Disc className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exoplanet":
        return "bg-blue-500"
      case "sunspot":
        return "bg-orange-500"
      case "asteroid":
        return "bg-purple-500"
      case "accretion_disc":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
      <DialogContent 
        className="backdrop-blur-sm border font-mono text-sm max-w-md"
        style={{ 
          backgroundColor: "rgba(0, 80, 102, 0.95)", 
          borderColor: "rgba(120, 204, 226, 0.3)",
          color: "#e4eff0"
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2 font-mono"
            style={{ color: "#e4eff0" }}
          >
            {getTypeIcon(selectedAnomaly.type)}
            Classify Anomaly
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-3 rounded-full"
              style={{
                backgroundColor: selectedAnomaly.color,
                boxShadow: `0 0 20px ${selectedAnomaly.color}`,
              }}
            />
            <h3 
              className="text-lg font-semibold font-mono"
              style={{ color: "#e4eff0" }}
            >
              {selectedAnomaly.name}
            </h3>
            <Badge 
              className={`${getTypeColor(selectedAnomaly.type)} text-white mt-2 font-mono text-xs`}
            >
              {selectedAnomaly.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span style={{ color: "#78cce2" }}>Sector:</span>
              <span style={{ color: "#e4eff0" }}>{selectedAnomaly.sector}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#78cce2" }}>Brightness:</span>
              <span style={{ color: "#e4eff0" }}>{(selectedAnomaly.brightness * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#78cce2" }}>Size:</span>
              <span style={{ color: "#e4eff0" }}>{(selectedAnomaly.size * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#78cce2" }}>Shape:</span>
              <span 
                className="capitalize" 
                style={{ color: "#e4eff0" }}
              >
                {selectedAnomaly.shape}
              </span>
            </div>
          </div>

          <div 
            className="p-3 rounded-lg border backdrop-blur-sm"
            style={{ 
              backgroundColor: "rgba(0, 36, 57, 0.8)", 
              borderColor: "rgba(120, 204, 226, 0.3)" 
            }}
          >
            <p 
              className="text-sm font-mono"
              style={{ color: "#78cce2" }}
            >
              {/* Optional info about classification can go here */}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowClassifyDialog(false)}
              variant="outline"
              className="flex-1 border font-mono text-sm"
              style={{
                borderColor: "rgba(120, 204, 226, 0.3)",
                color: "#e4eff0",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "rgba(120, 204, 226, 0.2)"
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "transparent"
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClassify}
              className="flex-1 font-mono text-sm"
              style={{
                backgroundColor: "#78cce2",
                color: "#002439"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#e4eff0"
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#78cce2"
              }}
            >
              Classify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};