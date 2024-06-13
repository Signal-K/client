"use client"

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlacedStructureSingle } from "@/components/Gameplay/Inventory/Structures/Structure";

interface MyOwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string; 
    notes?: string;
    anomaly: number;
};

interface UserStructure {
    id: number;
    item: number; 
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    ownedItem?: MyOwnedItem;
    structure?: any;
};

interface AutomatonUpgradeStructureModalProps {
    onClose: () => void;
    ownedItem: MyOwnedItem;
    structure: UserStructure;
};

export const AutomatonUpgradeStructureModal: React.FC<AutomatonUpgradeStructureModalProps> = ({ onClose, ownedItem, structure }) => {
    const [isActionDone, setIsActionDone] = useState(false);
    const { activePlanet } = useActivePlanet();

    const handleActionClick = () => {
        // Implement action logic here
        setIsActionDone(true);
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/citiAnomalies/${activePlanet?.id}/ActivePlanet.png`;

    return (
        <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{structure.name}</h2>
                <button className="btn btn-square btn-outline" onClick={onClose}>
                    ✕
                </button>
            </div>
            <div className="flex flex-col items-center mt-4">
                <img src={structure.icon_url} alt={structure.name} className="w-32 h-32 mb-2" />
                <p>ID: {ownedItem.id}</p>
                <p>{ownedItem.notes}</p>
                <p>Description: {structure.description}</p>
                <div className="mt-4">
                    <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} />
                </div>
            </div>
        </div>
    );
};

interface CheckInventoryProps {
    itemId: number;
};

export const AUSM: React.FC<CheckInventoryProps> = ({ itemId }) => {
    if (itemId !== 31) return null;
  
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
  
    const [ownedItem, setOwnedItem] = useState<MyOwnedItem | null>(null);
    const [structure, setStructure] = useState<UserStructure | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
    async function fetchData() {
      if (session && activePlanet) {
        try {
          const { data: ownedItemsData, error: ownedItemsError } = await supabase
            .from('inventory')
            .select('*')
            .eq('owner', session.user.id)
            .eq('anomaly', activePlanet.id)
            .eq('item', itemId);
  
          if (ownedItemsError) {
            throw ownedItemsError;
          }
  
          if (ownedItemsData && ownedItemsData.length > 0) {
            const ownedItem = ownedItemsData[0];
  
            // Fetch item details from the Next.js API
            const response = await fetch('/api/gameplay/inventory');
            if (!response.ok) {
              throw new Error('Failed to fetch item details from the API');
            }
            const itemDetailsData: UserStructure[] = await response.json();
  
            if (itemDetailsData) {
              const structure = itemDetailsData.find(itemDetail => itemDetail.id === itemId);
  
              if (structure) {
                setOwnedItem(ownedItem);
                setStructure(structure);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }
  
    useEffect(() => {
      fetchData();
    }, [session, activePlanet, itemId, supabase]);
  
  
    if (!ownedItem || !structure) {
      return (
        <div>
          <button
            onClick={async () => {
              const response = await fetch('/api/gameplay/inventory');
              const itemDetailsData: UserStructure[] = await response.json();
              const structure = itemDetailsData.find(itemDetail => itemDetail.id === itemId);
            }}
            className="px-4 py-2 text-white bg-green-500 rounded-md focus:outline-none hover:bg-green-600"
          >
            Create Structure
          </button>
          {errorMessage && (
            <div className="mt-4 bg-red-500 text-white p-4 rounded-md">
              {errorMessage}
            </div>
          )}
        </div>
      );
    }
  
    return (
      <PlacedStructureSingle
        ownedItem={ownedItem}
        structure={structure}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  };