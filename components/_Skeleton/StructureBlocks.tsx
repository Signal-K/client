import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import StructureComponent from "../Content/Populate/StructureCreate";

interface Structure {
    id: number;
    name: string;
    description: string;
    icon_url: string;
  };
  
  interface PlacedStructure extends Structure {
    present: boolean;
  };
  
  interface PlanetData {
    anomaly: any[]; // Update the type of 'anomaly' as needed
    lightkurve: any;
  };
  
  interface CraftStructurePayload {
    user_id: string;
    sector_id: number;
    structure_id: number;
  };
  
  interface StructureSelectionProps {
      onStructureSelected: (structure: Structure) => void;
      planetSectorId: number;
  };

const CreateStructureBlockBackbone = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [structures, setStructures] = useState<Structure[]>([]);
    const [isCalloutOpen, setIsCalloutOpen] = useState(false);
    const planetSectorId = 18;

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
      
        // onStructureSelected(structure);
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

export const CreateStructureBlock = () => {
    return (
        <StructureComponent sectorId={18} />
    );
};