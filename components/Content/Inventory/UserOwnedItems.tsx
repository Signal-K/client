import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

const OwnedItemsList: React.FC = () => { 
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const [itemDetails, setItemDetails] = useState([]);
  
    useEffect(() => {
      const fetchOwnedItems = async () => {
        try {
          if (!session) return;
  
          const user = session.user.id;
          const { data: ownedItemsData, error: ownedItemsError } = await supabase
            .from('inventoryUSERS')
            .select('*')
            .eq('owner', user);
  
          if (ownedItemsError) {
            throw ownedItemsError;
          }
  
          if (ownedItemsData) {
            const itemIds = ownedItemsData.map(item => item.item);
            const { data: itemDetailsData, error: itemDetailsError } = await supabase
              .from('inventoryITEMS')
              .select('*')
              .in('id', itemIds)
              .gt('id', 10);
  
            if (itemDetailsError) {
              throw itemDetailsError;
            }
  
            if (itemDetailsData) {
              setItemDetails(itemDetailsData.slice(0, 8)); // Limit
            }
          }
        } catch (error) {
          console.error('Error fetching owned items:', error.message);
        }
      };
  
      fetchOwnedItems();
    }, [session]);
  
    // Function to calculate the position of each item around the circle
    const calculatePosition = (index: number, totalItems: number) => {
      const angle = (index / totalItems) * 360;
      const radius = 15; // Adjust as needed
      const centerX = 15; // Adjust as needed
      const centerY = 175; // Adjust as needed
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y };
    };
    const radius = 100;

    return (
      <div className="relative w-80 h-80 flex -mx-20">
        {itemDetails.map((item, index) => {
          const angle = (index / itemDetails.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
    
          return (
            <div
              key={item.id}
              className="absolute flex flex-col items-center justify-center -mx-10 pb-3"
              style={{ top: `calc(50% - ${y}px)`, left: `calc(50% + ${x}px)` }}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                <img src={item.icon_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-center">{item.name}</p>
            </div>
          );
        })}
      </div>
    );    
};

export default OwnedItemsList;

interface InventoryItem {
  id: number;
  name: string;
  icon_url: string;
  quantity: number;
}

export const ItemsVerticalList: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [ownedItems, setOwnedItems] = useState([]);
  const [itemDetails, setItemDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    if (!session || !supabase) {
      return;
    }

    const fetchOwnedItemsAndDetails = async () => {
      try {
        setIsLoading(true);
        const userId = session.user.id;

        // Fetch owned items from the database
        const { data: ownedItemsData, error: ownedItemsError } = await supabase
          .from("inventoryUSERS")
          .select("*")
          .eq("owner", userId)
          .gt("id", 20)
          .limit(6)
          .order("id", { ascending: false });

        if (ownedItemsError) {
          throw ownedItemsError;
        }

        if (ownedItemsData) {
          setOwnedItems(ownedItemsData);

          // Extract item IDs from owned items
          const itemIds = ownedItemsData.map(item => item.item);

          // Fetch details of owned items based on item IDs
          const { data: itemDetailsData, error: itemDetailsError } = await supabase
            .from("inventoryITEMS")
            .select("*")
            .in("id", itemIds);

          if (itemDetailsError) {
            throw itemDetailsError;
          }

          setItemDetails(itemDetailsData);
        }
      } catch (error) {
        console.error("Error fetching owned items and details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnedItemsAndDetails();
  }, [session, supabase]);

  // Combine owned items with their details
  const combinedItems = ownedItems.map(ownedItem => {
    const itemDetail = itemDetails.find(detail => detail.id === ownedItem.item);
    return {
      ...ownedItem,
      ...itemDetail,
    };
  });

  // If the component is loading, you can display a loading indicator or message
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the list of items
  return (
    <div className="w-full">
      {combinedItems.map(item => (
        <div key={item.id} className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={item.icon_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm">{item.name}</p>
          </div>
          <p className="text-sm">x{item.quantity}</p>
        </div>
      ))}
    </div>
  );
};

export const SectorStructureOwned: React.FC<{ sectorid: string }> = ({ sectorid }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const [ownedItems, setOwnedItems] = useState([]);
    const [itemDetails, setItemDetails] = useState([]);
    // Add support for moving items/entities between planets

    useEffect(() => {
        async function fetchOwnedItems() {
            if (session) {
                try {
                const user = session.user.id;
                const { data: ownedItemsData, error: ownedItemsError } = await supabase
                    .from('inventoryUSERS')
                    .select('*')
                    .eq("planetSector" || 'sector', sectorid);
        
                if (ownedItemsError) {
                    throw ownedItemsError;
                }

                if (ownedItemsData) {
                    setOwnedItems(ownedItemsData);
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
                const { data: itemDetailsData, error: itemDetailsError } = await supabase
                    .from('inventoryITEMS')
                    .select('*')
                    .in('id', itemIds);
            
            if (itemDetailsError) {
                console.error('Error fetching item details:', itemDetailsError);
            }
    
            if (itemDetailsData) {
                setItemDetails(itemDetailsData);
            }
          }
        }
    
        fetchItemDetails();
    }, [ownedItems]);

    return (
        <div className="bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4">Your Items</h2>
            <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {itemDetails.map(item => {
                const ownedItem = ownedItems.find(ownedItem => ownedItem.item === item.id);
                return (
                <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">{item.name}</h3>
                    <div className="mb-2">
                    <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
                    </div>
                    <p className="text-gray-600">Quantity: {ownedItem?.quantity}</p>
                    <p className="text-gray-600">On planet (id): {ownedItem?.sector}</p>
                </li>
                );
            })}
        </ul>
      </div>
    );
};