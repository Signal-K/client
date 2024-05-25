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
                    <p>{userAutomaton.id}</p>
                    {automatonInfo && (
                        <>
                            <img src={automatonInfo.icon_url} alt={automatonInfo.name} className="w-32 h-32 mb-2" />
                            <p>{automatonInfo.name}</p>
                        </>
                    )}
                    <button onClick={deployAutomaton}>Deploy automaton</button>
                    {userAutomaton.time_of_deploy && (
                        <button onClick={claimRewards}>Claim Rewards</button>
                    )}
                </>
            ) : (
                <p>No automaton found</p>
            )}
        </>
    )
};


// Create a function that looks at the user's inventory, and for all rows where the inventory item type is listed as "Automaton" on the `inventory` route (e.g. item 23), show the item image, name, and id (in the `inventory` table). So there should be a component that fetches all the matching records, and then a component that shows each of the automatons/rovers (i.e. one component (a single) for every automaton/rover)
export function AllAutomatons() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [automatons, setAutomatons] = useState<Automaton[]>([]);

    useEffect(() => {
        const fetchAutomatons = async () => {
            const { data, error } = await supabase.from('inventory').select('*').eq('owner', session?.user?.id).eq('item', 23);
            if (error) {
                console.error('Error fetching automatons', error);
                return;
            }

            if (data) {
                setAutomatons(data);
            };
        };

        fetchAutomatons();
    }, [session]);

    return (
        <>
            {automatons.map((automaton) => (
                <div key={automaton.id}>
                    <img src={automaton.icon_url} alt={automaton.name} />
                    <div>{automaton.name}</div>
                    <div>{automaton.id}</div>
                </div>
            ))}
        </>
    );
};