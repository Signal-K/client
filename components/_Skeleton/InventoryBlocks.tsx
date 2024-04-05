import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import OwnedItemsList, { ItemsVerticalList, SectorStructureOwned } from "../Content/Inventory/UserOwnedItems";
import { useEffect, useState } from "react";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
};

interface ItemDetail {
    id: string;
    name: string; // Adjust this according to the actual properties in your 'inventoryITEMS' table
    // Add other properties if available
};

const SectorStructureOwnedAllSectorsOneUser: React.FC<{}> = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
    const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);
    // Add support for moving items/entities between planets

    useEffect(() => {
        async function fetchOwnedItems() {
            if (session) {
                try {
                const user = session.user.id;
                const { data: ownedItemsData, error: ownedItemsError } = await supabase
                    .from('inventoryUSERS')
                    .select('*')
                    .eq("owner", session?.user?.id);
        
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
                    {/* <div className="mb-2">
                        <img src={item.icon_url} alt={item.name} className="w-full h-auto" />
                    </div> */}
                    <p className="text-gray-600">Quantity: {ownedItem?.quantity}</p>
                    <p className="text-gray-600">On sector (id): {ownedItem?.sector}</p>
                </li>
                );
            })}
        </ul>
      </div>
    );
};

export const InventoryOneList = () => {
    return (
        <ItemsVerticalList />
    );
};

export const InventoryTwoList = () => {
    return (
        <OwnedItemsList />
    );
};

export const OwnedStructuresFullList = () => {
    return (
        // <SectorStructureOwned sectorid="18" />
        <SectorStructureOwnedAllSectorsOneUser />
    );
};