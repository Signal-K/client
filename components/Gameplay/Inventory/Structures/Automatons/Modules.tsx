import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import {
  CreateStructureWithItemRequirementinfo,
  PlacedStructureSingle,
} from "@/components/Gameplay/Inventory/Structures/Structure";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AllAutomatons } from "../../Automatons/Automaton";
import CraftStructure from "../../Actions/CraftStructure";

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
}

interface OwnedItem {
  id: string;
  item: string;
  quantity: number;
  sector: string;
  anomaly: number;
}

export const CameraAutomatonModule: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [cameraModule, setCameraModule] = useState<OwnedItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  async function fetchInventoryItems() {
    try {
      const response = await fetch("/api/gameplay/inventory");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items from the API");
      }
      const data: InventoryItem[] = await response.json();
      setInventoryItems(data);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    }
  }

  async function fetchUserModule() {
    if (session && activePlanet) {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", 28);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setCameraModule(data[0]);
        }
      } catch (error) {
        console.error("Error fetching user module:", error);
      }
    }
  }

  const [hasCameraStation, setHasCameraStation] = useState(false);

  async function fetchCameraStation() {
    if (session && activePlanet) {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", 32);

        if (data && data.length > 0) {
          setHasCameraStation(true);
        }

        if (data && data.length === 0) {
          setHasCameraStation(false);
        }
      } catch (error) {
        console.error("Error fetching camera station:", error);
      }
    }
  }

  useEffect(() => {
    fetchInventoryItems();
    fetchUserModule();
    fetchCameraStation();
  }, [session, activePlanet]);

  const getCameraModuleDescription = () => {
    if (!cameraModule) return "";
    const item = inventoryItems.find(
      (item) => item.id === parseInt(cameraModule.item)
    );
    return item ? item.description : "";
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Camera Automaton Module
      </h2>
      {cameraModule ? (
        <div className="text-center">
          <p>ID: {cameraModule.id}</p>
          <p>Item: {cameraModule.item}</p>
          <p>Description: {getCameraModuleDescription()}</p>
          {cameraModule.sector && <p>Sector: {cameraModule.sector}</p>}
          {hasCameraStation ? (
            <p>You has a camera station and can now collect photos!</p>
          ) : (
            <>
              <p>
                You need to craft a camera station to be able to receive your
                photos
              </p>
              <CreateStructureWithItemRequirementinfo craftingItemId={32} />
            </>
          )}
        </div>
      ) : (
        <p className="text-center">No Camera Automaton Module found.</p>
      )}
    </div>
  );
};
