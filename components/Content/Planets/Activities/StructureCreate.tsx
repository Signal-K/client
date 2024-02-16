import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

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
                            quantity: 1, // You can adjust the quantity as needed
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

    const handleStructureClick = (structure: Structure) => {
        onStructureSelected(structure);
        createInventoryUserEntry(structure);
        setIsCalloutOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
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
                    <div className="flex items-center space-x-2">
                      <img src={structure.icon_url} alt={structure.name} className="w-8 h-8" />
                      <span className="font-bold">{structure.name}</span>
                    </div>
                    <span className="text-gray-500">{structure.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
      <div>
        <h2>Structures Placed on Sector {sectorId}</h2>
        <div>
          {placedStructures.map((structure) => (
            <div key={structure.id}>
              <img src={structure.icon_url} alt={structure.name} />
              <p>{structure.name}</p>
              <p>{structure.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
};