"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface InventoryDataProps {
  structureId: string;
  onInventoryDataFetched?: (id: number) => void;
};

interface InventoryIdFetcherProps {
  structureId: string;
  onInventoryIdFetched: (id: number) => void;
};


export const InventoryData: React.FC<InventoryDataProps> = ({ structureId, onInventoryDataFetched }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [inventoryData, setInventoryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      const userId = session?.user?.id;
      const planetId = activePlanet?.id;

      if (!userId || !planetId) {
        console.error("User ID or Active Planet ID is missing.");
        setError("Failed to fetch inventory data due to missing information.");
        return;
      }

      try {
        console.log("Fetching inventory data for structure ID:", structureId);

        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", userId)
          .eq("anomaly", planetId)
          .eq("item", structureId)
          .order("id", { ascending: true });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setInventoryData(data[0]);
          if (onInventoryDataFetched) {
            onInventoryDataFetched(data[0].id); // Pass the ID to the parent
          }
        } else {
          setInventoryData(null);
        }
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Failed to fetch inventory data.");
      }
    };

    if (session?.user?.id && activePlanet?.id) {
      fetchInventoryData();
    }
  }, [structureId, activePlanet?.id, session?.user?.id, supabase, onInventoryDataFetched]);

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!inventoryData) {
    return <div className="text-white">Loading inventory data...</div>;
  }

  return (
    <div className="bg-[#D689E3] p-4 rounded-md">
      <h3 className="text-lg font-semibold">Inventory Data</h3>
      <p><strong>Item ID:</strong> {inventoryData.id}</p>
      <p><strong>Quantity:</strong> {inventoryData.quantity}</p>
      <p><strong>Notes:</strong> {inventoryData.notes || "None"}</p>
      <p><strong>Configuration:</strong> {JSON.stringify(inventoryData.configuration)}</p>
    </div>
  );
};