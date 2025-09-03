'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Star, Zap, Target, Disc, Calendar, Eye, Palette, Info, Hash } from "lucide-react";
import type { Anomaly } from "@/types/Structures/telescope";
import { useTheme } from "@/hooks/useTheme";

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
  const { isDark } = useTheme();
  if (!selectedAnomaly) return null;

  // Color scheme for telescope/dark/light
  const dialogBg = isDark ? "bg-[#23283b] border-[#3b4252] text-[#e4eff0]" : "bg-[#eaf2fb] border-[#bcd2e8] text-[#23283b]";
  const accent = isDark ? "text-[#7eb6f6]" : "text-[#2e5c8a]";
  const button = isDark ? "bg-[#3b4252] hover:bg-[#7eb6f6] text-[#e4eff0]" : "bg-[#bcd2e8] hover:bg-[#7eb6f6] text-[#23283b]";

  // Icon for anomaly type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exoplanet": return <Star className={accent + " h-5 w-5"} />;
      case "sunspot": return <Zap className={accent + " h-5 w-5"} />;
      case "asteroid": return <Target className={accent + " h-5 w-5"} />;
      case "accretion_disc": return <Disc className={accent + " h-5 w-5"} />;
      default: return <Info className={accent + " h-5 w-5"} />;
    }
  };

  // Real anomaly info from DB
  // Support both Anomaly and DatabaseAnomaly shape
  const hasDbData = typeof (selectedAnomaly as any).dbData !== "undefined";
  const anomalyContent =
    (hasDbData ? (selectedAnomaly as any).dbData.content : undefined)
    || ("content" in selectedAnomaly ? (selectedAnomaly as any).content : undefined)
    || selectedAnomaly.name;
  const anomalyType =
    (hasDbData ? (selectedAnomaly as any).dbData.anomalytype : undefined)
    || ("anomalytype" in selectedAnomaly ? (selectedAnomaly as any).anomalytype : undefined)
    || selectedAnomaly.type;
  const anomalyTicId =
    (hasDbData ? (selectedAnomaly as any).dbData.ticId : undefined)
    || ("ticId" in selectedAnomaly ? (selectedAnomaly as any).ticId : undefined);
  const anomalyCreated =
    (hasDbData ? (selectedAnomaly as any).dbData.created_at : undefined)
    || ("created_at" in selectedAnomaly ? (selectedAnomaly as any).created_at : undefined);

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className={`${dialogBg} max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(anomalyType)}
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
            <h3 className="text-xl font-bold break-words">{anomalyContent}</h3>
            <Badge className={`${accent} bg-transparent border border-[#7eb6f6] mt-2`}>{anomalyType?.replace("_", " ").toUpperCase()}</Badge>
          </div>

          {/* Properties Grid - show real info only */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              {anomalyTicId && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className={accent}>TIC ID</div>
                    <div>{anomalyTicId}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={accent}>Brightness</div>
                  <div>{(selectedAnomaly.brightness * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={accent}>Shape</div>
                  <div className="capitalize">{selectedAnomaly.shape}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className={accent}>Created At</div>
                  <div>{anomalyCreated ? new Date(anomalyCreated).toLocaleString() : "-"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className={accent}>Pulse Speed:</span>
              <span>{selectedAnomaly.pulseSpeed.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between">
              <span className={accent}>Glow Intensity:</span>
              <span>{(selectedAnomaly.glowIntensity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className={accent}>Color Code:</span>
              <span>{selectedAnomaly.color}</span>
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowDetailDialog(false)}
              variant="outline"
              className={`flex-1 ${button}`}
            >
              Close
            </Button>
            {!selectedAnomaly.classified && onClassify && (
              <Button onClick={onClassify} className={`flex-1 ${button} font-bold`}>
                Classify
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}