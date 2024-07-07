import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

interface UserItem {
  id: number;
  item: number;
  quantity: number;
  anomaly: number;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  recipe?: Record<string, number>;
  icon_url?: string;
  ItemCategory: string; // Added for filtering structures
}

interface Props {
  craftItemId: number;
  onClose: () => void;
}

const SingleAutomatonCraftItem: React.FC<Props> = ({ craftItemId, onClose }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [craftableItem, setCraftableItem] = useState<InventoryItem | null>(null);
  const [requiredResources, setRequiredResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUserItems() {
      if (!session) return;

      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('owner', session.user.id);

        if (error) {
          throw error;
        }

        setUserItems(data || []);
      } catch (error: any) {
        console.error('Error fetching user items:', error.message);
      }
    }

    async function fetchInventoryItems() {
      try {
        const response = await fetch('/api/gameplay/inventory');
        if (!response.ok) {
          throw new Error(`Error fetching inventory items: ${response.status} ${response.statusText}`);
        }
        const data: InventoryItem[] = await response.json();
        setInventoryItems(data);
      } catch (error: any) {
        console.error('Error fetching inventory items:', error.message);
      }
    }

    fetchUserItems();
    fetchInventoryItems();
  }, [session, supabase]);

  useEffect(() => {
    const craftItem = inventoryItems.find(item => item.id === craftItemId);
    if (!craftItem?.recipe) return;
    setCraftableItem(craftItem);

    const missingResources: string[] = [];
    for (const [resourceId, requiredQuantity] of Object.entries(craftItem.recipe)) {
      const userResource = userItems.find(item => item.item === parseInt(resourceId));
      const userQuantity = userResource ? userResource.quantity : 0;

      if (userQuantity < requiredQuantity) {
        const resourceItem = inventoryItems.find(item => item.id === parseInt(resourceId));
        const missingQuantity = requiredQuantity - userQuantity;
        if (resourceItem) {
          missingResources.push(`${resourceItem.name}: ${missingQuantity} more needed`);
        }
      }
    }

    setRequiredResources(missingResources);
  }, [inventoryItems, userItems, craftItemId]);

  const unlockMission = async (missionId: number) => {
    const { data: existingMissions } = await supabase
      .from('missions')
      .select('*')
      .eq('user', session?.user?.id)
      .eq('mission', missionId);
      
    if (existingMissions?.length === 0) {
      const { error } = await supabase
        .from('missions')
        .insert([{ user: session?.user?.id, time_of_completion: null, mission: missionId }]);
      if (error) {
        throw error;
      }
    }
  };

  const handleCraftStructure = async () => {
    if (requiredResources.length > 0) {
      alert("You don't have enough resources to craft this structure.");
      return;
    }

    setLoading(true);

    try {
      const craftItem = inventoryItems.find(item => item.id === craftItemId);
      if (!craftItem?.recipe) return;

      for (const [resourceId, requiredQuantity] of Object.entries(craftItem.recipe)) {
        const userResource = userItems.find(item => item.item === parseInt(resourceId));
        if (userResource) {
          const newQuantity = userResource.quantity - requiredQuantity;

          if (newQuantity > 0) {
            const { error } = await supabase
              .from('inventory')
              .update({ quantity: newQuantity })
              .eq('id', userResource.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('inventory')
              .delete()
              .eq('id', userResource.id);
            if (error) throw error;
          }
        }
      }

      const { error } = await supabase
        .from('inventory')
        .insert([{ item: craftItemId, owner: session?.user.id, quantity: 1, anomaly: activePlanet?.id }]);
      if (error) throw error;

      if (craftItemId === 30) await unlockMission(10);  // Unlock mission 10 for item 30
      if (craftItemId === 26) await unlockMission(12);  // Unlock mission 12 for item 26

      alert("Structure crafted successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error crafting structure:", error.message);
      alert("Failed to craft structure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        {craftableItem ? (
          <>
            <img src={craftableItem.icon_url} alt={craftableItem.name} className="w-32 h-32 mb-2 cursor-pointer" />
            <h3 className="text-lg font-semibold mb-2">{craftableItem.name}</h3>
            <p className="text-sm text-gray-700 mb-4">{craftableItem.description}</p>
            <p className="font-medium mb-2">Required Resources:</p>
            <ul className="list-disc pl-5 mb-4">
              {craftableItem.recipe && Object.entries(craftableItem.recipe).map(([resourceId, quantity]) => {
                const resourceItem = inventoryItems.find(item => item.id === parseInt(resourceId));
                const userResource = userItems.find(item => item.item === parseInt(resourceId));
                const userQuantity = userResource ? userResource.quantity : 0;

                return (
                  <li key={resourceId}>
                    {resourceItem?.name}: {userQuantity}/{quantity}
                  </li>
                );
              })}
            </ul>
            {requiredResources.length > 0 ? (
              <div className="text-red-600 mb-4">
                <p>You need more resources to craft this item:</p>
                <ul className="list-disc pl-5 mt-2">
                  {requiredResources.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleCraftStructure}
                disabled={loading}
              >
                {loading ? 'Crafting...' : 'Craft Structure'}
              </button>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
        <button
          className="btn btn-secondary mt-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SingleAutomatonCraftItem;


interface UserItem {
  id: number;
  item: number;
  quantity: number;
  anomaly: number;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  recipe?: Record<string, number>;
  icon_url?: string;
}

export const StructureInformationForAutomaton: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<number | null>(null);
  const [requiredResources, setRequiredResources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUserItems() {
      if (!session) return;

      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('owner', session.user.id);

        if (error) {
          throw error;
        }

        setUserItems(data || []);
      } catch (error: any) {
        console.error('Error fetching user items:', error.message);
      }
    }

    async function fetchInventoryItems() {
      try {
        const response = await fetch('/api/gameplay/inventory');
        if (!response.ok) {
          throw new Error(`Error fetching inventory items: ${response.status} ${response.statusText}`);
        }
        const data: InventoryItem[] = await response.json();
        setInventoryItems(data.filter(item => item.ItemCategory === 'Structure'));
      } catch (error: any) {
        console.error('Error fetching inventory items:', error.message);
      }
    }

    fetchUserItems();
    fetchInventoryItems();
  }, [session, supabase]);

  useEffect(() => {
    if (selectedStructureId === null) return;

    const craftItem = inventoryItems.find(item => item.id === selectedStructureId);
    if (!craftItem?.recipe) return;

    const missingResources: string[] = [];
    for (const [resourceId, requiredQuantity] of Object.entries(craftItem.recipe)) {
      const userResource = userItems.find(item => item.item === parseInt(resourceId));
      const userQuantity = userResource ? userResource.quantity : 0;

      if (userQuantity < requiredQuantity) {
        const resourceItem = inventoryItems.find(item => item.id === parseInt(resourceId));
        const missingQuantity = requiredQuantity - userQuantity;
        if (resourceItem) {
          missingResources.push(`${resourceItem.name}: ${missingQuantity} more needed`);
        }
      }
    }

    setRequiredResources(missingResources);
  }, [inventoryItems, userItems, selectedStructureId]);

  const handleCraftStructure = async () => {
    if (requiredResources.length > 0) {
      alert("You don't have enough resources to craft this structure.");
      return;
    }

    setLoading(true);

    try {
      const craftItem = inventoryItems.find(item => item.id === selectedStructureId);
      if (!craftItem?.recipe) return;

      for (const [resourceId, requiredQuantity] of Object.entries(craftItem.recipe)) {
        const userResource = userItems.find(item => item.item === parseInt(resourceId));
        if (userResource) {
          const newQuantity = userResource.quantity - requiredQuantity;

          if (newQuantity > 0) {
            const { error } = await supabase
              .from('inventory')
              .update({ quantity: newQuantity })
              .eq('id', userResource.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('inventory')
              .delete()
              .eq('id', userResource.id);
            if (error) throw error;
          }
        }
      }

      const { error } = await supabase
        .from('inventory')
        .insert([{ item: selectedStructureId, owner: session?.user.id, quantity: 1, anomaly: activePlanet?.id }]);
      if (error) throw error;

      alert("Structure crafted successfully!");
      setSelectedStructureId(null); // Reset the selection
    } catch (error: any) {
      console.error("Error crafting structure:", error.message);
      alert("Failed to craft structure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">Select structure you want to build</h2>
        <select
          value={selectedStructureId ?? ''}
          onChange={(e) => setSelectedStructureId(e.target.value ? parseInt(e.target.value) : null)}
          className="mb-4 p-2 border border-gray-300 rounded"
        >
          <option value="" disabled>Select a structure</option>
          {inventoryItems.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>

        {selectedStructureId !== null && (
          <div className="flex flex-col items-center">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <img src={inventoryItems.find(item => item.id === selectedStructureId)?.icon_url} alt={inventoryItems.find(item => item.id === selectedStructureId)?.name} className="w-32 h-32 mb-2 cursor-pointer" />
                <h3 className="text-lg font-semibold mb-2">{inventoryItems.find(item => item.id === selectedStructureId)?.name}</h3>
                <p className="text-sm text-gray-700 mb-4">{inventoryItems.find(item => item.id === selectedStructureId)?.description}</p>
                <p className="font-medium mb-2">Required Resources:</p>
                <ul className="list-disc pl-5 mb-4">
                  {inventoryItems.find(item => item.id === selectedStructureId)?.recipe && Object.entries(inventoryItems.find(item => item.id === selectedStructureId)?.recipe!).map(([resourceId, quantity]) => {
                    const resourceItem = inventoryItems.find(item => item.id === parseInt(resourceId));
                    const userResource = userItems.find(item => item.item === parseInt(resourceId));
                    const userQuantity = userResource ? userResource.quantity : 0;

                    return (
                      <li key={resourceId} className={userQuantity >= quantity ? 'text-green-500' : 'text-red-500'}>
                        {resourceItem?.name}: {userQuantity}/{quantity}
                      </li>
                    );
                  })}
                </ul>
                {requiredResources.length > 0 ? (
                  <div className="text-red-600 mb-4">
                    <p>You need more resources to craft this item:</p>
                    <ul className="list-disc pl-5 mt-2">
                      {requiredResources.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleCraftStructure}
                    disabled={loading}
                  >
                    {loading ? 'Crafting...' : 'Craft Structure'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};