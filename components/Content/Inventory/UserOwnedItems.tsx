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
              .in('id', itemIds);
  
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
      const radius = 125; // Adjust as needed
      const centerX = 175; // Adjust as needed
      const centerY = 175; // Adjust as needed
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y };
    };
  
    return (
      <div className="relative w-80 h-80 flex flex-col items-center justify-center">
        {itemDetails.map((item, index) => {
          const { x, y } = calculatePosition(index, itemDetails.length);
          return (
            <div
              key={item.id}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ top: `${y}px`, left: `${x}px` }}
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                <img src={item.icon_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm">{item.name}</p>
            </div>
          );
        })}
      </div>
      );
  };

export default OwnedItemsList;

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
                    <p className="text-gray-600">On planet: {ownedItem?.sector}</p>
                </li>
                );
            })}
        </ul>
      </div>
    )
}