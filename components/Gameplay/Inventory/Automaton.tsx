import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
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

export function CreateAutomaton() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [already, setAlready] = useState(false);

    // Create a function that will create a new automaton (from the `inventory` api route, create from id "23"). only if they don't currently have a rover/automaton. So search through `inventory` for any rows with `owner` == `session?.user?.id`, and `item` == 23. If there is no record, show a button allowing them to create an automaton. Additionally, we have to search through the inventory to make sure they have a rover construction structure (id 22). So only allow them to create an automaton/rover if they don't have id == 23, and they do have id == 22.
    const handleCreateAutomaton = async () => {
        // Check if the user has an automaton already
        const { data: automatonData, error: automatonError } = await supabase.from('inventory').select('id').eq('owner', session?.user?.id).eq('item', 23);
        if (automatonError) {
            console.error('Error checking for existing automaton', automatonError);
            return;
        }

        if (automatonData && automatonData.length > 0) {
            console.log('User already has an automaton');
            setAlready(true);
            return;
        }

        // Check if the user has a rover construction structure
        const { data: structureData, error: structureError } = await supabase.from('inventory').select('id').eq('owner', session?.user?.id).eq('item', 22);
        if (structureError) {
            console.error('Error checking for existing structure', structureError);
            return;
        }

        if (!structureData || structureData.length === 0) {
            console.log('User does not have a rover construction structure');
            return;
        }

        // Create the automaton
        const { data: createdAutomatonData, error: createdAutomatonError } = await supabase.from('inventory').insert([
            {
                owner: session?.user?.id,
                item: 23,
                quantity: 1,
                anomaly: activePlanet?.id,
                notes: "First Rover Created By User",
            }
        ]);
        if (createdAutomatonError) {
            console.error('Error creating automaton', createdAutomatonError);
            return;
        }

        console.log('Automaton created', createdAutomatonData);
    };
    
    if (!already) {
        return (
            <>
                Create a new automaton
                <button onClick={handleCreateAutomaton}>Create Automaton</button>
            </>
        );
    };

    return null;
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

    async function claimRewards() {
        if (userAutomaton?.time_of_deploy) {
            const deployTime = new Date(userAutomaton.time_of_deploy).getTime();
            const currentTime = new Date().getTime();
            const timeDifference = (currentTime - deployTime) / 1000 / 60; // Difference in minutes
            const rewardTotal = Math.floor(timeDifference);

            if (rewardTotal > 0) {
                const { error: insertError } = await supabase.from('inventory').insert([
                    {
                        owner: session?.user?.id,
                        item: 11,
                        quantity: rewardTotal,
                        anomaly: activePlanet?.id,
                        notes: `Reward from automaton ID: ${userAutomaton.id}`,
                    },
                ]);

                if (insertError) {
                    console.error('Error inserting reward', insertError);
                    return;
                }

                const { error: updateError } = await supabase
                    .from('inventory')
                    .update({ time_of_deploy: null })
                    .eq('id', userAutomaton.id);

                if (updateError) {
                    console.error('Error updating automaton', updateError);
                    return;
                }

                setRewardTotal(rewardTotal);
                console.log(`Rewards claimed: ${rewardTotal}`);
            }
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

export function AllAutomatons() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [userAutomatons, setUserAutomatons] = useState<Automaton[]>([]);
    const [selectedAutomaton, setSelectedAutomaton] = useState<Automaton | null>(null);
    const [automatonInfo, setAutomatonInfo] = useState<any>(null); // Initialize automatonInfo with type 'any'
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
            setAutomatonInfo(data.find((item: any) => item.id === automaton.item));
        } catch (error: any) {
            console.error("Error fetching rover info:", error.message);
        }
    };

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
        }
    }

    async function claimRewards() {
        if (selectedAutomaton?.time_of_deploy) {
            const deployTime = new Date(selectedAutomaton.time_of_deploy).getTime();
            const currentTime = new Date().getTime();
            const timeDifference = (currentTime - deployTime) / 1000 / 60; // Difference in minutes
            const rewardTotal = Math.floor(timeDifference);

            if (rewardTotal > 0) {
                const { error: insertError } = await supabase.from('inventory').insert([
                    {
                        owner: session?.user?.id,
                        item: 11,
                        quantity: rewardTotal,
                        anomaly: activePlanet?.id,
                        notes: "Reward from automaton",
                    },
                ]);

                if (insertError) {
                    console.error('Error inserting reward', insertError);
                    return;
                }

                const { error: updateError } = await supabase
                    .from('inventory')
                    .update({ time_of_deploy: null })
                    .eq('id', selectedAutomaton.id);

                if (updateError) {
                    console.error('Error updating automaton', updateError);
                    return;
                }

                setRewardTotal(rewardTotal);
                console.log(`Rewards claimed: ${rewardTotal}`);
            }
        }
    }

    useEffect(() => {
        fetchAutomatonsData();
    }, [session, activePlanet]);

    useEffect(() => {
        if (selectedAutomaton) {
            fetchRoverInfo(selectedAutomaton);
        }
    }, [selectedAutomaton]);

    return (
        <>
            {userAutomatons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userAutomatons.map((automaton) => (
                        <div key={automaton.id} className="cursor-pointer" onClick={() => {
                            setSelectedAutomaton(automaton);
                            setIsModalOpen(true);
                        }}>
                            <img src={automatonInfo?.icon_url} alt={automatonInfo?.name} className="w-32 h-32 mb-2" />
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
                            {automatonInfo?.icon_url ? (
                                <img src={automatonInfo?.icon_url} alt={automatonInfo?.name} className="w-32 h-32 mb-2" />
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