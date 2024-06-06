"use client"

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { time } from "console";
import { useEffect, useState } from "react";

interface Automaton {
    id: number;
    owner: string;
    item: number;
    quantity: number;
    anomaly: string;
    notes: string;
    icon_url: string;
    name: string;
    time_of_deploy: string;
};

interface InventoryItem {
  id: number;
  item: number;
  owner: string;
  quantity: number;
  notes: string;
  parentItem: number | null;
  time_of_deploy: string;
  anomaly: string | null;
};

export function CreateAutomaton() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [already, setAlready] = useState(false);

    const inventoryData = {
      item: 13,
      owner: session?.user?.id,
      quantity: 3,
      notes: "Created upon the completion of mission 5",
      parentItem: null, // Set this to be the first rover that is built here/through this component
      time_of_deploy: new Date().toISOString(),
      anomaly: activePlanet?.id,
    };
    const inventoryData2 = {
      item: 16,
      owner: session?.user?.id,
      quantity: 2,
      notes: "Created upon the completion of mission 5",
      parentItem: null, // Set this to be the first rover that is built here/through this component
      time_of_deploy: new Date().toISOString(),
      anomaly: activePlanet?.id,
    };

    const handleMissionComplete = async () => {
      try {
        const missionData = {
          user: session?.user?.id,
          time_of_completion: new Date().toISOString(),
          mission: 5,
          configuration: null,
          rewarded_items: [13]//, 13, 13, 16, 16],
        };

        const { data: newMission, error: newMissionError } = await supabase
          .from("missions")
          .insert([missionData]);
      
        if (newMissionError) {
            throw newMissionError;
        };

        const { data: newInventoryEntry, error: newInventoryEntryError } = await supabase
          .from("inventory")
          .insert([inventoryData, inventoryData2]);

        if (inventoryData) {
          console.log('Inventory updated', newInventoryEntry);
        }

        if (newInventoryEntryError) {
          throw newInventoryEntryError;
        };
      } catch (error: any) {
        console.error("Error handling mission completion:", error.message);
      };
    };

    const handleCreateAutomaton = async () => {
        try {
            // Check if the user has an automaton already
            const { data: automatonData, error: automatonError } = await supabase
                .from('inventory')
                .select('id')
                .eq('owner', session?.user?.id)
                .eq('item', 23);

                
            if (automatonError) {
                throw new Error('Error checking for existing automaton');
            }

            if (automatonData && automatonData.length > 0) {
                console.log('User already has an automaton');
                setAlready(true);
                return;
            }

            // Check if the user has a rover construction structure
            const { data: structureData, error: structureError } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session?.user?.id)
                .eq('item', 22);
                
            if (structureError) {
                throw new Error('Error checking for existing structure');
            }

            if (!structureData || structureData.length === 0) {
                console.log('User does not have a rover construction structure');
                return;
            }

            // Create the automaton
            const { data: createdAutomatonData, error: createdAutomatonError } = await supabase
                .from('inventory')
                .insert([
                    {
                        owner: session?.user?.id,
                        item: 23,
                        quantity: 1,
                        anomaly: activePlanet?.id,
                        notes: `First Rover Created By User using Vehicle Structure ${structureData[0].id}. For mission 5`,
                    }
                ]);

                handleMissionComplete();

            if (createdAutomatonError) {
                throw new Error('Error creating automaton');
            }

            console.log('Automaton created', createdAutomatonData);
        } catch (error: any) {
            console.error(error.message);
        }
    };

    return (
        <>
            {!already && (
                <div>
                    Create a new automaton
                    <button onClick={handleCreateAutomaton}>Create Automaton</button>
                </div>
            )}
        </>
    );
};

interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
};

interface UserStructure {
    id: number;
    item: number; // Assuming this should be a number
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

interface AnomalyStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
};

export const AnomalyStructureModal: React.FC<AnomalyStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const [isActionDone, setIsActionDone] = useState(false);

    const handleActionClick = () => {
        // Implement action logic here
        setIsActionDone(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{structure.name}</h2>
                    <button className="btn btn-square btn-outline" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <CreateAutomaton />
                </div>
            </div>
        </div>
    );
};

export function AllAutomatons() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [userAutomatons, setUserAutomatons] = useState<Automaton[]>([]);
  const [automatonInfo, setAutomatonInfo] = useState<{ [key: number]: any }>({});
  const [selectedAutomaton, setSelectedAutomaton] = useState<Automaton | null>(null);
  const [rewardTotal, setRewardTotal] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchAutomatonsData() {
    if (!session?.user?.id) {
      console.error('session.user.id is undefined');
      return;
    }

    if (!activePlanet?.id) {
      console.error('activePlanet is undefined');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inventory')
        .select("*")
        .eq("owner", session.user.id)
        .eq("item", 23)
        .eq("anomaly", activePlanet.id);

      if (error) {
        console.error('Error fetching automatons data:', error);
        return;
      }

      if (data) {
        setUserAutomatons(data); // Assuming data is an array of automatons
      }
    } catch (error) {
      console.error('Error fetching automatons data:', error);
    }
  }

  const fetchRoverInfo = async (automaton: Automaton) => {
    try {
      const response = await fetch(`/api/gameplay/inventory`);
      if (!response.ok) {
        throw new Error(`Error fetching rover info: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const info = data.find((item: any) => item.id === automaton.item);
      setAutomatonInfo((prevInfo) => ({ ...prevInfo, [automaton.id]: info }));
    } catch (error: any) {
      console.error("Error fetching rover info:", error.message);
    }
  };

  useEffect(() => {
    fetchAutomatonsData();
  }, [session, activePlanet]);

  useEffect(() => {
    userAutomatons.forEach((automaton) => {
      if (!automatonInfo[automaton.id]) {
        fetchRoverInfo(automaton);
      }
    });
  }, [userAutomatons]);

  async function deployAutomaton() {
    if (selectedAutomaton != null) {
      const { data, error } = await supabase
        .from('inventory')
        .update({ time_of_deploy: new Date().toISOString() })
        .eq('id', selectedAutomaton.id);

      if (error) {
        console.error('Error deploying automaton:', error);
        return;
      }

      console.log('Automaton deployed', data);
      setSelectedAutomaton({ ...selectedAutomaton, time_of_deploy: new Date().toISOString() });
    }
  }

  async function claimRewards() {
    if (selectedAutomaton?.time_of_deploy) {
      const deployTime = new Date(selectedAutomaton.time_of_deploy).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = (currentTime - deployTime) / 1000 / 60; // Difference in minutes
      const rewardQuantity = Math.floor(timeDifference);

      if (rewardQuantity > 0) {
        const { error: insertError } = await supabase.from('inventory').insert([
          {
            owner: session?.user?.id,
            item: 11,
            quantity: rewardQuantity,
            anomaly: activePlanet?.id,
            notes: `Reward from automaton ID: ${selectedAutomaton.id}`,
          },
        ]);

        if (insertError) {
          console.error('Error inserting reward', insertError);
          return;
        }

        const { error: updateError } = await supabase
          .from('inventory')
          .update({ time_of_deploy: '' })
          .eq('id', selectedAutomaton.id);

        if (updateError) {
          console.error('Error updating automaton', updateError);
          return;
        }

        setRewardTotal(rewardQuantity);
        console.log(`Rewards claimed: ${rewardQuantity}`);
        setSelectedAutomaton({ ...selectedAutomaton, time_of_deploy: '' });
      };
    };
  };

  return (
    <>
      {userAutomatons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userAutomatons.map((automaton) => (
            <div key={automaton.id} className="cursor-pointer" onClick={() => {
              setSelectedAutomaton(automaton);
              setIsModalOpen(true);
            }}>
              <img src={automatonInfo[automaton.id]?.icon_url} alt={automatonInfo[automaton.id]?.name} className="w-32 h-32 mb-2" />
            </div>
          ))}
        </div>
      ) : (
        <p>No automatons found</p>
      )}
      {isModalOpen && selectedAutomaton && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Automaton Details</h2>
              <button
                className="btn btn-square btn-outline"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center mt-4">
              {automatonInfo[selectedAutomaton.id]?.icon_url ? (
                <img src={automatonInfo[selectedAutomaton.id]?.icon_url} alt={automatonInfo[selectedAutomaton.id]?.name} className="w-32 h-32 mb-2" />
              ) : (
                <div className="w-32 h-32 mb-2 bg-gray-200 flex items-center justify-center">
                  <span>No Image</span>
                </div>
              )}
              <p>ID: {selectedAutomaton.id}</p>
              <p>Status: {selectedAutomaton.notes}</p>
              <div className="mt-4 flex space-x-4">
                <button className="btn btn-primary" onClick={deployAutomaton}>
                  Deploy Automaton
                </button>
                {selectedAutomaton.time_of_deploy && (
                  <button className="btn btn-secondary" onClick={claimRewards}>
                    Claim Rewards
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export function SingleAutomaton() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [userAutomaton, setUserAutomaton] = useState<Automaton | null>(null);
    const [automatonInfo, setAutomatonInfo] = useState<any>(null); // Initialize automatonInfo with type 'any'
    const [rewardTotal, setRewardTotal] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchAutomatonData() {
        if (!session?.user?.id) {
            console.error('session.user.id is undefined');
            return;
        };

        if (!activePlanet?.id) {
            console.error('activePlanet is undefined');
            return;
        };

        try {
            const { data, error } = await supabase
                .from('inventory')
                .select("*")
                .eq("owner", session.user.id)
                .eq("item", 23)
                .eq("anomaly", activePlanet.id)
                .limit(1);

            if (error) {
                console.error('Error fetching automaton data:', error);
                return;
            };

            if (data) {
                setUserAutomaton(data[0] || null); // Assuming data is an array
            };
        } catch (error) {
            console.error('Error fetching automaton data:', error);
        };
    };

    const fetchRoverInfo = async () => {
        try {
            const response = await fetch(`/api/gameplay/inventory`);
            if (!response.ok) {
                throw new Error(`Error fetching rover info: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setAutomatonInfo(data.find((item: any) => item.id === userAutomaton?.item));
        } catch (error: any) {
            console.error("Error fetching rover info:", error.message);
        }
    };

    async function deployAutomaton() {
        if (userAutomaton != null) {
            const { data, error } = await supabase
                .from('inventory')
                .update({ time_of_deploy: new Date().toISOString() })
                .eq('id', userAutomaton.id);

            if (error) {
                console.error('Error deploying automaton:', error);
                return;
            }

            console.log('Automaton deployed', data);
        };
    };

    const [userItems, setUserItems] = useState<InventoryItem[]>([]);
    async function fetchUserItems() {
      if (!session) {
        return null;
      };

      try {
        const { data, error } = await supabase
            .from("inventory")
            .select("*")
            .in("item", [17, 18, 19, 20, 21]) // [11, 13, 15, 16, 17, 18, 19, 20, 21]) // Use 'in' instead of 'eq'
            .eq("owner", session.user.id);

        if (error) {
            throw error;
        }

        setUserItems(data || []); // Set data or empty array if data is null
    } catch (error: any) {
        console.error("Error fetching user items:", error.message);
    }
    }

    async function handleMissionComplete() {
      try {
          const missionData = {
              user: session?.user?.id,
              time_of_completion: new Date().toISOString(),
              mission: 6,
              configuration: null,
              rewarded_items: [13, 13, 15],
          };

          // Insert mission data into missions table
          const { data: newMission, error: newMissionError } = await supabase
              .from("missions")
              .insert([missionData]);

          if (newMissionError) {
              throw new Error('Error inserting mission data: ' + newMissionError.message);
          }

          console.log('Mission completed and data inserted', newMission);
      } catch (error: any) {
          console.error("Error handling mission completion:", error.message);
          throw error;
      }
  }

    async function claimRewards() {
      try {
          const inventoryData = {
              item: 13,
              owner: session?.user?.id,
              quantity: 2,
              notes: "Created upon the deployment of the user's first automaton, for mission 6",
              parentItem: userAutomaton?.id,
              time_of_deploy: new Date().toISOString(),
              anomaly: activePlanet?.id,
          };

          const inventoryData2 = {
              item: 15,
              owner: session?.user?.id,
              quantity: 1,
              notes: "Created upon the deployment of the user's first automaton, for mission 6",
              parentItem: userAutomaton?.id,
              time_of_deploy: new Date().toISOString(),
              anomaly: activePlanet?.id,
          };

          // Insert rewards into inventory

          if (!userItems) {
            const { data: newInventoryEntry, error: newInventoryEntryError } = await supabase
            .from("inventory")
            .insert([inventoryData, inventoryData2]);

        if (newInventoryEntryError) {
            throw new Error('Error inserting rewards into inventory: ' + newInventoryEntryError.message);
        }

        console.log('Inventory updated', newInventoryEntry);

        // Handle mission completion
        await handleMissionComplete();
          }

          console.log("Rewards claimed successfully.");
      } catch (error: any) {
          console.error("Error claiming rewards:", error.message);
      }
  }


    useEffect(() => {
        fetchAutomatonData();
    }, [session, activePlanet]);

    useEffect(() => {
        if (userAutomaton) {
            fetchRoverInfo();
        }
    }, [userAutomaton]);

    return (
        <>
            {userAutomaton ? (
                <>
                    <img
                        src={automatonInfo?.icon_url}
                        alt={automatonInfo?.name}
                        className="w-32 h-32 mb-2 cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                    />
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Automaton Details</h2>
                                    <button
                                        className="btn btn-square btn-outline"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="flex flex-col items-center mt-4">
                                    <img src={automatonInfo?.icon_url} alt={automatonInfo?.name} className="w-32 h-32 mb-2" />
                                    <p>ID: {userAutomaton.id}</p>
                                    <p>Status: {userAutomaton.notes}</p>
                                    <div className="mt-4 flex space-x-4">
                                        <button className="btn btn-primary" onClick={deployAutomaton}>
                                            Deploy Automaton
                                        </button>
                                        {userAutomaton.time_of_deploy && (
                                            <button className="btn btn-secondary" onClick={claimRewards}>
                                                Claim Rewards
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>No automaton found</p>
            )}
        </>
    );
};