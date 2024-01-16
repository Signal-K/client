import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CreateBasePlanetSector() {
    const supabase = useSupabaseClient();
  const session = useSession();

  const [userPlanet, setUserPlanet] = useState(null);

  // Get the planet that the user owns
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

  const createSector = async () => {
    if (session) {
      // Map resource names to corresponding inventoryITEMS ids
      const resourceToIdMap = {
        "Silicates": 13,
        "Alloy": 12,
        "Iron": 11,
        "Fuel": 10,
        "Water": 9,
        "Coal": 11,
      };

      // Choose between Silicates and Coal for testing
      const depositResource = Math.random() < 0.5 ? "Silicates" : "Coal";

      // Get the corresponding id from the map
      const depositRowId = resourceToIdMap[depositResource];

      const response = await supabase.from('basePlanetSectors').upsert([
        {
          anomaly: userPlanet,
          owner: session?.user?.id,
          deposit: depositRowId, // Use the id instead of the resource name
          coverUrl: "https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00090/ids/edr/browse/edl/EBE_0090_0674952393_193ECM_N0040048EDLC00090_0030LUJ01_1200.jpg",
          explored: false,
        },
      ]);

      if (response.error) {
        console.error(response.error);
      } else {
        // Handle success
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