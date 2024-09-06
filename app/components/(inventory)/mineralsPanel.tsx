import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface Item {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
  recipe?: { [key: string]: number };
}

interface InventoryItem {
  id: number;
  item: number;
  owner: string;
  quantity: number; 
  anomaly: number;
  // Other fields...
}

const MineralsInventoryGrid = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [mineralItems, setMineralItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .eq("anomaly", activePlanet.id)
          .eq("owner", session?.user?.id)
          .limit(9);

        if (error) {
          console.error("Error fetching inventory items: ", error);
          return;
        }
        if (data) {
          setInventoryItems(data);
        }
      } catch (error) {
        console.error("Unexpected error: ", error);
      }
    };

    const fetchItemsData = async () => {
      try {
        const res = await fetch("/api/gameplay/inventory");
        const data: Item[] = await res.json();

        const minerals = data.filter(
          (item) => item.ItemCategory === "Minerals"
        );
        setMineralItems(minerals);
      } catch (error) {
        console.error("Error fetching items data: ", error);
      }
    };

    if (session?.user?.id) {
      fetchInventoryItems();
      fetchItemsData();
    }
  }, [session, activePlanet]);

  const filteredItems = inventoryItems
    .filter((invItem) =>
      mineralItems.some((mineral) => mineral.id === invItem.item)
    )
    .map((invItem) => {
      const item = mineralItems.find((mineral) => mineral.id === invItem.item);
      return {
        ...invItem,
        ...item,
      };
    });

  return (
    <div className="py-4">
        <h1 className="text-2xl font-bold tracking-tighter text-nord-4 dark:text-nord-6 sm:text-5xl md:text-6xl">Your minerals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
            <div
                key={item.id}
                className="border rounded-lg bg-cyan-50 opacity-30 p-4 flex flex-col items-center"
            >
                <img
                    src={item.icon_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover mb-2"
                />
                <span className="text-sm text-gray-500">{item.ItemCategory}</span>
                <span className="font-bold text-lg">{item.name}</span>
                <span className="text-gray-700">Quantity: {item.quantity}</span>
            </div>
            ))
        ) : (
            <p>No minerals in inventory</p>
        )}
        </div>
    </div>
  );
};

export default MineralsInventoryGrid;