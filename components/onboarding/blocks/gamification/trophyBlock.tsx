import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

interface AddToInventoryButtonProps {
  itemId: number; // The item ID to add to the user's inventory
}

const AddToInventoryButton: React.FC<AddToInventoryButtonProps> = ({ itemId }) => {
  const session = useSession();
  const [hasItem, setHasItem] = useState(false);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function checkIfUserHasItem() {
      if (session) {
        try {
          const user = session.user;
          const { data, error } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', user.id)
            .eq('item', itemId);

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            setHasItem(true);
          }
        } catch (error) {
          console.error('Error checking user inventory:', error);
        }
      }
    }

    checkIfUserHasItem();
  }, [session, itemId]);

  const handleAddToInventory = async () => {
    if (session && !hasItem) {
      try {
        const user = session.user;
        const { error } = await supabase
          .from('inventoryUSERS')
          .upsert([
            {
              item: itemId,
              owner: user.id,
              quantity: 1,
            },
          ]);

        if (error) {
          throw error;
        }
        console.log('Item added to inventory successfully');
        setHasItem(true); // Update state to reflect that the user now has the item
      } catch (error) {
        console.error('Error adding item to inventory:', error);
      }
    }
  };

  return (
    <button
      onClick={handleAddToInventory}
      className="bg-blue-500 text-white px-3 py-1 rounded"
    >
      Add to Inventory
    </button>
  );
};


interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
}

const TrophyBlockLightkurveOnboardingPt1: React.FC = () => {
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null); // Added type annotation
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    async function fetchInventoryItem() {
      try {
        const { data, error } = await supabase
          .from('inventoryITEMS')
          .select('*')
          .eq('id', 9)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setInventoryItem(data);
        }
      } catch (error) {
        console.error('Error fetching inventory item:', error);
      }
    }

    fetchInventoryItem();
  }, []);

  return (
    <div className="bg-gray-100 p-4">
      {inventoryItem ? (
        <div className="bg-white shadow-md p-4 rounded-md max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">{inventoryItem.name}</h3>
          <div className="w-32 h-32 mb-2 mx-auto">
            <img src={inventoryItem.icon_url} alt={inventoryItem.name} className="w-full h-full object-cover rounded" />
          </div>
          <p className="text-gray-600">{inventoryItem.description}</p>
          <AddToInventoryButton itemId={inventoryItem.id} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TrophyBlockLightkurveOnboardingPt1;