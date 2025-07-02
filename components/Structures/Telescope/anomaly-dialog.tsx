"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Anomaly } from "@/types/Structures/telescope";
import { SpaceIcon as Planet, Sun, Asterisk, Disc } from "lucide-react";
import { Star, Zap, Target, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/data/projects";
import { useRouter } from "next/navigation";

interface AnomalyDialogProps {
  showClassifyDialog: boolean;
  setShowClassifyDialog: (show: boolean) => void; 
  selectedAnomaly: Anomaly | null;
  handleClassify: () => void;
};

export function AnomalyDialog({
  showClassifyDialog,
  setShowClassifyDialog,
  selectedAnomaly,
  handleClassify,
}: AnomalyDialogProps) {
  const router = useRouter();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "exoplanet":
        return "bg-[#4FC3F7] text-white"
      case "sunspot":
        return "bg-[#FF7043] text-white"
      case "asteroid":
        return "bg-[#9C27B0] text-white"
      case "accretion_disc":
        return "bg-[#00E676] text-black"
      default:
        return "bg-[#5E81AC] text-white"
    };
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "exoplanet":
        return "A planet orbiting a star outside our solar system"
      case "sunspot":
        return "A temporary dark region on the Sun's surface"
      case "asteroid":
        return "A rocky object orbiting the Sun"
      case "accretion_disc":
        return "A disk of matter spiraling into a massive object"
      default:
        return "An unidentified celestial object"
    };
  };

  const handleRedirect = () => {
    if (!selectedAnomaly) return;

    switch (selectedAnomaly.type) {
      case "exoplanet":
        router.push("/structures/telescope/planet-hunters");
        break;
      case "sunspot":
        router.push("/structures/telescope/sunspots");
        break;
      case "accretion_disc":
        router.push("/structures/telescope/disk-detective");
        break;
      case "asteroid":
        router.push("/structures/telescope/daily-minor-planet");
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
      {selectedAnomaly && (
        <DialogContent className="bg-[#3B4252] border-[#4C566A] text-[#ECEFF4] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-[#88C0D0]" />
              Classify Discovery
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Anomaly Info */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-[#ECEFF4] mb-2">{selectedAnomaly.name}</h3>
                <Badge className={getTypeColor(selectedAnomaly.type)}>
                  {selectedAnomaly.type.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              <div className="bg-[#2E3440] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#EBCB8B]" />
                  <span className="text-sm text-[#D8DEE9]">Sector: {selectedAnomaly.sector}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#A3BE8C]" />
                  <span className="text-sm text-[#D8DEE9]">
                    Brightness: {(selectedAnomaly.brightness * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#88C0D0]" />
                  <span className="text-sm text-[#D8DEE9]">Discovered: {selectedAnomaly.discoveryDate}</span>
                </div>
              </div>

              <div className="text-sm text-[#D8DEE9] text-center bg-[#434C5E] rounded-lg p-3">
                {getTypeDescription(selectedAnomaly.type)}
              </div>
            </div>

            {/* Classification Actions */}
            <div className="space-y-3">
              <div className="text-sm text-[#88C0D0] text-center">
                Confirm this classification to contribute to our research database.
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowClassifyDialog(false)}
                  variant="outline"
                  className="flex-1 bg-[#434C5E] border-[#4C566A] text-[#ECEFF4] hover:bg-[#4C566A]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleClassify();
                    handleRedirect();
                  }}
                  className="flex-1 bg-[#A3BE8C] text-white hover:bg-[#8FBCBB]"
                >
                  Classify
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};