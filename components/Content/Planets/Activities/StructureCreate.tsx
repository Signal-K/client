import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import axios from "axios";
import Link from "next/link";

interface Structure {
    id: number;
    name: string;
    description: string;
    icon_url: string; 
};

interface StructureSelectionProps {
    onStructureSelected: (structure: Structure) => void;
    planetSectorId: number;
};

const StructureSelection: React.FC<StructureSelectionProps> = ({ onStructureSelected, planetSectorId }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [structures, setStructures] = useState<Structure[]>([]);
    const [isCalloutOpen, setIsCalloutOpen] = useState(false);

    const fetchStructures = async () => {
        try {
            const { data, error } = await supabase
                .from('inventoryITEMS')
                .select('id, name, description, icon_url')
                .eq('ItemCategory', 'Structure');

            if (data) {
                setStructures(data);
            }

            if (error) {
                console.error(error.message);
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    const createInventoryUserEntry = async (structure: Structure) => {
        if (session && planetSectorId) {
            try {
                const { data, error } = await supabase
                    .from('inventoryUSERS')
                    .upsert([
                        {
                            item: structure.id,
                            owner: session.user.id,
                            quantity: 1,
                            planetSector: planetSectorId,
                        },
                    ]);

                if (data) {
                    console.log('Inventory user entry created:', data);
                }

                if (error) {
                    console.error(error.message);
                }
            } catch (error) {
                console.error(error.message);
            }
        }
    };

    useEffect(() => {
        fetchStructures();
    }, [supabase]);

    const handleStructureClick = async (structure: Structure) => {
      try {
        const payload = JSON.stringify({
          user_id: session?.user?.id,
          sector_id: planetSectorId,
          structure_id: structure.id,
        });
  
        const response = await fetch('https://papyrus-production.up.railway.app/craft_structure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: payload
        });
  
        const data = await response.json();
        console.log('Response from Flask:', data);

        // if (data.status === 'proceed') { // If the status is 'proceed', call createInventoryUserEntry
        //   createInventoryUserEntry(structure);
        // }
      } catch (error) {
        console.error('Error:', error.message);
      }
    
      onStructureSelected(structure);
      // createInventoryUserEntry(structure)
      setIsCalloutOpen(false);
    };

    return (
        <center><div className="relative inline-block text-center pl-10">
          <button
            type="button"
            className="px-4 py-2 text-white bg-blue-500 rounded-md focus:outline-none hover:bg-blue-600"
            onClick={() => setIsCalloutOpen(!isCalloutOpen)}
          >
            Build
          </button>
    
          {isCalloutOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {structures.map((structure) => (
                  <div
                    key={structure.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleStructureClick(structure)}
                  >
                    <div className="flex items-center space-x-2 pl-8">
                      <img src={structure.icon_url} alt={structure.name} className="w-8 h-8" />
                      <span className="font-bold">{structure.name}</span>
                    </div>
                    <span className="text-gray-500">{structure.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div></center>
    );
};

export default function StructureComponent({ sectorId }) {
    const handleStructureSelected = (structure) => {
        console.log('Selected structure: ', structure);
    };

    return (
        <div>
            <StructureSelection onStructureSelected={handleStructureSelected} planetSectorId={sectorId} />
        </div>
    );
};

interface PlacedStructuresProps {
    sectorId: number;
  }
  
  interface PlacedStructure {
    id: number;
    name: string;
    description: string;
    icon_url: string;
  }
  
  export const PlacedStructures: React.FC<PlacedStructuresProps> = ({ sectorId }) => {
    const supabase = useSupabaseClient();
    const [placedStructures, setPlacedStructures] = useState<PlacedStructure[]>([]);
  
    useEffect(() => {
      const fetchPlacedStructures = async () => {
        try {
          const { data: userItems, error: userItemsError } = await supabase
            .from('inventoryUSERS')
            .select('item')
            .eq('planetSector', sectorId);
  
          if (userItemsError) {
            console.error(userItemsError.message);
            return;
          }
  
          const itemIds = userItems?.map((item) => item.item) || [];
  
          const { data: structureItems, error: structureItemsError } = await supabase
            .from('inventoryITEMS')
            .select('id, name, description, icon_url')
            .in('id', itemIds)
            .eq('ItemCategory', 'Structure');
  
          if (structureItemsError) {
            console.error(structureItemsError.message);
            return;
          }
  
          setPlacedStructures(structureItems || []);
        } catch (error) {
          console.error(error.message);
        }
      };
  
      fetchPlacedStructures();
    }, [supabase, sectorId]);
  
    return (
      <div className="flex flex-col items-center justify-center p-4 md:space-y-0 md:flex-row md:space-x-4">
        <div className="grid gap-4 w-full max-w-sm md:max-w-none md:grid-cols-3">
          {placedStructures.map((structure) => (
            <div key={structure.id} className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-gray-100 border-dashed dark:border-gray-800">
                <img src={structure.icon_url} alt={structure.name} className="w-10 h-10 text-gray-200 dark:text-gray-800 translate-y-1" />
              </div>
              <span className="text-sm font-medium">{structure.name}</span>
              <Link className="text-sm underline" href="#">
                View More
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
};

const CraftButton = () => {
  const handleClick = async () => {
    try {
      const payload = JSON.stringify({
        user_id: "cebdc7a2-d8af-45b3-b37f-80f328ff54d6",
        structure_id: 14
      });

      const response = await fetch('http://127.0.0.1:5000/craft_structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });

      const data = await response.json();
      console.log('Response from Flask:', data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <button onClick={handleClick}>
      Craft Structure
    </button>
  );
};

const ItemListFetcher = () => {
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/items');
        console.log('Items:', response.data);
      } catch (error) {
        console.error('Error fetching items:', error.message);
      }
    };

    fetchItems();
  }, []);

  return (
    <div>
      Fetching items...
    </div>
  );
};