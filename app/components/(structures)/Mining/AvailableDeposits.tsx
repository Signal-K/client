"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { InventoryItem, MineralDeposit } from "@/types/Items"; 
import { useActivePlanet } from "@/context/ActivePlanet";
import { SelectMineralPanel } from "./MiningPanels";

const MineralDeposits = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<MineralDeposit | null>(null);
  const [selectedMineralIcon, setSelectedMineralIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activePlanetId = activePlanet?.id;

        // Fetch the mineral deposits for the active planet
        const { data: depositsData, error: depositsError } = await supabase
          .from("mineralDeposits")
          .select("*")
          .eq("owner", session?.user?.id)
          .eq("anomaly", activePlanetId);

        if (depositsError) throw depositsError;

        setMineralDeposits(depositsData || []);

        const inventoryResponse = await fetch("/api/gameplay/inventory");
        const inventoryData: InventoryItem[] = await inventoryResponse.json();

        setInventoryItems(inventoryData);
      } catch (error: any) {
        console.error("Error fetching mineral deposits or inventory:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (session && activePlanet) {
      fetchData();
    }
  }, [session, activePlanet, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Group mineral deposits by mineral type
  const groupedDeposits = mineralDeposits.reduce((acc, deposit) => {
    const mineralName = deposit.mineralconfiguration.mineral;
    if (!acc[mineralName]) {
      acc[mineralName] = [];
    }
    acc[mineralName].push(deposit);
    return acc;
  }, {} as Record<string, MineralDeposit[]>);

  // Sort deposits by quantity within each mineral type
  for (const mineralName in groupedDeposits) {
    groupedDeposits[mineralName].sort(
      (a, b) => b.mineralconfiguration.quantity - a.mineralconfiguration.quantity
    );
  }

  return (
    <div className="p-4 bg-white bg-opacity-30 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Mineral Deposits</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10">
        {Object.keys(groupedDeposits).map((mineralName) => {
          const mineralItem = inventoryItems.find(
            (item) => item.name === mineralName
          );

          if (!mineralItem) {
            return (
              <div
                key={mineralName}
                className="p-2 border rounded-lg shadow-md bg-white bg-opacity-90"
              >
                <p>Unknown mineral: {mineralName}</p>
              </div>
            );
          }

          return groupedDeposits[mineralName].map((deposit) => (
            <div
              key={deposit.id}
              className="p-2 border rounded-lg shadow-md bg-white bg-opacity-90 flex items-center cursor-pointer"
              onClick={() => {
                setSelectedDeposit(deposit);
                setSelectedMineralIcon(mineralItem.icon_url || "/fallback-icon.png");
              }}
            >
              <img
                src={mineralItem.icon_url || "/fallback-icon.png"}
                alt={mineralItem.name}
                className="w-8 h-8 mr-2"
              />
              <div>
                <h3 className="text-lg font-bold">{mineralItem.name}</h3>
              </div>
            </div>
          ));
        })}
      </div>
      {selectedDeposit && selectedMineralIcon && (
        <div className="mt-6">
          <SelectMineralPanel deposit={selectedDeposit} iconUrl={selectedMineralIcon} />
        </div>
      )}
    </div>
  );
};

export default MineralDeposits;