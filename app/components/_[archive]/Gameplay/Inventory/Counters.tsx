"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useInventory } from "@/context/InventoryContext";
import { useActivePlanet } from "@/context/ActivePlanet";

interface Recipe {
  [key: string]: number;
};

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
  recipe?: Recipe;
};

export default function WhatIsRequired({ itemId }: { itemId: number }) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch('/api/gameplay/inventory');
        const data: InventoryItem[] = await response.json();
        const foundItem = data.find(item => item.id === itemId);
        
        if (foundItem) {
          setItem(foundItem);
          setRecipe(foundItem.recipe || null);
        } else {
          setError('Item not found');
        }
      } catch (err) {
        setError('Error fetching item data');
      }
    }

    fetchItem();
  }, [itemId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      {recipe ? (
        <div>
          <h3>Crafting Recipe</h3>
          <ul>
            {Object.entries(recipe).map(([key, value]) => (
              <li key={key}>
                Item ID: {key}, Quantity: {value}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No crafting recipe for this item.</p>
      )}
    </div>
  );
};

  
interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    recipe?: Recipe;
};

interface UserItem {
    id: number;
    item: number;
    owner: string;
    quantity: number;
    notes: string;
    anomaly: string;
};

interface ActivePlanet {
    id: string;
};

export function DeleteMineralsAtEndOfMission() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { inventoryItems } = useInventory();
    const { activePlanet } = useActivePlanet();

    const [userItems, setUserItems] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      async function fetchUserItems() {
        if (!session) return;
  
        try {
          const { data, error } = await supabase
            .from("inventory")
            .select("*")
            .eq("owner", session.user.id);
  
          if (error) {
            throw error;
          }
  
          setUserItems(data);
        } catch (error: any) {
          console.log("Error fetching user items, ", error);
        }
      }
  
      fetchUserItems();
    }, [session, supabase]);

    const handleCleanMinerals = async () => {
        if (!session) return;
    
        setLoading(true);
    
        try {
          // Fetch inventory items from the API
          const response = await fetch("/api/gameplay/inventory");
          const globalInventoryItems: InventoryItem[] = await response.json();
    
          // Identify and delete mineral items
          const mineralItems = globalInventoryItems
            .filter((item) => item.ItemCategory === "Minerals")
            .map((item) => item.id);
    
          const itemsToDelete = userItems.filter(
            (userItem) =>
              mineralItems.includes(userItem.item) &&
              userItem.anomaly === activePlanet?.id
          );
    
          if (itemsToDelete.length > 0) {
            const { error } = await supabase
              .from("inventory")
              .delete()
              .in(
                "id",
                itemsToDelete.map((item) => item.id)
              );
    
            if (error) {
              throw error;
            }
    
            setUserItems((prevItems) =>
              prevItems.filter(
                (item) =>
                  !itemsToDelete.some((deletedItem) => deletedItem.id === item.id)
              )
            );
          }
        } catch (error: any) {
          console.log("Error fetching and deleting mineral items: ", error);
        } finally {
          setLoading(false);
        }
      };

    return (
        <div>
      <button 
        onClick={handleCleanMinerals} 
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Cleaning..." : "Clean Minerals"}
      </button>
      {/* {userItems.map((userItem) => {
        const itemDetails = inventoryItems[userItem.item];
        if (!itemDetails) return null;

        return (
          <div key={userItem.id} className="border p-4 my-2 rounded shadow">
            <h2 className="text-xl font-bold">{itemDetails.name}</h2>
            <p>{itemDetails.description}</p>
            <p>Quantity: {userItem.quantity}</p>
            <p>Notes: {userItem.notes}</p>
            {itemDetails.icon_url && (
              <img src={itemDetails.icon_url} alt={itemDetails.name} className="w-16 h-16" />
            )}
          </div>
        );
      })} */}
    </div>
    );
};