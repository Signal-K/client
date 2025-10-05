import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

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
  const supabase = useSupabaseClient();
  const session = useSession();

  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    telescope: { deployed: false, unclassifiedCount: 0 },
    satellites: { deployed: false, unclassifiedCount: 0, available: false },
    rover: { deployed: false, unclassifiedCount: 0 },
  });

  const [planetTargets, setPlanetTargets] = useState<PlanetTarget[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPlanetTargets = async () => {
      const userId = session.user.id;

      const { data: planetClassifications } = await supabase
        .from("classifications")
        .select("id, anomaly:anomaly(content)")
        .eq("author", userId)
        .eq("classificationtype", "planet");

      const planetIds = (planetClassifications ?? []).map((c) => c.id);

      if (planetIds.length === 0) {
        setPlanetTargets([]);
        return [];
      }

      const validPlanets = (planetClassifications ?? []).map((c) => ({
        id: c.id,
        name: (c.anomaly as any)?.content || `Planet #${c.id}`,
      }));

      setPlanetTargets(validPlanets);
      return validPlanets;
    };

    const checkDeploymentStatus = async () => {
      const userId = session.user.id;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: telescopeDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "Telescope")
        .gte("date", oneWeekAgo.toISOString());

      const { data: satelliteDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "WeatherSatellite");

      const { data: roverDeployments } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id, anomaly:anomaly_id(id)")
        .eq("author", userId)
        .eq("automaton", "Rover");

      const { data: userClassifications } = await supabase
        .from("classifications")
        .select("anomaly")
        .eq("author", userId);

      const classifiedAnomalyIds = new Set(
        (userClassifications ?? []).map((c) => c.anomaly).filter(Boolean)
      );

      const telescopeUnclassified = (telescopeDeployments ?? []).filter(
        (deployment) => !classifiedAnomalyIds.has(deployment.anomaly_id)
      ).length;

      const satelliteUnclassified = (satelliteDeployments ?? []).filter(
        (deployment) => !classifiedAnomalyIds.has(deployment.anomaly_id)
      ).length;

      const roverUnclassified = (roverDeployments ?? []).filter(
        (deployment) => !classifiedAnomalyIds.has(deployment.anomaly_id)
      ).length;

      const validPlanets = await fetchPlanetTargets();

      setDeploymentStatus({
        telescope: {
          deployed: (telescopeDeployments ?? []).length > 0,
          unclassifiedCount: telescopeUnclassified,
        },
        satellites: {
          deployed: (satelliteDeployments ?? []).length > 0,
          unclassifiedCount: satelliteUnclassified,
          available: validPlanets.length > 0,
        },
        rover: {
          deployed: (roverDeployments ?? []).length > 0,
          unclassifiedCount: roverUnclassified,
        },
      });
    };

    checkDeploymentStatus();
  }, [session, supabase]);

  return { deploymentStatus, planetTargets };
};

export default useDeploymentStatus;