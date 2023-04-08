"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useRefresh } from "@/context/RefreshState";
import { useRouter } from "next/navigation";
import { useMissions } from "@/context/MissionContext"; // Import the useMissions hook

const CraftStructure = ({ structureId }: { structureId: number }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();
  const { triggerRefresh } = useRefresh();
  const { missions } = useMissions(); // Access the missions from the context
  const [structureName, setStructureName] = useState<string>("");
  const [recipeItems, setRecipeItems] = useState<string[]>([]);
  const [craftable, setCraftable] = useState(false);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [createdInventoryId, setCreatedInventoryId] = useState<number | null>(null);
  const [userTelescopeId, setUserTelescopeId] = useState(0);
  const [notes, setNotes] = useState('');
  const [structureTableId, setSTID] = useState(0);
  const router = useRouter();

  // Mission Data Initialization
  const missionData = {
    user: session?.user?.id,
    time_of_completion: new Date().toISOString(),
    mission: 7,
    configuration: null,
    rewarded_items: [13],
  };

  const inventoryData = {
    item: missionData.rewarded_items[0],
    owner: session?.user?.id,
    quantity: 1,
    notes: "Created upon the completion of mission 7",
    parentItem: null,
    time_of_deploy: new Date().toISOString(),
    anomaly: activePlanet?.id,
  };

  useEffect(() => {
    if (!missions || missions.length === 0) return;

    async function fetchRecipe() {
      try {
        const response = await fetch(`/api/gameplay/inventory`);
        if (!response.ok) {
          throw new Error(`Error fetching inventory data: ${response.status} ${response.statusText}`);
        }
        const inventoryItems = await response.json();

        const structure = inventoryItems.find((item: { id: number }) => item.id === structureId);
        if (!structure || !structure.recipe) {
          throw new Error("Structure or recipe not found.");
        }

        setStructureName(structure.name);

        const items: string[] = [];
        let isCraftable = true;
        for (const itemId in structure.recipe) {
          const quantity = structure.recipe[itemId];
          const itemName = inventoryItems.find((item: { id: number }) => item.id === parseInt(itemId, 10))?.name;
          if (itemName) {
            items.push(`${quantity} ${itemName}`);
            const userItem = userInventory.find((item: { item: number; quantity: number }) =>
              item.item === parseInt(itemId, 10) &&
              item.quantity >= quantity
            );
            if (!userItem) {
              isCraftable = false;
              break;
            }
          }
        }

        // Additional check for structureId 32
        if (structureId === 32) {
          const hasRequiredItem = userInventory.some(
            (item) => item.item === 28 && item.quantity > 0 && item.anomaly === activePlanet?.id
          );
          if (!hasRequiredItem) {
            isCraftable = false;
          }
        }

        setRecipeItems(items);
        setCraftable(isCraftable);
      } catch (error: any) {
        console.error("Error fetching recipe:", error.message);
      }
    }

    fetchRecipe();
  }, [structureId, userInventory, activePlanet, missions]);

  const handleMissionComplete = async () => {
    try {
      const { error: newMissionError } = await supabase
        .from("missions")
        .insert([missionData]);

      if (newMissionError) {
        throw newMissionError;
      }

      const { error: newInventoryEntryError } = await supabase
        .from("inventory")
        .insert([inventoryData]);

      if (newInventoryEntryError) {
        throw newInventoryEntryError;
      }

      triggerRefresh();
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchUserTelescope = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("owner", session?.user?.id)
        .eq("item", 12)
        .eq("anomaly", activePlanet?.id);

      if (error) {
        throw error;
      }

      setUserTelescopeId(data[0]?.id || 0);
    } catch (error: any) {
      console.log(error);
    }
  };

  const unlockMission10IfNeeded = async () => {
    const mission10Unlocked = missions.some((mission) => mission.id === 10);
    if (!mission10Unlocked) {
      const missionData = {
        user: session?.user?.id,
        time_of_completion: null,
        mission: 10,
      };

      const { error: missionError } = await supabase
        .from('missions')
        .insert([missionData]);
      if (missionError) {
        throw missionError;
      }
    }
  };

  const craftStructure = async () => {
    if (session && activePlanet?.id && craftable) {
      try {
        const { data: parentData, error: parentError } = await supabase
          .from('inventory')
          .select('id')
          .eq('owner', session?.user?.id)
          .eq('item', 12)
          .eq('anomaly', activePlanet?.id);

        if (parentError || !parentData || parentData.length === 0) {
          throw new Error('Parent item does not exist');
        }

        const parentItemId = parentData[0].id;

        if (structureId === 14) {
          setNotes(`Created by crafting ${structureId} for mission 7`);
        };

        if (structureId === 26) {
          await unlockMission10IfNeeded();

          const missionData = {
            user: session?.user?.id,
            time_of_completion: new Date().toISOString(),
            mission: 12,
          };

          const { error: missionError } = await supabase
            .from('missions')
            .insert([missionData]);
          if (missionError) {
            throw missionError;
          }
        }

        if (structureId === 28) {
          await unlockMission10IfNeeded();

          const missionData = {
            user: session?.user?.id,
            time_of_completion: new Date().toISOString(),
            mission: 15,
          };

          const { error: missionError } = await supabase
            .from('missions')
            .insert([missionData]);
          if (missionError) {
            throw missionError;
          }
        }

        if (structureId === 32) {
          await unlockMission10IfNeeded();

          const missionData = {
            user: session?.user?.id,
            time_of_completion: new Date().toISOString(),
            mission: 16,
          };

          const { error: missionError } = await supabase
            .from('missions')
            .insert([missionData]);
          if (missionError) {
            throw missionError;
          }
        }

        if (structureId === 30) {
          await unlockMission10IfNeeded();

          const missionData = {
            user: session?.user?.id,
            time_of_completion: new Date().toISOString(),
            mission: 10,
          };

          const { error: missionError } = await supabase
            .from('missions')
            .insert([missionData]);
          if (missionError) {
            throw missionError;
          }
        }

        const { error: insertError } = await supabase
          .from('inventory')
          .insert([
            {
              item: structureId,
              owner: session?.user?.id,
              quantity: 1,
              time_of_deploy: new Date().toISOString(),
              parentItem: parentItemId,
              notes: notes,
              anomaly: activePlanet.id,
            },
          ]);

        if (insertError) {
          throw insertError;
        }

        handleMissionComplete();
        await fetchNewlyCreatedRow();
        await updateNotes();
        triggerRefresh();
        router.refresh();
        fetchUserInventory();
      } catch (error: any) {
        console.log(error.message);
      }
    }
  };

  const fetchUserInventory = async () => {
    try {
      if (session?.user?.id && activePlanet?.id) {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('owner', session.user.id)
          .eq('anomaly', activePlanet.id);

        if (error) {
          throw error;
        }

        setUserInventory(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching user inventory:', error.message);
    }
  };

  const fetchNewlyCreatedRow = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("owner", session?.user?.id)
        .eq("item", structureId)
        .eq("anomaly", activePlanet?.id);

      if (error) {
        throw error;
      }

      setSTID(data[0]?.id || 0);
    } catch (error: any) {
      console.log(error);
    }
  };

  const updateNotes = async () => {
    try {
      const { error } = await supabase
        .from("inventory")
        .update({ notes: `Created by crafting ${structureTableId}` })
        .eq("id", structureTableId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (missions.length === 0) return;  // If no missions are available, skip further processing

    fetchUserInventory();
    fetchUserTelescope();
  }, [session, activePlanet, missions]);

  return (
    <>
      {missions.length > 0 && (  // Check if there are missions before rendering the component
        <div>
          <h2>Recipe for {structureName}</h2>
          <ul>
            {recipeItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          {craftable && (
            <button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 py-2"
              onClick={craftStructure}
            >
              Craft Structure
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default CraftStructure;