"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { UnownedSurfaceStructures } from "@/components/Structures/Build/EditMode";
import IndividualStructure, { IndividualStructureProps } from "@/components/Structures/IndividualStructure";
import { StructuresConfigForSandbox } from "@/constants/Structures/SandboxProperties";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import { useActivePlanet } from "@/context/ActivePlanet";
import "../../../styles/Anims/StarterStructureAnimations.css";
// import { CreateCommunityStation } from "@/components/Structures/Build/MakeCommunityStation";

interface StructuresOnPlanetProps {
    onStructuresFetch: (
        orbitalStructures: InventoryStructureItem[],
        atmosphereStructures: InventoryStructureItem[],
        surfaceStructures: InventoryStructureItem[]
    ) => void;
};

export default function StructuresOnPlanet({ onStructuresFetch }: StructuresOnPlanetProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
  
    const [userStructuresOnPlanet, setUserStructuresOnPlanet] = useState<InventoryStructureItem[]>([]);
    const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedStructure, setSelectedStructure] = useState<IndividualStructureProps | null>(null);
    const [missionStructureId, setMissionStructureId] = useState<number | null>(null);
  
    const handleIconClick = (itemId: number, inventoryId: number) => {
      const itemDetail = itemDetails.get(itemId);
      if (itemDetail) {
        const config = StructuresConfigForSandbox[itemDetail.id] || {};
        setSelectedStructure({
          name: itemDetail.name,
          imageSrc: itemDetail.icon_url,
          title: `Structure ID: ${inventoryId}`,
          labels: config.labels || [],
          actions: config.actions || [],
          buttons: config.buttons.map(button => ({
            ...button,
            showInNoModal: true,
          })),
          structureId: inventoryId
        });
      }
    };
  
    const handleClose = useCallback(() => {
      setSelectedStructure(null);
    }, []);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="relative">
                {/* <div className="mx-3">
                  <CreateCommunityStation />
                </div> */}
              <div className={`grid grid-cols-3 gap-1 gap-y-3 relative ${userStructuresOnPlanet.length === 1 ? 'justify-center' : ''}`}>
                  {userStructuresOnPlanet.map((structure) => {
                      const itemDetail = itemDetails.get(structure.item);
  
                      return itemDetail ? (
                          <div key={structure.id} className={`flex flex-col items-center space-y-2 ${userStructuresOnPlanet.length === 1 ? 'mx-auto' : ''}`}>
                              <img
                                  src={itemDetail.icon_url}
                                  alt={itemDetail.name}
                                  className={`w-24 h-24 object-cover cursor-pointer ${structure.item === missionStructureId ? 'bouncing-structure' : 'moving-structure'}`}
                                  onClick={() => handleIconClick(itemDetail.id, structure.id)}
                              />
                              <p className="text-white text-sm mt-2">{itemDetail.name}</p>
                          </div>
                      ) : null;
                  })}
              </div>
  
              {selectedStructure && (
                  <IndividualStructure
                      key={selectedStructure.name}
                      name={selectedStructure.name}
                      title={selectedStructure.title}
                      labels={selectedStructure.labels}
                      imageSrc={selectedStructure.imageSrc}
                      actions={selectedStructure.actions}
                      buttons={selectedStructure.buttons}
                      structureId={selectedStructure.structureId}
                      onClose={handleClose}
                  />
              )}
              <div className="m">
                <div className="mx-3">
                  <UnownedSurfaceStructures />
                </div>
              </div>
          </div>
    );
};