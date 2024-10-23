"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import IndividualStructure, { IndividualStructureProps } from "./IndividualStructure";
import { StructuresConfig } from "@/constants/Structures/Properties";

import "../../styles/Anims/StarterStructureAnimations.css";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
}; 

import { UnownedSurfaceStructures } from "./Build/EditMode";

export default function StructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
  const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
  const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    };

    try {
      const response = await fetch('/api/gameplay/inventory');
      const itemsData: StructureItemDetail[] = await response.json();
      const itemMap = new Map<number, StructureItemDetail>();
      itemsData.forEach(item => {
        if (item.ItemCategory === 'Structure') {
          itemMap.set(item.id, item);
        };
      });

      setItemDetails(itemMap);

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('owner', session.user.id)
        .eq('anomaly', activePlanet.id);

      if (inventoryError) throw inventoryError;

      const uniqueStructuresMap = new Map<number, InventoryStructureItem>();
      inventoryData.forEach((structure: InventoryStructureItem) => {
        const itemDetail = itemMap.get(structure.item);
        if (itemDetail && itemDetail.locationType === 'Surface' && !uniqueStructuresMap.has(structure.item)) {
          uniqueStructuresMap.set(structure.item, structure);
        };
      });

      const uniqueStructures = Array.from(uniqueStructuresMap.values());
      setUserStructuresOnPlanet(uniqueStructures || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    };
  }, [session?.user?.id, activePlanet?.id, supabase]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleIconClick = (itemId: number, inventoryId: number) => {
    const itemDetail = itemDetails.get(itemId);
    if (itemDetail) {
      const config = StructuresConfig[itemDetail.id] || {};
      setSelectedStructure({
        name: itemDetail.name,
        imageSrc: itemDetail.icon_url,
        title: `Structure ID: ${inventoryId}`,
        labels: config.labels || [],
        actions: config.actions || [],
        buttons: config.buttons.map(button => ({
          ...button,
          showInNoModal: true,
        })),
        structureId: inventoryId
      });
    };
  };

  const handleClose = useCallback(() => {
    setSelectedStructure(null);
  }, []);

  if (loading) {
    return (
        <div>
            <p>
                Loading...
            </p>
        </div>
    );
  };

  return (
<div className="relative">
            <div className={`grid grid-cols-4 gap-1 gap-y-3 relative ${userStructuresOnPlanet.length === 1 ? 'justify-center' : ''}`}>
                {userStructuresOnPlanet.map((structure) => {
                    const itemDetail = itemDetails.get(structure.item);

                    return itemDetail ? (
                        <div key={structure.id} className={`flex flex-col items-center space-y-2 ${userStructuresOnPlanet.length === 1 ? 'mx-auto' : ''}`}>
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className={`w-24 h-24 object-cover cursor-pointer ${structure.item === missionStructureId ? 'bouncing-structure' : 'moving-structure'}`}
                                onClick={() => handleIconClick(itemDetail.id, structure.id)}
                            />
                            <p className="text-white text-sm mt-2">{itemDetail.name}</p>
                        </div>
                    ) : null;
                })}
            </div>

            {selectedStructure && (
                <IndividualStructure
                    key={selectedStructure.name}
                    name={selectedStructure.name}
                    title={selectedStructure.title}
                    labels={selectedStructure.labels}
                    imageSrc={selectedStructure.imageSrc}
                    actions={selectedStructure.actions}
                    buttons={selectedStructure.buttons}
                    structureId={selectedStructure.structureId}
                    onClose={handleClose}
                />
            )}
            <UnownedSurfaceStructures />
        </div>
  );
};

export function OrbitalStructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
  const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    };

    try {
      const response = await fetch('/api/gameplay/inventory');
      const itemsData: StructureItemDetail[] = await response.json();

      const itemMap = new Map<number, StructureItemDetail>();
      itemsData.forEach(item => {
        if (item.ItemCategory === 'Structure') {
          itemMap.set(item.id, item);
        }
      });

      setItemDetails(itemMap);

      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('owner', session.user.id)
        .eq('anomaly', activePlanet.id);

      if (inventoryError) throw inventoryError;

      const uniqueStructuresMap = new Map<number, InventoryStructureItem>();
      inventoryData.forEach((structure: InventoryStructureItem) => {
        const itemDetail = itemMap.get(structure.item);
        if (itemDetail && itemDetail.locationType === 'Orbital' && !uniqueStructuresMap.has(structure.item)) {
          uniqueStructuresMap.set(structure.item, structure);
        }
      });

      const uniqueStructures = Array.from(uniqueStructuresMap.values());
      setUserStructuresOnPlanet(uniqueStructures || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, activePlanet?.id, supabase]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const getRandomAnimationDuration = () => `${Math.random() * 2 + 1.5}s`;
  const getRandomAnimationDelay = () => `${Math.random() * 1}s`;

  const handleIconClick = (itemId: number, inventoryId: number) => {
    const itemDetail = itemDetails.get(itemId);
    if (itemDetail) {
      const config = StructuresConfig[itemDetail.id] || {};
      setSelectedStructure({
        name: itemDetail.name,
        imageSrc: itemDetail.icon_url,
        title: `Structure ID: ${inventoryId}`,
        labels: config.labels || [],
        actions: config.actions || [],
        buttons: config.buttons.map(button => ({
          ...button,
          showInNoModal: true,
        })),
        structureId: inventoryId
      });
    }
  };

  const handleClose = useCallback(() => {
    setSelectedStructure(null);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const activeStructure = userStructuresOnPlanet.find(structure => structure.item === missionStructureId);
  const otherStructures = userStructuresOnPlanet.filter(structure => structure.item !== missionStructureId);

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-1 gap-y-1">
        {activeStructure && (
          <div key={activeStructure.id} className="flex flex-col items-center space-y-2">
            <img
              src={itemDetails.get(activeStructure.item)?.icon_url}
              alt={itemDetails.get(activeStructure.item)?.name}
              className="w-10 h-10 object-cover cursor-pointer bouncing-structure"
              onClick={() => handleIconClick(activeStructure.item, activeStructure.id)}
            />
          </div>
        )}
        {otherStructures.map((structure) => {
          const itemDetail = itemDetails.get(structure.item);

          return itemDetail ? (
            <div key={structure.id} className="flex flex-col items-center space-y-2">
              <img
                src={itemDetail.icon_url}
                alt={itemDetail.name}
                className="w-8 h-8 object-cover cursor-pointer moving-structure"
                onClick={() => handleIconClick(itemDetail.id, structure.id)}
              />
            </div>
          ) : null;
        })}
      </div>

      {selectedStructure && (
        <IndividualStructure
          key={selectedStructure.name}
          name={selectedStructure.name}
          title={selectedStructure.title}
          labels={selectedStructure.labels}
          imageSrc={selectedStructure.imageSrc}
          actions={selectedStructure.actions}
          buttons={selectedStructure.buttons}
          structureId={selectedStructure.structureId}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export function AtmosphereStructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
  const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch item details from the gameplay API
      const response = await fetch('/api/gameplay/inventory');
      const itemsData: StructureItemDetail[] = await response.json();

      // Create a map for quick access to item details
      const itemMap = new Map<number, StructureItemDetail>();
      itemsData.forEach(item => {
        if (item.ItemCategory === 'Structure') {
          itemMap.set(item.id, item);
        }
      });

      setItemDetails(itemMap);

      // Fetch inventory data for user and active planet
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('owner', session.user.id)
        .eq('anomaly', activePlanet.id);

      if (inventoryError) throw inventoryError;

      // Filter for unique structures based on locationType fetched from the API
      const uniqueStructuresMap = new Map<number, InventoryStructureItem>();
      inventoryData.forEach((structure: InventoryStructureItem) => {
        const itemDetail = itemMap.get(structure.item);
        if (itemDetail && itemDetail.locationType === 'Atmosphere' && !uniqueStructuresMap.has(structure.item)) {
          uniqueStructuresMap.set(structure.item, structure);
        }
      });

      const uniqueStructures = Array.from(uniqueStructuresMap.values());
      setUserStructuresOnPlanet(uniqueStructures || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, activePlanet?.id, supabase]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleIconClick = (itemId: number, inventoryId: number) => {
    const itemDetail = itemDetails.get(itemId);
    if (itemDetail) {
      const config = StructuresConfig[itemDetail.id] || {};
      setSelectedStructure({
        name: itemDetail.name,
        imageSrc: itemDetail.icon_url,
        title: `Structure ID: ${inventoryId}`,
        labels: config.labels || [],
        actions: config.actions || [],
        buttons: config.buttons.map(button => ({
          ...button, 
          showInNoModal: true,
        })),
        structureId: inventoryId
      });
    }
  };

  const handleClose = useCallback(() => {
    setSelectedStructure(null);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const activeStructure = userStructuresOnPlanet.find(structure => structure.item === missionStructureId);
  const otherStructures = userStructuresOnPlanet.filter(structure => structure.item !== missionStructureId);

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-1 gap-y-3">
        {activeStructure && (
          <div key={activeStructure.id} className="flex flex-col items-center space-y-2">
            <img
              src={itemDetails.get(activeStructure.item)?.icon_url}
              alt={itemDetails.get(activeStructure.item)?.name}
              className="w-16 h-16 object-cover cursor-pointer hovering-structure"
              onClick={() => handleIconClick(activeStructure.item, activeStructure.id)}
            />
          </div>
        )}
        {otherStructures.map((structure) => {
          const itemDetail = itemDetails.get(structure.item);

          return itemDetail ? (
            <div key={structure.id} className="flex flex-col items-center space-y-2">
              <img
                src={itemDetail.icon_url}
                alt={itemDetail.name}
                className="w-14 h-14 object-cover cursor-pointer hovering-structure"
                onClick={() => handleIconClick(itemDetail.id, structure.id)}
              />
            </div>
          ) : null;
        })}
      </div>

      {selectedStructure && (
        <IndividualStructure
          key={selectedStructure.name}
          name={selectedStructure.name}
          title={selectedStructure.title}
          labels={selectedStructure.labels}
          imageSrc={selectedStructure.imageSrc}
          actions={selectedStructure.actions}
          buttons={selectedStructure.buttons}
          structureId={selectedStructure.structureId}
          onClose={handleClose}
        />
      )}
    </div>
  );
};