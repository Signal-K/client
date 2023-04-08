"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useMissions } from '@/context/MissionContext';  
import { Button } from "@/app/components/_[archive]/ui/button";

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    notes?: string;
    time_of_deploy?: string;
}

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
};

interface MiningStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
    missionId: number;
};

interface MiningStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedItem: OwnedItem;
  structure: UserStructure;
}

interface MiningStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedItem: OwnedItem;
  structure: UserStructure;
}

const MiningStationPlaceable: React.FC<MiningStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();
  const { missions } = useMissions();  // Get missions from the MissionContext

  const [userStructure, setUserStructure] = useState<{ ownedItem: OwnedItem; structure: UserStructure; id: number; time_of_deploy?: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<number>(11);  // Default to Coal
  const [availableItems, setAvailableItems] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    if (session && activePlanet && isOpen) {
      fetchData();
    }
  }, [session, activePlanet, isOpen]);

  useEffect(() => {
    if (missions.length > 0) {
      updateAvailableItems();
    }
  }, [missions]);

  const fetchData = async () => {
    if (session && activePlanet) {
      try {
        const { data: ownedItemsData, error: ownedItemsError } = await supabase
          .from('inventory')
          .select('id, item, quantity, notes, time_of_deploy')
          .eq('anomaly', activePlanet.id)
          .eq('item', 30);

        if (ownedItemsError) {
          throw ownedItemsError;
        }

        if (ownedItemsData && ownedItemsData.length > 0) {
          const ownedItem = ownedItemsData[0];

          const { data: structureData, error: structureError } = await supabase
            .from('inventory')
            .select('*')
            .eq('item', ownedItem.item)
            .limit(1);

          if (structureError) {
            throw structureError;
          }

          if (structureData && structureData.length > 0) {
            const structure = structureData[0];
            setUserStructure([{ ownedItem, structure, id: structure.id }]);
          }
        }
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  const updateAvailableItems = () => {
    const itemOptions = [
      { id: 11, name: 'Coal' },
      { id: 13, name: 'Silicon' },
      { id: 15, name: 'Iron' },
      { id: 16, name: 'Nickel' },
      { id: 17, name: 'Alloy' },
      { id: 18, name: 'Fuel' },
      { id: 19, name: 'Copper' },
      { id: 20, name: 'Chromium' },
      { id: 21, name: 'Water' },
    ];

    let itemsToShow = itemOptions.filter(item => {
      if (missions.find(m => m.id === 21)?.completed) {
        return true;  // All items available if mission 21 is completed
      } else if (missions.find(m => m.id === 8)?.completed) {
        return [11, 13, 15, 16].includes(item.id);  // Items available for mission 8 completion
      } else {
        return item.id === 11;  // Default to only Coal
      }
    });

    setAvailableItems(itemsToShow);
  };

  const activateStation = async () => {
    if (userStructure.length > 0) {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .update({ time_of_deploy: new Date().toISOString() })
          .eq('id', userStructure[0]?.ownedItem.id);

        if (error) {
          throw error;
        }

        console.log('Mining station activated: ', data);

        setUserStructure(prevState => {
          const updatedState = [...prevState];
          updatedState[0].ownedItem.time_of_deploy = new Date().toISOString();
          return updatedState;
        });
      } catch (error: any) {
        console.error('Error activating station:', error.message);
      }
    }
  };

  const claimRewards = async () => {
    try {
      if (userStructure.length > 0 && userStructure[0]?.ownedItem?.time_of_deploy) {
        const deployTime = new Date(userStructure[0].ownedItem.time_of_deploy).getTime();
        const currentTime = new Date().getTime();
        const timeDifference = (currentTime - deployTime) / 1000;  // Difference in seconds
        const rewardQuantity = Math.floor(timeDifference / 15) * 2;  // 15 seconds per item

        if (rewardQuantity > 0) {
          const { data: insertData, error: insertError } = await supabase.from('inventory').insert([
            {
              owner: session?.user?.id,
              item: selectedItem,
              quantity: rewardQuantity,
              anomaly: activePlanet?.id,
              notes: `Reward from mining station id: ${userStructure[0].ownedItem?.id}`,
            },
          ]);

          if (insertError) {
            throw insertError;
          }

          console.log('Rewards inserted: ', insertData);

          const { data: updateData, error: updateError } = await supabase
            .from('inventory')
            .update({ time_of_deploy: null })
            .eq('id', userStructure[0].ownedItem.id);

          if (updateError) {
            throw updateError;
          }

          console.log('Station deactivated: ', updateData);
          // useRefresh
          // onClose();
        } else {
          console.log('No rewards to claim.');
        }
      }
    } catch (error: any) {
      console.error('Error claiming rewards:', error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg mx-auto shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{structure.name}</h2>
          <button className="btn btn-square btn-outline" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center mt-4">
          <img src={structure.icon_url} alt={structure.name} className="w-32 h-32 mb-2" />
          <p>ID: {ownedItem.id}</p>
          <p>Description: {structure.description}</p>
          <div className="mt-4 w-full">
            {userStructure.length > 0 && (
              <>
                <div className="mb-4">
                  <label htmlFor="item-select" className="block text-sm font-medium text-gray-700">Select Item</label>
                  <select
                    id="item-select"
                    className="form-select mt-2 block w-full"
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(Number(e.target.value))}
                  >
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-100 p-6 rounded-xl w-full">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <GemIcon className="w-7 h-7 text-indigo-500" />
                      <span className="font-medium">Resources left</span>
                      <div className="text-right text-lg font-medium">250</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CuboidIcon className="w-7 h-7 text-amber-500" />
                      <span className="font-medium">Power</span>
                      <div className="text-right text-lg font-medium">500</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <LeafIcon className="w-7 h-7 text-green-500" />
                      <span className="font-medium">Energy rating</span>
                      <div className="text-right text-lg font-medium">100</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BoltIcon className="w-7 h-7 text-yellow-500" />
                      <span className="font-medium">Energy</span>
                      <div className="text-right text-lg font-medium">75</div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      onClick={activateStation}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
                    >
                      Activate
                    </button>
                    <button
                      onClick={claimRewards}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                      Claim Rewards
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiningStationPlaceable;


function BatteryIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
        <line x1="22" x2="22" y1="11" y2="13" />
      </svg>
    )
  }
  
  
  function BoltIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  }
  
  
  function CombineIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="8" height="8" x="2" y="2" rx="2" />
        <path d="M14 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2" />
        <path d="M20 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2" />
        <path d="M10 18H5c-1.7 0-3-1.3-3-3v-1" />
        <polyline points="7 21 10 18 7 15" />
        <rect width="8" height="8" x="14" y="14" rx="2" />
      </svg>
    )
  }
  
  
  function CpuIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="16" x="4" y="4" rx="2" />
        <rect width="6" height="6" x="9" y="9" rx="1" />
        <path d="M15 2v2" />
        <path d="M15 20v2" />
        <path d="M2 15h2" />
        <path d="M2 9h2" />
        <path d="M20 15h2" />
        <path d="M20 9h2" />
        <path d="M9 2v2" />
        <path d="M9 20v2" />
      </svg>
    )
  }
  
  
  function CuboidIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21.12 6.4-6.05-4.06a2 2 0 0 0-2.17-.05L2.95 8.41a2 2 0 0 0-.95 1.7v5.82a2 2 0 0 0 .88 1.66l6.05 4.07a2 2 0 0 0 2.17.05l9.95-6.12a2 2 0 0 0 .95-1.7V8.06a2 2 0 0 0-.88-1.66Z" />
        <path d="M10 22v-8L2.25 9.15" />
        <path d="m10 14 11.77-6.87" />
      </svg>
    )
  }
  
  
  function DrillIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 9c0 .6-.4 1-1 1H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9c.6 0 1 .4 1 1Z" />
        <path d="M18 6h4" />
        <path d="M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3" />
        <path d="m5 10-2 8" />
        <path d="M12 10v3c0 .6-.4 1-1 1H8" />
        <path d="m7 18 2-8" />
        <path d="M5 22c-1.7 0-3-1.3-3-3 0-.6.4-1 1-1h7c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1Z" />
      </svg>
    )
  }
  
  
  function GaugeIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    )
  }
  
  
  function GemIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    )
  }
  
  
  function LeafIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    )
  }
  
  
  function PinIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" x2="12" y1="17" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    )
  }
  
  
  function WrenchIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    )
  }
  