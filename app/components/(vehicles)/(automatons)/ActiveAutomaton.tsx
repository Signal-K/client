import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { MineralDeposit, Automaton } from "@/types/Items";
import AutomatonUpgrade from "../../(structures)/Config/AutomatonUpgradeBox";
import { InventoryItem } from "@/types/Inventory";
import "../../../../styles/Anims/MiningAnimations.css";

interface ActiveAutomatonForMiningProps {
  deposit: MineralDeposit;
};

export function ActiveAutomatonForMining({ deposit }: ActiveAutomatonForMiningProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [userAutomaton, setUserAutomaton] = useState<Automaton | null>(null);
  const [roverIconUrl, setRoverIconUrl] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [miningInProgress, setMiningInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        if (!session?.user?.id || !activePlanet?.id) {
          throw new Error("User session or active planet is not available.");
        }

        const { data: automatonData, error: automatonError } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", session.user.id)
          .eq("item", 23) 
          .eq("anomaly", activePlanet.id)
          .single();

        if (automatonError) {
          throw new Error(`Error fetching automaton data: ${automatonError.message}`);
        }

        setUserAutomaton(automatonData);

        const inventoryResponse = await fetch("/api/gameplay/inventory");
        if (!inventoryResponse.ok) {
          throw new Error(`Error fetching inventory items: ${inventoryResponse.statusText}`);
        }
        const inventoryData: InventoryItem[] = await inventoryResponse.json();
        setInventoryItems(inventoryData);

        const automatonItem = inventoryData.find(item => item.id === automatonData.item);
        if (automatonItem) {
          setRoverIconUrl(automatonItem?.gif ?? null);
        } else {
          throw new Error("Rover icon URL not found for the specified item.");
        }

      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, supabase, activePlanet]);

  const handleSendRover = async () => {
    if (!userAutomaton) {
      setErrorMessage("No automaton available to perform mining.");
      return;
    }

    setMiningInProgress(true);
    setErrorMessage(null);

    try {
      const mineralName = deposit.mineralconfiguration.mineral;
      const item = inventoryItems.find(
        (invItem) => invItem.id.toString() === mineralName
      );

      if (!item) {
        throw new Error(`No item found in inventory for mineral: ${mineralName}`);
      }

      // 1. Fetch and update mineral deposit quantity
      const { data: mineralData, error: mineralError } = await supabase
        .from("mineralDeposits")
        .select("mineralconfiguration")
        .eq("id", deposit.id)
        .single();

      if (mineralError || !mineralData) {
        throw new Error(`Error fetching mineral deposit data: ${mineralError?.message}`);
      }

      const mineralConfig = mineralData.mineralconfiguration as { mineral: string; quantity: number };

      if (mineralConfig.quantity <= 0) {
        throw new Error(`No quantity left for mineral: ${mineralName}`);
      }

      const updatedQuantity = mineralConfig.quantity - 1;

      const { error: updateMineralError } = await supabase
        .from("mineralDeposits")
        .update({
          mineralconfiguration: {
            ...mineralConfig,
            quantity: updatedQuantity
          }
        })
        .eq("id", deposit.id);

      if (updateMineralError) {
        throw new Error(`Error updating mineral deposit: ${updateMineralError.message}`);
      }

      // 2. Check and update or insert inventory
      const { data: existingInventory, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("item", item.id)
        .eq("owner", session?.user?.id)
        .eq("anomaly", activePlanet?.id)
        .single();

      if (inventoryError && inventoryError.code !== 'PGRST116') {
        throw new Error(`Error fetching inventory data: ${inventoryError.message}`);
      }

      if (existingInventory) {
        const { error: updateInventoryError } = await supabase
          .from("inventory")
          .update({
            quantity: existingInventory.quantity + 1
          })
          .eq("id", existingInventory.id);

        if (updateInventoryError) {
          throw new Error(`Error updating inventory: ${updateInventoryError.message}`);
        }
      } else {
        const { error: insertInventoryError } = await supabase
          .from("inventory")
          .insert({
            item: item.id,
            owner: session?.user?.id,
            quantity: 1,
            notes: `Created by rover ${userAutomaton.id}`,
            time_of_deploy: new Date().toISOString(),
            anomaly: activePlanet?.id,
            configuration: null
          });

        if (insertInventoryError) {
          throw new Error(`Error inserting inventory: ${insertInventoryError.message}`);
        }
      }

      console.log("Mineral collected and added to inventory.");
      alert(`Successfully collected ${mineralName}!`);
    } catch (error: any) {
      console.error("Error collecting mineral:", error.message);
      setErrorMessage(error.message);
    } finally {
      setMiningInProgress(false);
    }
  };

  const handleConfigureAutomaton = () => {
    setIsConfiguring(true);
  };

  const handleSaveConfiguration = () => {
    setIsConfiguring(false);
  };

  if (loading) {
    return <div>Loading automaton and inventory data...</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-red-100 text-red-800">
        <p>Error: {errorMessage}</p>
      </div>
    );
  }

  if (!userAutomaton) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-yellow-100 text-yellow-800">
        <p>You don't have a rover/automaton available for mining.</p>
      </div>
    );
  }

  if (isConfiguring) {
    return <AutomatonUpgrade onSave={handleSaveConfiguration} />;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white bg-opacity-82 overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Automaton Control</h2>
      <p className="text-sm mb-4">
        Rover ID: {userAutomaton.id} - Ready to collect <strong>{deposit.mineralconfiguration.mineral}</strong>
      </p>
      {roverIconUrl && (
        <div className="relative h-32"> {/* Adjust the height here */}
          <img
            src={roverIconUrl}
            alt="Rover Icon"
            className="w-32 h-32 absolute"
            style={{ top: 0, left: 0, animation: "slide 4s infinite alternate ease-in-out", transform: "scaleX(-1)" }}
          />
        </div>
      )}
      <div className="flex space-x-4 mt-4"> 
        <button
          className={`"block bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" ${
            miningInProgress ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSendRover}
          disabled={miningInProgress}
        >
          {miningInProgress ? "Mining in progress..." : "Deploy Rover"}
        </button>
        <button
          className="block bg-[#b3ebf2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={handleConfigureAutomaton}
        >
          Configure Automaton
        </button>
      </div>
    </div>
  );  
};