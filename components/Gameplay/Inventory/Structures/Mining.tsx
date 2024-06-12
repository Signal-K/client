"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

import { Button } from "@/components/ui/button";

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
};

export function MeteorologyToolPlaceable() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [userStructure, setUserStructure] = useState<{ ownedItem: OwnedItem; structure: UserStructure; id: number; time_of_deploy?: string }[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);

  async function activateStation() {
    if (userStructure != null) {
      const { data, error } = await supabase
        .from("inventory")
        .update({ time_of_deploy: new Date().toISOString() })
        .eq('id', userStructure[0]?.ownedItem.id);

      if (error) {
        console.error('Error activating station: ', error);
        return;
      };

      console.log('Mining station activated: ', data);

      // Update the state to reflect the new time_of_deploy
      setUserStructure(prevState => {
        const updatedState = [...prevState];
        updatedState[0].ownedItem.time_of_deploy = new Date().toISOString();
        return updatedState;
      });
    };
  };

  async function claimRewards() {
    try {
        if (userStructure.length > 0 && userStructure[0]?.ownedItem?.time_of_deploy) {
            const deployTime = new Date(userStructure[0].ownedItem.time_of_deploy).getTime();
            const currentTime = new Date().getTime();
            const timeDifference = currentTime - deployTime;
            const rewardQuantity = Math.floor(timeDifference / 1000) * 2; // Convert milliseconds to seconds

            if (rewardQuantity > 0) {
                const { data: insertData, error: insertError } = await supabase
                    .from("inventory")
                    .insert([
                        {
                            owner: session?.user.id,
                            item: 11, // Assuming the item ID for rewards is 11
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
            } else {
                console.log('No rewards to claim.');
            };
        };
    } catch (error: any) {
        console.error('Error claiming rewards: ', error.message);
    };
};

const [requiredResourcesQuantity, setRequiredResourcesQuantity] = useState<number | null>(null);
const [hasRequiredResources, setHasRequiredResources] = useState<boolean>(false);

  async function fetchData() {
      if (session && activePlanet) {
          try {
              const { data: ownedItemsData, error: ownedItemsError } = await supabase
                  .from("inventory")
                  .select("id, item, quantity, notes, time_of_deploy")
                  .eq("anomaly", activePlanet.id)
                  .eq("item", 26);

              if (ownedItemsError) {
                  throw ownedItemsError;
              }

              if (ownedItemsData && ownedItemsData.length > 0) {
                  const ownedItem = ownedItemsData[0]; 

                  const { data: structureData, error: structureError } = await supabase
                      .from("inventory")
                      .select("*")
                      .eq("item", ownedItem.item)
                      .limit(1);

                  if (structureError) {
                      throw structureError;
                  }

                  if (structureData && structureData.length > 0) {
                      const structure = structureData[0];
                      setUserStructure([{ ownedItem, structure, id: structure.id }]);
                  };
              };
          } catch (error: any) {
              console.error(error);
          };
      }
  }

  useEffect(() => {
      fetchData();
  }, [session, activePlanet, supabase]);

  return (
    <>
      {userStructure.length > 0 && (
        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <div className="bg-gray-100 p-6 rounded-xl grid grid-cols-2 gap-6">
                    <span className="font-medium">On planet</span>
                      <div className="flex items-center gap-3">
                          <GemIcon className="w-7 h-7 text-indigo-500" />
                          <span className="font-medium">Coal</span>
                          <div className="text-right text-lg font-medium">250</div>
                      </div>
                      <div className="flex items-center gap-3">
                          <CuboidIcon className="w-7 h-7 text-amber-500" />
                          <span className="font-medium">Silicon</span>
                          <div className="text-right text-lg font-medium">500</div>
                      </div>
                      <div className="flex items-center gap-3">
                          <LeafIcon className="w-7 h-7 text-green-500" />
                          <span className="font-medium">Organics</span>
                          <div className="text-right text-lg font-medium">100</div>
                      </div>
                      <div className="flex items-center gap-3">
                          <BoltIcon className="w-7 h-7 text-yellow-500" />
                          <span className="font-medium">Energy</span>
                          <div className="text-right text-lg font-medium">75</div>
                      </div>
                  </div>
              </div>
              <div>
                  <div className="bg-gray-100 p-6 rounded-xl grid grid-cols-2 gap-6">
                    <span className="font-medium">In Production</span>
                      <div className="flex items-center gap-3">
                          <GemIcon className="w-7 h-7 text-indigo-500" />
                          <span className="font-medium">Coal</span>
                          <div className="text-right text-lg font-medium">0</div>
                      </div>
                      <div className="flex items-center gap-3">
                          <CuboidIcon className="w-7 h-7 text-amber-500" />
                          <span className="font-medium">Silicon</span>
                          <div className="text-right text-lg font-medium">0</div>
                      </div>
                      <div className="flex items-center gap-3">
                          <LeafIcon className="w-7 h-7 text-green-500" />
                          <span className="font-medium">Organics</span>
                          <div className="text-right text-lg font-medium">0</div>
                      </div>
                      <div className="flex items-center gap-3">
                          <BoltIcon className="w-7 h-7 text-yellow-500" />
                          <span className="font-medium">Energy</span>
                          <div className="text-right text-lg font-medium">0</div>
                      </div>
                  </div>
              </div>
          </div>
          <div className="mt-8 bg-gray-100 p-6 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                  <GaugeIcon className="w-7 h-7 text-blue-500" />
                  <span className="font-medium">Production Rate</span>
                  <div className="text-right text-lg font-medium">25 units/hr</div>
              </div>
              <div className="flex items-center gap-3">
                  <CuboidIcon className="w-7 h-7 text-amber-500" />
                  <span className="font-medium">Storage Capacity</span>
                  <div className="text-right text-lg font-medium">1000 units</div>
              </div>
              <div className="flex items-center gap-3">
                  <WrenchIcon className="w-7 h-7 text-gray-500" />
                  <span className="font-medium">Equipment Level</span>
                  <div className="text-right text-lg font-medium">3</div>
              </div>
              <div className="flex items-center gap-3">
                  <PinIcon className="w-7 h-7 text-indigo-500" />
                  <span className="font-medium">Tech Level</span>
                  <div className="text-right text-lg font-medium">2</div>
              </div>
          </div>
          <div className="mt-8 bg-gray-100 p-6 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                      <DrillIcon className="w-7 h-7 text-amber-500" />
                      <span className="font-medium">Mining Drill</span>
                  </div>
                  <Button size="sm" variant="outline">
                      Upgrade
                  </Button>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                      <CombineIcon className="w-7 h-7 text-gray-500" />
                      <span className="font-medium">Conveyor Belt</span>
                  </div>
                  <Button onClick={activateStation} disabled={loading || !!userStructure[0].ownedItem.time_of_deploy} size="sm" variant="outline">
                    {userStructure[0].ownedItem.time_of_deploy ? 'Station Active' : 'Activate Station'}
                  </Button>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                      {/* <TruckIcon className="w-7 h-7 text-blue-500" /> */}
                      <span className="font-medium">Transport Truck</span>
                  </div>
                  <Button size="sm" variant="outline">
                      Upgrade
                  </Button>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                      {/* <BuildingIcon className="w-7 h-7 text-indigo-500" /> */}
                      <span className="font-medium">Storage Facility</span>
                  </div>
                  <Button onClick={claimRewards} disabled={loading} size="sm" variant="outline">
                      Collect rewards
                  </Button>
              </div>
          </div>
        </div>
                      //     <MiningStructureModal
                      //     isOpen={true}
                      //     onClose={() => {}}
                      //     ownedItem={userStructure[0].ownedItem}
                      //     structure={userStructure[0].structure}
                      // />
      )}
    </>
  );
};

export default function MiningStationPlaceable() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [userStructure, setUserStructure] = useState<{ ownedItem: OwnedItem; structure: UserStructure; id: number; time_of_deploy?: string }[]>([]);
    
    const [loading, setLoading] = useState<boolean>(false);

    async function activateStation() {
      if (userStructure != null) {
        const { data, error } = await supabase
          .from("inventory")
          .update({ time_of_deploy: new Date().toISOString() })
          .eq('id', userStructure[0]?.ownedItem.id);

        if (error) {
          console.error('Error activating station: ', error);
          return;
        };

        console.log('Mining station activated: ', data);

        // Update the state to reflect the new time_of_deploy
        setUserStructure(prevState => {
          const updatedState = [...prevState];
          updatedState[0].ownedItem.time_of_deploy = new Date().toISOString();
          return updatedState;
        });
      };
    };

    async function claimRewards() {
      try {
          if (userStructure.length > 0 && userStructure[0]?.ownedItem?.time_of_deploy) {
              const deployTime = new Date(userStructure[0].ownedItem.time_of_deploy).getTime();
              const currentTime = new Date().getTime();
              const timeDifference = currentTime - deployTime;
              const rewardQuantity = Math.floor(timeDifference / 1000) * 2; // Convert milliseconds to seconds
  
              if (rewardQuantity > 0) {
                  const { data: insertData, error: insertError } = await supabase
                      .from("inventory")
                      .insert([
                          {
                              owner: session?.user.id,
                              item: 11, // Assuming the item ID for rewards is 11
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
              } else {
                  console.log('No rewards to claim.');
              };
          };
      } catch (error: any) {
          console.error('Error claiming rewards: ', error.message);
      };
  };

  const [requiredResourcesQuantity, setRequiredResourcesQuantity] = useState<number | null>(null);
  const [hasRequiredResources, setHasRequiredResources] = useState<boolean>(false);

    async function fetchData() {
        if (session && activePlanet) {
            try {
                const { data: ownedItemsData, error: ownedItemsError } = await supabase
                    .from("inventory")
                    .select("id, item, quantity, notes, time_of_deploy")
                    .eq("anomaly", activePlanet.id)
                    .eq("item", 30);

                if (ownedItemsError) {
                    throw ownedItemsError;
                }

                if (ownedItemsData && ownedItemsData.length > 0) {
                    const ownedItem = ownedItemsData[0]; 

                    const { data: structureData, error: structureError } = await supabase
                        .from("inventory")
                        .select("*")
                        .eq("item", ownedItem.item)
                        .limit(1);

                    if (structureError) {
                        throw structureError;
                    }

                    if (structureData && structureData.length > 0) {
                        const structure = structureData[0];
                        setUserStructure([{ ownedItem, structure, id: structure.id }]);
                    };
                };
            } catch (error: any) {
                console.error(error);
            };
        }
    }

    useEffect(() => {
        fetchData();
    }, [session, activePlanet, supabase]);

    return (
      <>
        {userStructure.length > 0 && (
          <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="bg-gray-100 p-6 rounded-xl grid grid-cols-2 gap-6">
                      <span className="font-medium">On planet</span>
                        <div className="flex items-center gap-3">
                            <GemIcon className="w-7 h-7 text-indigo-500" />
                            <span className="font-medium">Coal</span>
                            <div className="text-right text-lg font-medium">250</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CuboidIcon className="w-7 h-7 text-amber-500" />
                            <span className="font-medium">Silicon</span>
                            <div className="text-right text-lg font-medium">500</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LeafIcon className="w-7 h-7 text-green-500" />
                            <span className="font-medium">Organics</span>
                            <div className="text-right text-lg font-medium">100</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <BoltIcon className="w-7 h-7 text-yellow-500" />
                            <span className="font-medium">Energy</span>
                            <div className="text-right text-lg font-medium">75</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-gray-100 p-6 rounded-xl grid grid-cols-2 gap-6">
                      <span className="font-medium">In Production</span>
                        <div className="flex items-center gap-3">
                            <GemIcon className="w-7 h-7 text-indigo-500" />
                            <span className="font-medium">Coal</span>
                            <div className="text-right text-lg font-medium">0</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CuboidIcon className="w-7 h-7 text-amber-500" />
                            <span className="font-medium">Silicon</span>
                            <div className="text-right text-lg font-medium">0</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LeafIcon className="w-7 h-7 text-green-500" />
                            <span className="font-medium">Organics</span>
                            <div className="text-right text-lg font-medium">0</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <BoltIcon className="w-7 h-7 text-yellow-500" />
                            <span className="font-medium">Energy</span>
                            <div className="text-right text-lg font-medium">0</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-gray-100 p-6 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                    <GaugeIcon className="w-7 h-7 text-blue-500" />
                    <span className="font-medium">Production Rate</span>
                    <div className="text-right text-lg font-medium">25 units/hr</div>
                </div>
                <div className="flex items-center gap-3">
                    <CuboidIcon className="w-7 h-7 text-amber-500" />
                    <span className="font-medium">Storage Capacity</span>
                    <div className="text-right text-lg font-medium">1000 units</div>
                </div>
                <div className="flex items-center gap-3">
                    <WrenchIcon className="w-7 h-7 text-gray-500" />
                    <span className="font-medium">Equipment Level</span>
                    <div className="text-right text-lg font-medium">3</div>
                </div>
                <div className="flex items-center gap-3">
                    <PinIcon className="w-7 h-7 text-indigo-500" />
                    <span className="font-medium">Tech Level</span>
                    <div className="text-right text-lg font-medium">2</div>
                </div>
            </div>
            <div className="mt-8 bg-gray-100 p-6 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        <DrillIcon className="w-7 h-7 text-amber-500" />
                        <span className="font-medium">Mining Drill</span>
                    </div>
                    <Button size="sm" variant="outline">
                        Upgrade
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        <CombineIcon className="w-7 h-7 text-gray-500" />
                        <span className="font-medium">Conveyor Belt</span>
                    </div>
                    <Button onClick={activateStation} disabled={loading || !!userStructure[0].ownedItem.time_of_deploy} size="sm" variant="outline">
                      {userStructure[0].ownedItem.time_of_deploy ? 'Station Active' : 'Activate Station'}
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        {/* <TruckIcon className="w-7 h-7 text-blue-500" /> */}
                        <span className="font-medium">Transport Truck</span>
                    </div>
                    <Button size="sm" variant="outline">
                        Upgrade
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        {/* <BuildingIcon className="w-7 h-7 text-indigo-500" /> */}
                        <span className="font-medium">Storage Facility</span>
                    </div>
                    <Button onClick={claimRewards} disabled={loading} size="sm" variant="outline">
                        Collect rewards
                    </Button>
                </div>
            </div>
          </div>
                        //     <MiningStructureModal
                        //     isOpen={true}
                        //     onClose={() => {}}
                        //     ownedItem={userStructure[0].ownedItem}
                        //     structure={userStructure[0].structure}
                        // />
        )}
      </>
    );
};

export const MiningStructureModal: React.FC<MiningStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const { activePlanet } = useActivePlanet();

    if (!isOpen) {
        return null;
    };

    return (
      <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="bg-gray-100 p-6 rounded-xl grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <GemIcon className="w-7 h-7 text-indigo-500" />
                            <span className="font-medium">Crystals</span>
                            <div className="text-right text-lg font-medium">250</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CuboidIcon className="w-7 h-7 text-amber-500" />
                            <span className="font-medium">Metals</span>
                            <div className="text-right text-lg font-medium">500</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LeafIcon className="w-7 h-7 text-green-500" />
                            <span className="font-medium">Organics</span>
                            <div className="text-right text-lg font-medium">100</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <BoltIcon className="w-7 h-7 text-yellow-500" />
                            <span className="font-medium">Energy</span>
                            <div className="text-right text-lg font-medium">75</div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-gray-100 p-6 rounded-xl grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <GemIcon className="w-7 h-7 text-indigo-500" />
                            <span className="font-medium">Crystals</span>
                            <div className="text-right text-lg font-medium">150</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CuboidIcon className="w-7 h-7 text-amber-500" />
                            <span className="font-medium">Metals</span>
                            <div className="text-right text-lg font-medium">300</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <LeafIcon className="w-7 h-7 text-green-500" />
                            <span className="font-medium">Organics</span>
                            <div className="text-right text-lg font-medium">75</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <BoltIcon className="w-7 h-7 text-yellow-500" />
                            <span className="font-medium">Energy</span>
                            <div className="text-right text-lg font-medium">50</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-gray-100 p-6 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                    <GaugeIcon className="w-7 h-7 text-blue-500" />
                    <span className="font-medium">Production Rate</span>
                    <div className="text-right text-lg font-medium">25 units/hr</div>
                </div>
                <div className="flex items-center gap-3">
                    <CuboidIcon className="w-7 h-7 text-amber-500" />
                    <span className="font-medium">Storage Capacity</span>
                    <div className="text-right text-lg font-medium">1000 units</div>
                </div>
                <div className="flex items-center gap-3">
                    <WrenchIcon className="w-7 h-7 text-gray-500" />
                    <span className="font-medium">Equipment Level</span>
                    <div className="text-right text-lg font-medium">3</div>
                </div>
                <div className="flex items-center gap-3">
                    <PinIcon className="w-7 h-7 text-indigo-500" />
                    <span className="font-medium">Tech Level</span>
                    <div className="text-right text-lg font-medium">2</div>
                </div>
            </div>
            <div className="mt-8 bg-gray-100 p-6 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        <DrillIcon className="w-7 h-7 text-amber-500" />
                        <span className="font-medium">Mining Drill</span>
                    </div>
                    <Button size="sm" variant="outline">
                        Upgrade
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        <CombineIcon className="w-7 h-7 text-gray-500" />
                        <span className="font-medium">Conveyor Belt</span>
                    </div>
                    <Button size="sm" variant="outline">
                        Upgrade
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        {/* <TruckIcon className="w-7 h-7 text-blue-500" /> */}
                        <span className="font-medium">Transport Truck</span>
                    </div>
                    <Button size="sm" variant="outline">
                        Upgrade
                    </Button>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                        {/* <BuildingIcon className="w-7 h-7 text-indigo-500" /> */}
                        <span className="font-medium">Storage Facility</span>
                    </div>
                    <Button size="sm" variant="outline">
                        Upgrade
                    </Button>
                </div>
            </div>
        </div>
    );
};

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
  