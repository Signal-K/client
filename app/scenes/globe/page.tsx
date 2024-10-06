"use client";

import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem } from "@/types/Items";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
import StructuresOnPlanet from "./Structures";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import { StructuresConfigForSandbox } from "@/constants/Structures/SandboxProperties";

export default function GlobeView() {
    const [activeComponent, setActiveComponent] = useState<React.ReactNode>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    // Create a list of all the buttons and actions from the structures config
    const buttonsList = Object.values(StructuresConfigForSandbox).flatMap(
      (structure) => [...(structure.actions || []), ...structure.buttons]
    );
  
    // Handle button click and open the modal
    const handleClick = (component: React.ReactNode) => {
      setActiveComponent(component);
      setIsModalOpen(true); // Open modal on button click
    };
  
    // Close the modal
    const closeModal = () => {
      setIsModalOpen(false);
      setActiveComponent(null);
    };
  
    return (
      <EarthViewLayout>
        <div className="w-full">
          <div className="py-3">
            <div className="py-1">
              <PlanetarySystem />
            </div>
          </div>
        </div>
        <div className="w-full">
            <center>
                <>
                </>
            </center>
        </div>
        <div className="w-full">
          <center>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {buttonsList.map((button, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  {button.dynamicComponent ? (
                    <button
                      className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center space-x-2"
                      onClick={() => handleClick(button.dynamicComponent)}
                    >
                      {button.icon}
                      <span>{button.text}</span>
                    </button>
                  ) : (
                    <button
                      className="bg-gray-200 text-gray-800 p-4 rounded-lg shadow-lg"
                      disabled
                    >
                      No component available
                    </button>
                  )}
                </div>
              ))}
            </div>
          </center>
        </div>
  
        {isModalOpen && (
          <Modal onClose={closeModal}>
            <div className="p-6 rounded-lg shadow-lg">
              {activeComponent}
            </div>
          </Modal>
        )}
      </EarthViewLayout>
    );
  }
  
  // Modal component for the popup
  interface ModalProps {
    onClose: () => void;
    children: ReactNode;
  }
  
  const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="relative rounded-lg shadow-lg w-3/4 lg:w-1/2">
          <button
            className="absolute top-2 right-2 text-black"
            onClick={onClose}
          >
            &#x2715;
          </button>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  };

// const GlobeView: React.FC = () => {
//     const { activePlanet, updatePlanetLocation } = useActivePlanet();
//     const handleUpdatetToGlobeAnomalyLocation = () => {
//         updatePlanetLocation(35);
//     };

//     if (activePlanet?.id !== 35) {
//         updatePlanetLocation(35);
//     };

//     return (
//         <div className="relative min-h-screen">
//             <GlobeStructures />
//         </div>
//     );
// };

// export default GlobeView;

const GlobeStructures: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);

    const handleStructuresFetch = (
        surface: InventoryStructureItem[]
    ) => {
        setSurfaceStructures(surface);
    };

    const fetchStructures = useCallback(async () => {
        if (!session || !activePlanet?.id) {
            return;
        };

        try {
            const { data: inventoryData, error } = await supabase
                .from("inventory")
                .select("*")
                .eq("owner", session.user.id)
                .eq("anomaly", activePlanet.id || 35 || 69)
                .not('item', 'lte', 100)

            if (error) {
                throw error;
            };

            const surface = inventoryData.filter((item) => item.locationType === 'Surface');
            handleStructuresFetch(surface);
        } catch (error: any) {
            console.error('Error fetching surface structures: ', error.message);
        };
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    return (
        <EarthViewLayout>
            <div className="w-full">
                <div className="flex flex-row space-y-4">
                    
                </div>
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                </div>
            </div>
            <div className="w-full">
                <div className="py-2">
                    
                </div>
            </div>
            <div className="w-full">
                <center><StructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
            </div>
        </EarthViewLayout>
    );
};