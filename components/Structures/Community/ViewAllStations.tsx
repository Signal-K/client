"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import IndividualCommunityStation, { IndividualStationProps } from "./IndividualStation";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";

export default function StationsOnPlanet() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [stationsOnPlanet, setStationsOnPlanet] = useState<IndividualStationProps[]>([]);
  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
  const [selectedStation, setSelectedStation] = useState<IndividualStationProps | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/gameplay/inventory');
      const itemsData: StructureItemDetail[] = await response.json();
      const itemMap = new Map<number, StructureItemDetail>();

      itemsData.forEach(item => {
        if (item.ItemCategory === 'CommunityStation') {
          itemMap.set(item.id, item);
        }
      });

      setItemDetails(itemMap);

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('anomaly', activePlanet.id);

      if (inventoryError) throw inventoryError;

      const uniqueStructuresMap = new Map<number, InventoryStructureItem>();
      inventoryData.forEach(structure => {
        const itemDetail = itemMap.get(structure.item);
        if (itemDetail && itemDetail.locationType === 'Surface' && !uniqueStructuresMap.has(structure.item)) {
          uniqueStructuresMap.set(structure.item, structure);
        }
      });

      const uniqueStructures = Array.from(uniqueStructuresMap.values()).map(structure => ({
        id: structure.item,
        name: itemMap.get(structure.item)?.name || '',
        imageSrc: itemMap.get(structure.item)?.icon_url || '',
        item: structure.item,
        projects: [],
        configuration: structure.configuration || {},
      }));

      setStationsOnPlanet(uniqueStructures || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, activePlanet?.id, supabase]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="flex flex-wrap gap-4 justify-center p-4">
      {stationsOnPlanet.map((station) => (
        <div
          key={station.id}
          className="cursor-pointer p-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300"
          onClick={() => setSelectedStation(station)}
        >
          <img className="w-16 h-16 object-cover" src={station.imageSrc} alt={station.name} />
          <p className="text-center mt-2 text-sm">{station.name}</p>
        </div>
      ))}
      {selectedStation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <IndividualCommunityStation
              {...selectedStation}
              onClose={() => setSelectedStation(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};