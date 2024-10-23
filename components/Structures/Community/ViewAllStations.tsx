"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import { CommunityScienceStation } from "./StationModal";

export interface IndividualStationProps {
  id: number;
  stationName: string;
  imageSrc: string;  
  item: number;
  projects: Project[];
  missions: Mission[];
  anomalies: AnomalyPiece[];
  InventoryItemId: number; // InventoryItemId should be consistent with your new logic
  configuration: any; 
}

type Project = {
  id: string;
  name: string;
  identifier: string;
  isUnlocked: boolean;
  structure: string;
  component: React.ComponentType;
  level: number;
  missionId: number;
  isCompleted: boolean;
  missionRoute: number;
};

type Mission = {
  id: string;
  name: string;
  project: string;
  isUnlocked: boolean;
  type: string;
  completionRate: number;
  level: number;
};

type AnomalyPiece = {
  id: string; 
  name: string;
  description: string;
  file?: string;
};

export default function StationsOnPlanet() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [stationsOnPlanet, setStationsOnPlanet] = useState<IndividualStationProps[]>([]);
  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
  const [selectedStation, setSelectedStation] = useState<IndividualStationProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryStructureItem[]>([]);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('anomaly', activePlanet.id);

      if (inventoryError) throw inventoryError;

      const itemMap = new Map<number, StructureItemDetail>();
      const response = await fetch('/api/gameplay/inventory');
      const itemsData: StructureItemDetail[] = await response.json();

      itemsData.forEach(item => {
        if (item.ItemCategory === 'CommunityStation') {
          itemMap.set(item.id, item);
        }
      });

      const uniqueStructuresMap = new Map<number, InventoryStructureItem>();
      inventoryData.forEach((structure: InventoryStructureItem) => {
        const itemDetail = itemMap.get(structure.item);
        if (itemDetail && itemDetail.locationType === 'Surface' && !uniqueStructuresMap.has(structure.item)) {
          uniqueStructuresMap.set(structure.item, structure);
        }
      });

      const stations = Array.from(uniqueStructuresMap.values()).map((structure) => {
        const config = typeof structure.configuration === 'string' 
          ? JSON.parse(structure.configuration) 
          : structure.configuration;

        const projects = config?.projects?.map((project: any) => ({
          id: project.id,
          name: project.name,
          identifier: project.identifier,
          isUnlocked: !project.locked,
          structure: project.structure, // Ensure the structure field is assigned
          level: project.level,
          missionId: project.mission,
          isCompleted: false, // Default or actual value
        })) || [];

        const missions = config?.missions?.map((mission: any) => ({
          id: mission.id,
          name: mission.name,
          project: mission.project,
          isUnlocked: !mission.locked,
          type: mission.type,
          completionRate: 0,
          level: mission.level,
        })) || [];

        return {
          id: structure.item, 
          stationName: itemMap.get(structure.item)?.name || "Unknown Station",
          imageSrc: itemMap.get(structure.item)?.icon_url || "/default-image.png",
          item: structure.item,
          projects, 
          missions, 
          anomalies: [],
          configuration: config,
          InventoryItemId: structure.id, // Get inventory item ID from the structure
        };
      });

      setStationsOnPlanet(stations);

      const filteredInventoryItems = inventoryData.filter((item: { item: number; }) => uniqueStructuresMap.has(item.item));
      setInventoryItems(filteredInventoryItems);
    } catch (error) {
      console.error('Error fetching structures:', error);
      setLoading(false);
    }
  }, [session?.user?.id, activePlanet?.id, supabase]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleStationClick = (station: IndividualStationProps) => {
    setSelectedStation(station);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="stations-container">
      {stationsOnPlanet.map((station, index) => (
        <CommunityScienceStation
          key={index}
          inventoryItemId={station.InventoryItemId} // Pass the inventory item ID here
          stationName={station.stationName}
          projects={station.projects} 
          missions={station.missions} 
          anomalies={station.anomalies || []}
          imageSrc={station.imageSrc}
          configuration={station.configuration}
          onClick={() => handleStationClick(station)} 
        />
      ))}

      {selectedStation && (
        <div className="selected-station">
          <h2>{selectedStation.stationName}</h2>
        </div>
      )}
    </div>
  );
};