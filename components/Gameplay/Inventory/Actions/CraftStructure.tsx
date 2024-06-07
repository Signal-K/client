import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface InventoryItem {
  id: number;
  name: string;
  recipe?: { [key: string]: number };
}

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
};

interface UserInventoryItem {
  id: number;
  item: number;
  quantity: number;
  anomaly: number;
  recipe?: { [key: string]: number };
}

export default function CraftStructure({ structureId }: { structureId: number }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [recipeItems, setRecipeItems] = useState<string[]>([]);
    const [userInventory, setUserInventory] = useState<UserInventoryItem[] | undefined>(undefined); // Initialize as undefined
  
    useEffect(() => {
      async function fetchRecipe() {
        try {
          const response = await fetch(`/api/gameplay/inventory`);
          if (!response.ok) {
            throw new Error(`Error fetching inventory data: ${response.status} ${response.statusText}`);
          }
          const inventoryItems: InventoryItem[] = await response.json();
  
          const structure = inventoryItems.find((item) => item.id === structureId);
          if (!structure || !structure.recipe) {
            throw new Error("Structure or recipe not found.");
          }
  
          const items: string[] = [];
          for (const itemId in structure.recipe) {
            const quantity = structure.recipe[itemId];
            const itemName = inventoryItems.find((item) => item.id === parseInt(itemId))?.name; // Corrected comparison
            if (itemName) {
              items.push(`${quantity} ${itemName}`);
            }
          }
          setRecipeItems(items);
        } catch (error: any) {
          console.error("Error fetching recipe:", error.message);
        }
      }
  
      fetchRecipe();
    }, [structureId]);
  
    const hasRequiredItems = (structureId: number, inventoryItems: UserInventoryItem[] | undefined): boolean => {
      if (!inventoryItems || !activePlanet) return false;
  
    const requiredRecipe = inventoryItems.find((item) => item.id === structureId)?.recipe;

    if (!requiredRecipe) {
        return false;
    }

    for (const itemId in requiredRecipe) {
        const requiredQuantity = requiredRecipe[itemId as keyof typeof requiredRecipe];
        const userInventoryItems = inventoryItems.filter((item) => item.item === itemId && item.anomaly === activePlanet.id);
        const totalQuantity = userInventoryItems.reduce((acc, curr) => acc + curr.quantity, 0);

        if (totalQuantity < requiredQuantity) {
            return false;
        }
    }
  
      return true;
    };
  
    const removeItemsFromInventory = async (structureId: number, inventoryItems: UserInventoryItem[] | undefined) => {
      if (!inventoryItems || !activePlanet) return;
  
      const requiredRecipe = inventoryItems.find(item => item.id === structureId)?.recipe;
      
      if (requiredRecipe) {
        for (const itemId in requiredRecipe) {
            const requiredQuantity = requiredRecipe[itemId as keyof typeof requiredRecipe];
          let remainingQuantity = requiredQuantity;
          
          // Iterate through the user's inventory and remove items until requiredQuantity is reached
          for (const item of inventoryItems) {
            if (item.item === parseInt(itemId) && item.anomaly === activePlanet.id) {
              if (item.quantity <= remainingQuantity) {
                // If the item quantity is less than or equal to the remainingQuantity, remove the entire row
                await supabase.from('inventory').delete().eq('id', item.id);
                remainingQuantity -= item.quantity;
              } else {
                // If the item quantity is greater than the remainingQuantity, update the quantity and exit the loop
                await supabase.from('inventory').update({ quantity: item.quantity - remainingQuantity }).eq('id', item.id);
                break;
              }
            }
          }
        }
      }
    };
    
    const createCraftedStructureEntry = async (structureId: number) => {
      try {
        if (!session || !session.user || !activePlanet) return;
  
        const { data, error } = await supabase
          .from('inventory')
          .upsert([
            {
              item: structureId,
              owner: session.user.id,
              quantity: 1,
              time_of_deploy: new Date().toISOString(),
              notes: `Created by crafting ${structureId}`,
              anomaly: activePlanet.id,
            },
          ]);
    
        if (error) {
          throw error;
        }
    
        console.log('Inventory user entry created:', data);
        // Refetch the user inventory after creating a structure
        await fetchUserInventory(); // Assuming fetchUserInventory is defined elsewhere
      } catch (error: any) {
        console.log(error.message);
      }
    };
  
    const fetchUserInventory = async () => {
      try {
        if (!session || !session.user || !activePlanet) return;
  
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('owner', session.user.id)
          .eq('anomaly', activePlanet.id);
  
        if (error) {
          throw error;
        }
  
        setUserInventory(data || []);
      } catch (error: any) {
        console.error('Error fetching user inventory:', error.message);
      }
    };
  
    const handleCraftStructure = async () => {
      await fetchUserInventory();
      if (hasRequiredItems(structureId, userInventory)) {
        await removeItemsFromInventory(structureId, userInventory);
        await createCraftedStructureEntry(structureId);
      } else {
        console.log('User does not have required items to craft the structure');
      }
    };
  
    return (
      <div>
        <h2>Recipe for Structure {structureId}</h2>
        <ul>
          {recipeItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <button onClick={handleCraftStructure}>Craft Structure</button>
      </div>
    );
  }
