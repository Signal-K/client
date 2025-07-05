'use client'

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Zap, Target, Disc } from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope"

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
  handleClassify, // Optional: still used?
}: AnomalyDialogProps) {
  const router = useRouter();

  if (!selectedAnomaly) return null;

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

  const getRouteForType = (type: string) => {
    switch (type) {
      case "exoplanet":
        return "/structures/telescope/planet-hunters/classify"
      case "sunspot":
        return "/structures/telescope/sunspots/classify"
      case "asteroid":
        return "/structures/telescope/daily-minor-planet/classify"
      case "accretion_disc":
        return "/structures/telescope/disk-detective/classify"
      default:
        return "/structures/telescope"
    }
  }

  const handleClassifyClick = () => {
    const path = getRouteForType(selectedAnomaly.type);
    router.push(path);
  };

  return (
    <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
      <DialogContent className="bg-[#2E3440] border-[#4C566A] text-[#ECEFF4] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
            <h3 className="text-lg font-semibold">{selectedAnomaly.name}</h3>
            <Badge className={`${getTypeColor(selectedAnomaly.type)} text-white mt-2`}>
              {selectedAnomaly.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#88C0D0]">Sector:</span>
              <span>{selectedAnomaly.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#88C0D0]">Brightness:</span>
              <span>{(selectedAnomaly.brightness * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#88C0D0]">Size:</span>
              <span>{(selectedAnomaly.size * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#88C0D0]">Shape:</span>
              <span className="capitalize">{selectedAnomaly.shape}</span>
            </div>
          </div>

          <div className="bg-[#434C5E] p-3 rounded-lg">
            <p className="text-sm text-[#D8DEE9]">
              {/* Optional content area */}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowClassifyDialog(false)}
              variant="outline"
              className="flex-1 border-[#4C566A] text-[#D8DEE9] hover:bg-[#434C5E]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClassifyClick}
              className="flex-1 bg-[#A3BE8C] text-[#2E3440] hover:bg-[#8FBCBB]"
            >
              Classify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};