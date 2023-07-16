import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

interface OwnedItem {
  id: number;
  item: number;
  quantity: number;
}

interface Item {
  id: number;
  name: string;
  icon_url: string;
}

const OwnedItemsList: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [ownedItems, setOwnedItems] = useState([]);
  const [itemDetails, setItemDetails] = useState([]);

  useEffect(() => {
    async function fetchOwnedItems() {
      if (session) {
        try {
          const user = session.user.id;
          const { data, error } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', user);

          if (error) {
            throw error;
          }

          if (data) {
            setOwnedItems(data);
          }
        } catch (error) {
          console.error('Error fetching owned items:', error);
        }
      }
    }

    fetchOwnedItems();
  }, [session]);

  useEffect(() => {
    async function fetchItemDetails() {
      if (ownedItems.length > 0) {
        const itemIds = ownedItems.map(item => item.item);
        const { data, error } = await supabase
          .from('inventoryITEMS')
          .select('*')
          .in('id', itemIds);

        if (error) {
          console.error('Error fetching item details:', error);
        }

        if (data) {
          setItemDetails(data);
        }
      }
    }

    fetchItemDetails();
  }, [ownedItems]);

  return (
    <div className="bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Items</h2>
      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {itemDetails.map((item, index) => (
          <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">{item.name}</h3>
            <div className="mb-2">
              <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
            </div>
            <p className="text-gray-600">Quantity: {ownedItems[index]?.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OwnedItemsList;