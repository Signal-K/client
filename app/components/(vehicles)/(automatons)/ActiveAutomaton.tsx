"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { MineralDeposit, Automaton } from "@/types/Items";
import AnomalyUpgrade from "../../(structures)/Config/AutomatonUpgradeBox";

interface ActiveAutomatonForMiningProps {
  deposit: MineralDeposit;
} 

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
  recipe?: { [key: string]: number };
};

export function ActiveAutomatonForMining({ deposit }: ActiveAutomatonForMiningProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [userAutomaton, setUserAutomaton] = useState<Automaton | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [miningInProgress, setMiningInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false); // State to manage configuration view

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        if (!session?.user?.id || !activePlanet?.id) {
          throw new Error("User session or active planet is not available.");
        };

        const { data: automatonData, error: automatonError } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", session.user.id)
          .eq("item", 23)
          .eq("anomaly", activePlanet.id)
          .single();

        if (automatonError) {
          throw new Error(`Error fetching automaton data: ${automatonError.message}`);
        };

        setUserAutomaton(automatonData);

        const inventoryResponse = await fetch("/api/gameplay/inventory");
        if (!inventoryResponse.ok) {
          throw new Error(`Error fetching inventory items: ${inventoryResponse.statusText}`);
        }
        const inventoryData: InventoryItem[] = await inventoryResponse.json();
        setInventoryItems(inventoryData);
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
        (invItem) => invItem.name.toLowerCase() === mineralName.toLowerCase()
      );

      if (!item) {
        throw new Error(`No item found in inventory for mineral: ${mineralName}`);
      }

      const { data, error } = await supabase.from("inventory").insert({
        item: item.id,
        owner: session?.user?.id,
        quantity: 1,
        notes: "Collected by rover",
        anomaly: activePlanet?.id,
        parentItem: userAutomaton.id,
      });

      if (error) {
        throw new Error(`Error inserting collected mineral: ${error.message}`);
      }

      console.log("Mineral collected and added to inventory:", data);
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
    return <AnomalyUpgrade />;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white bg-opacity-90">
      <h2 className="text-xl font-semibold mb-4">Automaton Control</h2>
      <p className="text-sm mb-4">
        Rover ID: {userAutomaton.id} - Ready to collect <strong>{deposit.mineralconfiguration.mineral}</strong>
      </p>
      <div className="flex space-x-4">
        <button
          className={`bg-green-500 text-white px-4 py-2 rounded ${
            miningInProgress ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSendRover}
          disabled={miningInProgress}
        >
          {miningInProgress ? "Mining in progress..." : "Send Rover"}
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleConfigureAutomaton}
        >
          Configure Automaton
        </button>
      </div>
    </div>
  );
};