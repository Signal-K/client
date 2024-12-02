import { useState, useEffect } from 'react';
import { TopographicMap } from '../mining/topographic-map';
import { MineralDepositList } from '../mining/mineral-deposit-list';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

type Landmark = {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  isOpen: boolean;
};

type MineralDeposit = {
  id: string;
  name: string;
  mineral: string;
  amount: number;
  position: { x: number; y: number };
};

export function LandmarkMapComponent() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([]);
  const [activeMap, setActiveMap] = useState<'2D' | '3D'>('2D');

  useEffect(() => {
    const fetchLandmarksAndDeposits = async () => {
      if (!session?.user?.id || !activePlanet?.id) {
        console.error("User or activePlanet is undefined.");
        return;
      }

      // Fetch landmarks from the inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("id, item, quantity")
        .eq("owner", session.user.id)
        .eq("anomaly", activePlanet.id)
        .gt("quantity", 0);

      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        return;
      }

      const res = await fetch('/api/gameplay/inventory');
      const items = await res.json();

      const structures = inventoryData
        ?.filter((inventoryItem) =>
          items.some(
            (item: { id: number; ItemCategory: string }) =>
              item.id === inventoryItem.item && item.ItemCategory === "Structure"
          )
        )
        .map((inventoryItem) => {
          const itemDetails = items.find(
            (item: { id: number }) => item.id === inventoryItem.item
          );

          return {
            id: inventoryItem.id.toString(),
            name: itemDetails?.name || "Unknown",
            description: itemDetails?.description || "No description available",
            position: itemDetails?.position || { x: Math.random() * 100, y: Math.random() * 100 },
            isOpen: false,
          };
        });

      setLandmarks(structures || []);

      // Fetch mineral deposits
      const { data: deposits, error: depositsError } = await supabase
        .from("mineralDeposits")
        .select("id, mineralconfiguration")
        .eq("owner", session?.user.id)
        .eq("anomaly", activePlanet?.id);

      if (depositsError) {
        console.error("Error fetching mineral deposits:", depositsError);
        return;
      }

      const formattedDeposits = deposits?.map((deposit) => ({
        id: deposit.id.toString(),
        name: deposit.mineralconfiguration.mineral || "Unknown",
        mineral: deposit.mineralconfiguration.mineral || "Unknown",
        amount: deposit.mineralconfiguration.quantity || 0,
        position: deposit.mineralconfiguration.position || { x: 50, y: 50 },
      }));

      setMineralDeposits(formattedDeposits || []);
    };

    fetchLandmarksAndDeposits();
  }, [session, activePlanet, supabase]);

  const toggleMap = () => {
    setActiveMap((prev) => (prev === '2D' ? '3D' : '2D'));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative w-[90%] h-[90%] bg-gray-100 text-[#2C4F64] flex flex-col rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-white shadow">
          <h2 className="text-2xl font-bold">Landmark Map</h2>
          <button
            onClick={toggleMap}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-200"
          >
            Switch to {activeMap === '2D' ? '3D' : '2D'} Map
          </button>
        </div>
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-3/4 h-1/2 md:h-full relative">
            {activeMap === '2D' ? (
              <TopographicMap landmarks={landmarks} deposits={mineralDeposits} />
            ) : (
              <TerrainMap landmarks={landmarks} deposits={mineralDeposits} />
            )}
          </div>
          <div className="w-full md:w-1/4 h-1/2 md:h-full bg-white overflow-y-auto">
            <MineralDepositList deposits={mineralDeposits} />
          </div>
        </div>
      </div>
    </div>
  );
};