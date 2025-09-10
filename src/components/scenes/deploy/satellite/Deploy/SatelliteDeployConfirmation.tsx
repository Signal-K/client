import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { CheckCircle, Target, Telescope, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SatelliteDeployConfirmation({
  deploymentResult,
  onClose,
  onTelescope,
}: {
  deploymentResult: { anomalies: string[]; sectorName: string };
  onClose: () => void;
  onTelescope: () => void;
}) {
    const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      <Card className="bg-[#181e2a] border-2 border-[#6be0b3] max-w-md w-full mx-2 shadow-2xl rounded-2xl">
        <CardHeader className="relative pb-2">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-[#6be0b3] hover:bg-[#6be0b3]/20 rounded-full transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6be0b3] to-[#78cce2] rounded-full flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-[#181e2a]" />
            </div>
            <div>
              <CardTitle className="text-[#e4eff0] text-xl">Satellite Deployed!</CardTitle>
              <CardDescription className="text-[#6be0b3] text-sm">
                Your weather satellite is now monitoring anomalies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#232b3b]/80 p-4 rounded-lg border border-[#6be0b3]/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-[#6be0b3]" />
              <span className="text-[#e4eff0] font-medium text-base">Active Anomaly Targets</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {deploymentResult.anomalies.map((name, index) => (
                <div key={index} className="flex items-center justify-between py-1 px-2 bg-[#10141c]/60 rounded border border-[#6be0b3]/10">
                  <span className="text-[#6be0b3] text-xs font-mono">{name}</span>
                  <Badge className="bg-[#6be0b3]/10 text-[#6be0b3] text-[10px]">
                    ● Monitoring
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#6be0b3]/10 p-4 rounded-lg border border-[#6be0b3]/20">
            <h3 className="text-[#e4eff0] font-medium text-base mb-2">What happens next?</h3>
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="bg-[#6be0b3] text-[#181e2a] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                <span className="text-[#e4eff0]">If you selected <strong>Planet Investigation</strong>, your satellite will gradually scan and identify the planet's radius, temperature, density, and other properties over time. You can check the satellite viewport at any time to see the progress.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#6be0b3] text-[#181e2a] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                <span className="text-[#e4eff0]">If you selected <strong>Weather Investigation</strong>, your satellite will identify four clouds on the selected planet before returning to be re-deployed. This process happens throughout the week.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#6be0b3] text-[#181e2a] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                <span className="text-[#e4eff0]">Later, you can upgrade your satellites or build more to expand your investigation capabilities.</span>
              </div>
            </div>
            <p className="text-[#6be0b3] text-xs mt-3 text-center border-t border-[#6be0b3]/10 pt-2">
              🛰️ Redirecting to dashboard soon...
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => router.push("/viewports/satellite")}
              size="sm"
              className="flex-1 bg-[#6be0b3] text-[#181e2a] hover:bg-[#78cce2] h-10 text-xs font-medium rounded-lg"
            >
              <Telescope className="h-4 w-4 mr-2" />
              View Satellite
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex-1 border-[#6be0b3] text-[#6be0b3] hover:bg-[#6be0b3]/10 h-10 text-xs rounded-lg"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
