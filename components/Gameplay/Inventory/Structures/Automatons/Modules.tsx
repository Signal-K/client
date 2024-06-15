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
import axios from "axios";
import { RoverClassificationFromItem32 } from "@/Classifications/RoverContent/RoverImageClassification";

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
            <>
                <p>You has a camera station and can now collect photos!</p>
                <CameraReceiverStation />
            </>
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

export const CameraReceiverStation: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [cameraModule, setCameraModule] = useState<OwnedItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [hasCameraStation, setHasCameraStation] = useState(false);
  const [rovers, setRovers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [roverConfig, setRoverConfig] = useState<any>(null);
  const [userImages, setUserImages] = useState<{ avatar_url: string, id: number }[]>([]);

  useEffect(() => {
      fetchInventoryItems();
      fetchUserModule();
      fetchCameraStation();
  }, [session, activePlanet]);

  useEffect(() => {
      fetchImages();
      fetchPhotosOnUserPlanet();
  }, [supabase]);

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
              } else {
                  setHasCameraStation(false);
              }
          } catch (error) {
              console.error("Error fetching camera station:", error);
          }
      }
  }

  const fetchImages = async () => {
      const randomDate = Math.floor(Math.random() * 1000) + 1;
      const selectedRover = 'perseverance';
      const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

      try {
          const response = await axios.get(apiUrl);
          if (response.data.photos && response.data.photos.length > 0) {
              setRovers([response.data.photos[0].img_src]);
              setRoverConfig(response.data);
          } else {
              setRovers(['No images found for the given date and rover.']);
          }
      } catch (error) {
          console.error(error);
          setRovers(['An error occurred while fetching the image.']);
      }

      setLoading(false);
  };

  async function fetchPhotosOnUserPlanet() {
      if (session && activePlanet) {
          try {
              const { data, error } = await supabase
                  .from("anomalies")
                  .select("*")
                  .eq("parentAnomaly", String(activePlanet.id))
                  .eq("anomalytype", "roverImg");

              if (error) {
                  throw error;
              }

              if (data && data.length > 0) {
                  setUserImages(data.map((rover: any) => ({ avatar_url: rover.avatar_url, id: rover.id })));
              }
          } catch (error) {
              console.error("Error fetching user photos:", error);
          }
      }
  }

  const handleCollectImage = async (image: string) => {
      if (session && activePlanet) {
          try {
              const { data, error } = await supabase
                  .from("anomalies")
                  .insert({
                      id: "9",
                      content: `Rover image by ${session.user.id}`,
                      anomalytype: 'roverImg',
                      avatar_url: image,
                      configuration: roverConfig,
                      parentAnomaly: String(activePlanet.id),
                      created_at: new Date()
                  });

              if (error) {
                  throw error;
              }

              alert("Image collected successfully!");
          } catch (error) {
              console.error("Error collecting image:", error);
              alert("Failed to collect the image.");
          }
      }
  };

  if (!hasCameraStation && cameraModule === null) {
      return (
          <>You need to collect the required items to do this, hehe</>
      );
  }

  return (
      <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Camera Receiver Station</h2>
          {loading ? (
              <p className="text-center">Loading...</p>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {rovers.map((rover, index) => (
                      <div key={index} className="text-center">
                          Fetched images
                          <img src={rover} alt={`Mars Rover ${index}`} className="w-full h-auto rounded-lg" />
                          <button
                              onClick={() => handleCollectImage(rover)}
                              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700"
                          >
                              Collect this image
                          </button>
                      </div>
                  ))}
                  {userImages.map(({ avatar_url, id }, index) => (
                      <div key={index} className="text-center">
                          Your images
                          <img src={avatar_url} alt={`Mars Rover ${index}`} className="rounded-lg" />
                          <p>This is your image!</p>
                          <RoverClassificationFromItem32 roverId={id} />
                      </div>
                  ))}
              </div>
          )}
      </div>
  );
};