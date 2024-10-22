"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface InventoryIdFetcherProps {
  structureId: string;
  onInventoryIdFetched: (id: number | null) => void;
};

export const InventoryIdFetcher: React.FC<InventoryIdFetcherProps> = ({ structureId, onInventoryIdFetched }) => {
  const supabase = useSupabaseClient();
    const session = useSession();
  
  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    const fetchInventoryData = async () => {
      const userId = session?.user?.id;
      const planetId = activePlanet?.id;

      if (!userId || !planetId) {
        console.error("User ID or Active Planet ID is missing.");
        onInventoryIdFetched(null);
        return;
      }

      try {
        console.log("Fetching inventory data for structure ID:", structureId);

        const { data, error } = await supabase
          .from("inventory")
          .select("id")
          .eq("owner", userId)
          .eq("anomaly", planetId)
          .eq("item", structureId)
          .order("id", { ascending: true })
          .single(); 

        if (error) {
          throw error;
        }

        if (data) {
          onInventoryIdFetched(data.id); 
        } else {
          onInventoryIdFetched(null);
        }
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        onInventoryIdFetched(null);
      }
    };

    fetchInventoryData();
  }, [structureId, activePlanet?.id, session?.user?.id, supabase, onInventoryIdFetched]);

  return null;
};