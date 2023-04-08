import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import { PlanetCard } from "./Content/Anomalies/PlanetData";

interface Anomaly {
  id: number;
  anomalytype: string;
  avatar_url: string;
};

export const PlanetGrid: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();

  const fetchAnomalies = async () => {
    const { data, error } = await supabase
      .from('anomalies')
      .select('id, anomalytype, avatar_url')
      .in('id', [1, 2, 3, 4, 5, 6])
      .eq('anomalytype', 'planet');

    if (error) {
      console.error(error);
    } else {
      setAnomalies(data);
    }
    setLoading(false);
  };

  const handlePlanetSelect = async (planetId: number) => {
    try {
      // Fetch the full details of the selected planet
      const { data: planetData, error: planetError } = await supabase
        .from('anomalies')
        .select('*')
        .eq('id', planetId)
        .single();

      if (planetError) {
        throw planetError;
      }

      if (!planetData) {
        throw new Error('Planet data not found');
      }

      // Update planet location with the planet id, not the whole object
      await updatePlanetLocation(planetId);

      const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 1,
        configuration: null,
        rewarded_items: null,
      };

      const missionData2 = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 3,
        configuration: null,
        rewarded_items: null,
      };

      const missionData3 = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 2,
        configuration: null,
        rewarded_items: null,
      };

      const { data: newMission, error: missionError } = await supabase
        .from("missions")
        .insert([missionData, missionData2, missionData3]);

      if (missionError) {
        throw missionError;
      }

      const inventoryData = {
        item: 29,
        owner: session?.user?.id,
        quantity: 1,
        notes: "Created upon the completion of mission 1",
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: planetData.id,
      };

      const inventoryDataForMission2 = {
        item: 22,
        owner: session?.user?.id,
        quantity: 1,
        notes: `Reward for completing mission 2`,
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: null,
      };

      const inventoryDataForMission3 = {
        item: 12,
        owner: session?.user?.id,
        quantity: 1,
        notes: `Reward for completing mission 3`,
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: planetData?.id,
      };

      const { data: newInventoryEntry, error: inventoryError } = await supabase
        .from("inventory")
        .insert([inventoryData, inventoryDataForMission2, inventoryDataForMission3]);

      if (inventoryError) {
        throw inventoryError;
      }

      setActivePlanet(planetData); // Update the active planet in the context
    } catch (error: any) {
      console.error("Error handling planet selection:", error.message);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
      {anomalies.map((anomaly) => (
        <div
          key={anomaly.id}
          className="flex justify-center items-center p-1 cursor-pointer"
          onClick={() => handlePlanetSelect(anomaly.id)}
        >
          <img src={anomaly.avatar_url} alt={`Planet ${anomaly.id}`} className="w-24 h-24 object-cover" />
        </div>
      ))}
    </div>
  );
};