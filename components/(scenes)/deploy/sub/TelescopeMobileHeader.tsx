import { Button } from "@/components/ui/button"
import { Crosshair } from "lucide-react"
import type { Anomaly } from "@/types/Structures/telescope"

interface Props {
  sectorAnomalies: Anomaly[]
  selectedSector: { x: number; y: number } | null
  alreadyDeployed: boolean
  deploying: boolean
  onDeploy: () => void
}

export default function DeployTelescopeMobileHeader({
  sectorAnomalies,
  selectedSector,
  alreadyDeployed,
  deploying,
  onDeploy,
}: Props) {
  return (
    <div className="lg:hidden bg-[#005066]/95 border-b-2 border-[#78cce2]/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crosshair className="h-6 w-6 text-[#78cce2]" />
          <div>
            <h1 className="text-[#e4eff0] font-bold text-lg">Deploy telescope</h1>
            <p className="text-[#78cce2] text-sm">
              {sectorAnomalies.length} targets
              {selectedSector && " • Sector selected"}
            </p>
          </div>
        </div>

        {selectedSector && (
          <Button
            onClick={onDeploy}
            disabled={alreadyDeployed || deploying}
            size="sm"
            className="bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0]"
          >
            {deploying ? "Deploying..." : alreadyDeployed ? "Deployed" : "Deploy"}
          </Button>
        )}
      </div>
    </div>
  );
};