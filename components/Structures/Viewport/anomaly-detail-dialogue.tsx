'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Zap, Mountain, X } from "lucide-react";
import type { Anomaly } from "@/types/Structures/telescope";

export const observatoryConfigs = {
  telescope: {
    theme: {
      primary: "#5E81AC",
      secondary: "#81A1C1",
      accent: "#88C0D0",
      background: "from-[#3B4252] to-[#434C5E]",
    },
    icon: Star,
    title: "Anomaly Analysis",
    subtitle: "Deep Space Observatory",
  },
  weather: {
    theme: {
      primary: "#BF616A",
      secondary: "#D08770",
      accent: "#EBCB8B",
      background: "from-[#3B4252] to-[#434C5E]",
    },
    icon: Zap,
    title: "Weather Pattern Analysis",
    subtitle: "Atmospheric Observatory",
  },
  rover: {
    theme: {
      primary: "#EBCB8B",
      secondary: "#D08770",
      accent: "#A3BE8C",
      background: "from-[#3B4252] to-[#434C5E]",
    },
    icon: Mountain,
    title: "Surface Analysis",
    subtitle: "Planetary Rover",
  },
};

interface AnomalyDetailDialogProps {
    showDetailDialog: boolean;
    setShowDetailDialog: ( show: boolean ) => void;
    selectedAnomaly: Anomaly | null;
    onClassify: () => void;
    config: keyof typeof observatoryConfigs;
};

export function AnomalyDetailDialog({
  showDetailDialog,
  setShowDetailDialog,
  selectedAnomaly,
  onClassify,
  config,
}: AnomalyDetailDialogProps) {
  if (!selectedAnomaly) return null

  const observatoryConfig = observatoryConfigs[config]
  const IconComponent = observatoryConfig.icon

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent
        className="max-w-2xl bg-gradient-to-br from-[#2E3440] to-[#3B4252] border-2 text-[#ECEFF4]"
        style={{ borderColor: observatoryConfig.theme.primary }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: observatoryConfig.theme.primary }}
              >
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl text-[#ECEFF4]">{observatoryConfig.title}</DialogTitle>
                <p className="text-sm text-[#D8DEE9]">{observatoryConfig.subtitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailDialog(false)}
              className="text-[#D8DEE9] hover:bg-[#434C5E]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Anomaly Info */}
          <Card
            className={`bg-gradient-to-br ${observatoryConfig.theme.background} border`}
            style={{ borderColor: observatoryConfig.theme.secondary }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#ECEFF4]">{selectedAnomaly.name}</h3>
                <Badge style={{ backgroundColor: observatoryConfig.theme.accent, color: "#2E3440" }}>
                  {selectedAnomaly.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#88C0D0]">Sector:</span>
                  <p className="text-[#ECEFF4]">{selectedAnomaly.sector}</p>
                </div>
                <div>
                  <span className="text-[#88C0D0]">Brightness:</span>
                  <p className="text-[#ECEFF4]">{selectedAnomaly.brightness.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[#88C0D0]">Size:</span>
                  <p className="text-[#ECEFF4]">{selectedAnomaly.size.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[#88C0D0]">Status:</span>
                  <p className="text-[#ECEFF4]">{selectedAnomaly.classified ? "Classified" : "Unclassified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!selectedAnomaly.classified && (
              <Button
                onClick={onClassify}
                className="flex-1 text-white"
                style={{ backgroundColor: observatoryConfig.theme.primary }}
              >
                Classify Now
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
              className="flex-1 border-[#5E81AC] text-[#D8DEE9] hover:bg-[#434C5E]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};