import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  ItemCategory: string;
}

interface SupabaseInventoryItem {
  id: number;
  item: number;
  owner: string;
  quantity: number;
  anomaly: number;
};

interface InventoryListProps {
  anomaly: number;
}

const InventoryList = ({ anomaly }: InventoryListProps) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SupabaseInventoryItem[]>([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch('/api/gameplay/inventory');
        const items = await response.json();
        setInventoryItems(items);
      } catch (error) {
        console.error('Error fetching inventory items from API:', error);
      };
    };

    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (session?.user?.id && anomaly !== null) {
      const fetchFilteredInventory = async () => {
        try {
          const { data: inventoryData, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('owner', session.user.id)
            .eq('anomaly', anomaly)
            .not('item', 'lte', 100);

          if (error) {
            console.error('Error fetching from Supabase:', error);
            return;
          };

          const ownedItems = inventoryData?.filter((inventoryItem: SupabaseInventoryItem) => 
            inventoryItems.some((apiItem) => 
              apiItem.id === inventoryItem.item && 
              (apiItem.ItemCategory === 'Structure' || apiItem.ItemCategory === 'Automaton')
            )
          );

          setFilteredItems(ownedItems || []);
        } catch (error) {
          console.error('Error fetching filtered inventory:', error);
        };
      };

      fetchFilteredInventory();
    }
  }, [anomaly, session, supabase, inventoryItems]);

  if (!session?.user) {
    return <p>Please log in to view your inventory.</p>;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => {
          const apiItem = inventoryItems.find(apiItem => apiItem.id === item.item);
          return (
            <div key={item.id} className="flex flex-col items-center p-4 border rounded">
              <img src={apiItem?.icon_url || '/default-icon.png'} alt={apiItem?.name || 'Item'} className="w-16 h-16 mb-2" />
              <h3 className="text-lg font-bold">{apiItem?.name || 'Unknown Item'}</h3>
              <p>{apiItem?.description || 'No description available'}</p>
            </div>
          );
        })
      ) : (
        <p>No items found for this anomaly.</p>
      )}
    </div>
  );
};

export default InventoryList;