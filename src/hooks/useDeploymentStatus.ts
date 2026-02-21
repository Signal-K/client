import { useEffect, useState } from "react";

interface DeploymentStatus {
  telescope: {
    deployed: boolean;
    unclassifiedCount: number;
  };
  satellites: {
    deployed: boolean;
    unclassifiedCount: number;
    available: boolean;
  };
  rover: {
    deployed: boolean;
    unclassifiedCount: number;
  };
}

interface PlanetTarget {
  id: number;
  name: string;
}

const useDeploymentStatus = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    telescope: { deployed: false, unclassifiedCount: 0 },
    satellites: { deployed: false, unclassifiedCount: 0, available: false },
    rover: { deployed: false, unclassifiedCount: 0 },
  });

  const [planetTargets, setPlanetTargets] = useState<PlanetTarget[]>([]);

  useEffect(() => {
    const checkDeploymentStatus = async () => {
      const response = await fetch("/api/gameplay/deploy/status", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        return;
      }

      setDeploymentStatus(
        payload?.deploymentStatus || {
          telescope: { deployed: false, unclassifiedCount: 0 },
          satellites: { deployed: false, unclassifiedCount: 0, available: false },
          rover: { deployed: false, unclassifiedCount: 0 },
        }
      );
      setPlanetTargets(payload?.planetTargets || []);
    };

    checkDeploymentStatus();
  }, []);

  return { deploymentStatus, planetTargets };
};

export default useDeploymentStatus;
