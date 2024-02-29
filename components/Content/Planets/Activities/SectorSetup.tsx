import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CreateBasePlanetSector() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [userPlanet, setUserPlanet] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchUserPlanet = async () => {
            if (!session) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session?.user?.id)
                    .single();

                if (data) {
                    setUserPlanet(data.location);
                }

                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchUserPlanet();
    }, [session, supabase]);

    const fetchRoverImage = async () => {
        const apiKey = 'iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE';
        const date = Math.floor(Math.random() * 200) + 1; // Generate a random date

        try {
            const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/perseverance/photos?sol=${date}&api_key=${apiKey}`;
            const response = await axios.get(apiUrl);

            if (response.data.photos && response.data.photos.length > 0) {
                const firstImage = response.data.photos[0].img_src;
                setImageUrl(firstImage);
            } else {
                console.error('No images found for the given date & rover:', date);
                // Retry fetching image with a new date
                fetchRoverImage();
            }
        } catch (error) {
            console.error('Error fetching image:', error);
            // Retry fetching image with a new date
            fetchRoverImage();
        }
    };

    useEffect(() => {
        fetchRoverImage();
    }, [session]);

    const createSector = async () => {
        if (!imageUrl) {
            console.error('No image available. Please wait until an image is fetched.');
            return;
        }

        if (session) {
            try {
                // Map resource names to corresponding inventoryITEMS ids
                const resourceToIdMap = {
                    "Coal": 11,
                    "Silicates": 13,
                    "Iron": 15,
                    "Alloy": 17,
                    "Fuel": 18,
                    "Copper": 19,
                    "Chromium": 20,
                    "Nickel": 16,
                    "Water": 21,
                };

                // Randomly choose a mineral from the resourceToIdMap
                const minerals = Object.keys(resourceToIdMap);
                const randomMineral = minerals[Math.floor(Math.random() * minerals.length)];

                // Get the corresponding id from the map
                const depositRowId = resourceToIdMap[randomMineral];

                const response = await supabase.from('basePlanetSectors').upsert([
                    {
                        anomaly: userPlanet,
                        owner: session?.user?.id,
                        deposit: depositRowId, // Use the id instead of the resource name
                        coverUrl: imageUrl,
                        explored: false,
                    },
                ]);

                if (response.error) {
                    console.error(response.error);
                } else {
                    // Handle success
                }
            } catch (error) {
                console.error("Error creating sector:", error.message);
            }
        }
    };

    return (
        <div className="mt-4">
            <button
                onClick={createSector}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Create Sector
            </button>
        </div>
    );
};    

export function UserOwnedSectorGrid() {
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const [sectorData, setSectorData] = useState([]);
  
    useEffect(() => {
      const fetchUserSectorImages = async () => {
        if (session) {
          try {
            const { data, error } = await supabase
              .from("basePlanetSectors")
              .select('id, coverUrl')
              .eq('owner', session?.user?.id);
  
            if (data) {
              setSectorData(data);
            }
  
            if (error) {
              throw error;
            }
          } catch (error) {
            console.error(error.message);
          }
        }
      };
  
      fetchUserSectorImages();
    }, [session, supabase]);
  
    return (
      <div className="grid grid-cols-4 gap-4">
        {sectorData.map((item) => (
          <Link legacyBehavior key={item.id} href={`/planets/sector/${item.id}`} passHref>
            <a className="block aspect-w-3 aspect-h-2 bg-gray-200 hover:bg-gray-300">
              <img
                src={item.coverUrl}
                alt="Sector"
                className="object-cover w-full h-full"
              />
            </a>
          </Link>
        ))}
      </div>
    );
};

export function AllSectors() {
    const supabase = useSupabaseClient();
  const session = useSession();

  const [sectorData, setSectorData] = useState([]);

  useEffect(() => {
    const fetchSectorContent = async () => {
      if (session) {
        try {
          const { data, error } = await supabase
            .from("basePlanetSectors")
            .select('id, coverUrl');

          if (data) {
            setSectorData(data);
          }

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    };

    fetchSectorContent();
  }, [session, supabase]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {sectorData.map((item) => (
        <Link legacyBehavior key={item.id} href={`/planets/sector/${item.id}`} passHref>
          <a className="block aspect-w-3 aspect-h-2 bg-gray-200 hover:bg-gray-300">
            <img
              src={item.coverUrl}
              alt="Sector"
              className="object-cover w-full h-full"
            />
          </a>
        </Link>
      ))}
    </div>
  );
};