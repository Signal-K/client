"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import IndividualStructure from "./IndividualStructure";
import { StructuresConfig } from "@/constants/Structures/Properties";
import { LockIcon } from "lucide-react";
import AnimatedPointer from "../(scenes)/chapters/helpers/animatedPointer";
import { IndividualStructureProps } from "./IndividualStructure";

import "../../../styles/Anims/StarterStructureAnimations.css";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
};

import { CitizenScienceModule } from "@/app/api/citizen/modules/route";

export default function StructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
  
    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
    const [activeMission, setActiveMission] = useState<number | null>(null);
    const [missionStructureId, setMissionStructureId] = useState<number | null>(null);
  
    const fetchStructures = useCallback(async () => {
      if (!session?.user?.id || !activePlanet?.id) {
        setLoading(false);
        return;
      }
  
      try {
        // Fetch active mission from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('activeMission')
          .eq('id', session.user.id)
          .single();
  
        if (profileError) throw profileError;
  
        setActiveMission(profileData.activeMission);
  
        // Fetch Citizen Science Module data
        const modulesResponse = await fetch('/api/citizen/modules');
        const modulesData: CitizenScienceModule[] = await modulesResponse.json();
  
        // Find the module associated with the active mission
        const activeModule = modulesData.find(module => module.starterMission === profileData.activeMission);
        if (activeModule) {
          setMissionStructureId(activeModule.structure);  // Set the structure ID associated with the active mission
        }
  
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
        inventoryData.forEach(structure => {
          const itemDetail = itemMap.get(structure.item);
          if (itemDetail && itemDetail.locationType === 'Surface' && !uniqueStructuresMap.has(structure.item)) {
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
        <div className="grid grid-cols-3 gap-1 gap-y-3">
          {activeStructure && (
            <div key={activeStructure.id} className="flex flex-col items-center space-y-2">
              <img
                src={itemDetails.get(activeStructure.item)?.icon_url}
                alt={itemDetails.get(activeStructure.item)?.name}
                className="w-16 h-16 object-cover cursor-pointer bouncing-structure"
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
                  className="w-14 h-14 object-cover cursor-pointer moving-structure"
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

export function OrbitalStructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch active mission from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('activeMission')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      setActiveMission(profileData.activeMission);

      // Fetch Citizen Science Module data
      const modulesResponse = await fetch('/api/citizen/modules');
      const modulesData: CitizenScienceModule[] = await modulesResponse.json();

      // Find the module associated with the active mission
      const activeModule = modulesData.find(module => module.starterMission === profileData.activeMission);
      if (activeModule) {
        setMissionStructureId(activeModule.structure);  // Set the structure ID associated with the active mission
      }

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
      inventoryData.forEach(structure => {
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
      <div className="grid grid-cols-3 gap-1 gap-y-3">
        {activeStructure && (
          <div key={activeStructure.id} className="flex flex-col items-center space-y-2">
            <img
              src={itemDetails.get(activeStructure.item)?.icon_url}
              alt={itemDetails.get(activeStructure.item)?.name}
              className="w-16 h-16 object-cover cursor-pointer bouncing-structure"
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
                className="w-14 h-14 object-cover cursor-pointer moving-structure"
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
  const [activeMission, setActiveMission] = useState<number | null>(null);
  const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

  const fetchStructures = useCallback(async () => {
    if (!session?.user?.id || !activePlanet?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch active mission from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('activeMission')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      setActiveMission(profileData.activeMission);

      // Fetch Citizen Science Module data
      const modulesResponse = await fetch('/api/citizen/modules');
      const modulesData: CitizenScienceModule[] = await modulesResponse.json();

      // Find the module associated with the active mission
      const activeModule = modulesData.find(module => module.starterMission === profileData.activeMission);
      if (activeModule) {
        setMissionStructureId(activeModule.structure);  // Set the structure ID associated with the active mission
      }

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
      inventoryData.forEach(structure => {
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
      <div className="grid grid-cols-3 gap-1 gap-y-3">
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

export function StarterMissionStructures() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [starterMissionStructures, setStarterMissionStructures] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);

    const fetchStructures = useCallback(async () => {
        if (!session?.user?.id || !activePlanet?.id) {
            setLoading(false);
            return;
        }

        try {
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id)
                .not('item', 'lte', 100);

            if (inventoryError) throw inventoryError;

            const uniqueStructures = Array.from(new Map(
                inventoryData
                    .filter((structure: InventoryStructureItem) => {
                        const config = structure.configuration as { "Created for"?: string };
                        return config["Created for"] === "Starter mission";
                    })
                    .map((structure: InventoryStructureItem) => [structure.item, structure])
            ).values());

            setStarterMissionStructures(uniqueStructures);

            const response = await fetch('/api/gameplay/inventory');
            const itemsData = await response.json();

            const itemMap = new Map<number, StructureItemDetail>();
            itemsData.forEach((item: StructureItemDetail) => {
                if (item.ItemCategory === 'Structure') {
                    itemMap.set(item.id, item);
                }
            });

            setItemDetails(itemMap);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    const handleIconClick = (itemId: number, structureId: number) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const config = StructuresConfig[itemDetail.id] || {};
            setSelectedStructure({
                name: itemDetail.name,
                imageSrc: itemDetail.icon_url,
                title: config.title || '',
                labels: config.labels || [],
                actions: config.actions || [],
                buttons: config.buttons.map(button => ({
                    ...button,
                    showInNoModal: true,
                })),
                structureId: structureId
            });
        }
    };

    const handleClose = () => {
        setSelectedStructure(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Starter Mission Structures</h2>
            <div className="flex flex-row space-y-4 relative">
                {starterMissionStructures.map((structure) => {
                    const itemDetail = itemDetails.get(structure.item);
                    return itemDetail ? (
                        <div key={structure.id} className="flex items-center space-x-4 relative">
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() => handleIconClick(itemDetail.id, structure.id)} // Pass both arguments
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

export function ActiveMissionStructures() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
    const [activeMission, setActiveMission] = useState<number | null>(null);
    const [missionStructureId, setMissionStructureId] = useState<number | null>(null);

    const fetchStructures = useCallback(async () => {
        if (!session?.user?.id || !activePlanet?.id) {
            setLoading(false);
            return;
        }

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('activeMission')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;

            setActiveMission(profileData.activeMission);

            const modulesResponse = await fetch('/api/citizen/modules');
            const modulesData = await modulesResponse.json();
            const activeModule = modulesData.find((module: { starterMission: any; }) => module.starterMission === profileData.activeMission);
            if (activeModule) {
                setMissionStructureId(activeModule.structure);
            };

            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id)
                .not('item', 'lte', 100);

            if (inventoryError) throw inventoryError;

            const uniqueStructures = Array.from(new Map(
                inventoryData
                    .filter((structure: InventoryStructureItem) => structure.item === missionStructureId)
                    .map((structure: InventoryStructureItem) => [structure.item, structure])
            ).values());

            setUserStructuresOnPlanet(uniqueStructures);

            const response = await fetch('/api/gameplay/inventory');
            const itemsData = await response.json();

            const itemMap = new Map<number, StructureItemDetail>();
            itemsData.forEach((item: StructureItemDetail) => {
                if (item.ItemCategory === 'Structure') {
                    itemMap.set(item.id, item);
                }
            });

            setItemDetails(itemMap);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, activePlanet?.id, supabase, missionStructureId]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    const handleIconClick = (itemId: number, structureId: number) => {
        const itemDetail = itemDetails.get(itemId);
        if (itemDetail) {
            const config = StructuresConfig[itemDetail.id] || {};
            setSelectedStructure({
                name: itemDetail.name,
                imageSrc: itemDetail.icon_url,
                title: `${config.title} (ID: ${structureId})`, // Append the structure ID to the title
                labels: config.labels || [],
                actions: config.actions || [],
                buttons: config.buttons.map(button => ({
                    ...button,
                    text: button.text?.includes('Tutorial') ? `Tutorial ${structureId}` : button.text, // Dynamically update the text if needed
                    showInNoModal: true,
                })),
                structureId: structureId // Pass structureId here
            });
        }
    };
    
    useEffect(() => {
        if (activeMission && missionStructureId) {
            const firstStructure = userStructuresOnPlanet.find(structure => structure.item === missionStructureId);
            if (firstStructure) {
                const itemDetail = itemDetails.get(firstStructure.item);
                if (itemDetail) {
                    const config = StructuresConfig[itemDetail.id] || {};
                    setSelectedStructure({
                        name: itemDetail.name,
                        imageSrc: itemDetail.icon_url,
                        title: `${config.title} (ID: ${firstStructure.id})`, // Append the structure ID to the title
                        labels: config.labels || [],
                        actions: config.actions || [],
                        buttons: config.buttons.map(button => ({
                            ...button,
                            text: button.text?.includes('Tutorial') ? `Tutorial ${firstStructure.id}` : button.text, // Dynamically update the text if needed
                            showInNoModal: true,
                        })),
                        structureId: firstStructure.id // Pass structureId here
                    });
                }
            }
        }
    }, [activeMission, missionStructureId, userStructuresOnPlanet, itemDetails]);

    const handleClose = () => {
        setSelectedStructure(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Active Mission Structures</h2>
            <div className="flex flex-row space-y-4 relative">
                {userStructuresOnPlanet.map((structure) => {
                    const itemDetail = itemDetails.get(structure.item);
                    return itemDetail ? (
                        <div key={structure.id} className="flex items-center space-x-4 relative">
                            <img
                                src={itemDetail.icon_url}
                                alt={itemDetail.name}
                                className="w-16 h-16 object-cover cursor-pointer"
                                onClick={() => handleIconClick(itemDetail.id, structure.id)} // Pass both arguments
                            />
                            {structure.item === missionStructureId && (
                                <AnimatedPointer
                                    position="top"
                                    arrowDirection="left"
                                    offset={-10}
                                    size={20}
                                />
                            )}
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
                    structureId={selectedStructure.structureId} // Pass the structureId prop
                    onClose={handleClose}
                />
            )}
        </div>
    );
};