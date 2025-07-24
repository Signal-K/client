'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Star, Zap, Target, Disc, Calendar, MapPin, Eye, Palette } from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope";

interface AnomalyDetailDialogProps {
  showDetailDialog: boolean
  setShowDetailDialog: (show: boolean) => void
  selectedAnomaly: Anomaly | null
  onClassify?: () => void
  config: "telescope" | "weather" | "rover"
}

export function AnomalyDetailDialog({
  showDetailDialog,
  setShowDetailDialog,
  selectedAnomaly,
  onClassify,
  config,
}: AnomalyDetailDialogProps) {
  if (!selectedAnomaly) return null

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
    const colors = {
      telescope: {
        exoplanet: "bg-blue-500",
        sunspot: "bg-orange-500",
        asteroid: "bg-purple-500",
        accretion_disc: "bg-green-500",
      },
      weather: {
        exoplanet: "bg-red-500",
        sunspot: "bg-yellow-500",
        asteroid: "bg-pink-500",
        accretion_disc: "bg-cyan-500",
      },
      rover: {
        exoplanet: "bg-yellow-500",
        sunspot: "bg-amber-500",
        asteroid: "bg-orange-500",
        accretion_disc: "bg-lime-500",
      },
    }
    return colors[config][type as keyof (typeof colors)[typeof config]] || "bg-gray-500"
  }

  const getConfigColors = () => {
    switch (config) {
      case "telescope":
        return {
          bg: "bg-[#2E3440]",
          border: "border-[#4C566A]",
          text: "text-[#ECEFF4]",
          accent: "text-[#88C0D0]",
          button: "bg-[#5E81AC] hover:bg-[#81A1C1]",
        }
      case "weather":
        return {
          bg: "bg-[#3B2F2F]",
          border: "border-[#5D4E4E]",
          text: "text-[#F4ECEC]",
          accent: "text-[#C08888]",
          button: "bg-[#AC5E5E] hover:bg-[#C18181]",
        }
      case "rover":
        return {
          bg: "bg-[#3B3B2F]",
          border: "border-[#5D5D4E]",
          text: "text-[#F4F4EC]",
          accent: "text-[#C0C088]",
          button: "bg-[#ACAC5E] hover:bg-[#C1C181]",
        }
    }
  }

  const colors = getConfigColors()

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className={`${colors.bg} ${colors.border} ${colors.text} max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(selectedAnomaly.type)}
            Anomaly Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visual Representation */}
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-full relative"
              style={{
                backgroundColor: selectedAnomaly.color,
                boxShadow: `0 0 30px ${selectedAnomaly.color}`,
                opacity: selectedAnomaly.brightness,
              }}
            >
              {selectedAnomaly.classified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold">{selectedAnomaly.name}</h3>
            <Badge className={`${getTypeColor(selectedAnomaly.type)} text-white mt-2`}>
              {selectedAnomaly.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={colors.accent}>Sector</div>
                  <div>{selectedAnomaly.sector}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={colors.accent}>Brightness</div>
                  <div>{(selectedAnomaly.brightness * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={colors.accent}>Size</div>
                  <div>{(selectedAnomaly.size * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={colors.accent}>Shape</div>
                  <div className="capitalize">{selectedAnomaly.shape}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery Info */}
          <div
            className={`${colors.bg === "bg-[#2E3440]" ? "bg-[#434C5E]" : colors.bg === "bg-[#3B2F2F]" ? "bg-[#4E3B3B]" : "bg-[#4E4E3B]"} p-4 rounded-lg`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className={`${colors.accent} text-sm`}>Discovery Date</span>
            </div>
            <div className="text-sm">{selectedAnomaly.discoveryDate}</div>
            {selectedAnomaly.classified && (
              <div className="mt-2 text-sm text-green-400">✓ This anomaly has been classified</div>
            )}
          </div>

          {/* Technical Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className={colors.accent}>Pulse Speed:</span>
              <span>{selectedAnomaly.pulseSpeed.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between">
              <span className={colors.accent}>Glow Intensity:</span>
              <span>{(selectedAnomaly.glowIntensity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className={colors.accent}>Color Code:</span>
              <span>{selectedAnomaly.color}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetailDialog(false)}
              variant="outline"
              className={`flex-1 ${colors.border} ${colors.text} hover:bg-opacity-10`}
            >
              Close
            </Button>
            {!selectedAnomaly.classified && onClassify && (
              <Button onClick={onClassify} className={`flex-1 ${colors.button} text-white`}>
                Classify
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};