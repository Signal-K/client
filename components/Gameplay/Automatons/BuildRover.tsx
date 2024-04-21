import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function BuildFirstRover() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [roverCreated, setRoverCreated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkRoverStatus() {
            try {
                if (!session?.user?.id) return;

                const { data: userItems, error: userItemsError } = await supabase
                    .from("inventoryUSERS")
                    .select("*")
                    .eq("owner", session.user.id)
                    .eq("notes", "first rover created by user");

                if (userItemsError) {
                    throw userItemsError;
                }

                if (userItems && userItems.length > 0) {
                    setRoverCreated(true);
                }

                // if (userItems && userItems.length > 0) {
                //     const roverItem = userItems.find(item => item.itemCategory === "Automaton");
                //     if (roverItem) {
                //         setRoverCreated(true);
                //     }
                // }
            } catch (error) {
                console.error("Error checking rover status:", error.message);
            } finally {
                setLoading(false);
            }
        }

        checkRoverStatus();
    }, [supabase, session]);

    async function addRoverToSupa() {
        try {
            if (roverCreated) {
                console.log("You've already created your first rover");
                return;
            }

            const { data, error } = await supabase
                .from("inventoryUSERS")
                .insert([
                    {
                        item: 23, // Assuming 23 is the ID of the rover item in inventoryITEMS table
                        owner: session?.user?.id,
                        sector: "18",
                        planetSector: "18",
                        notes: "first rover created by user"
                    }
                ]);

            if (error) {
                throw error;
            }

            console.log("Rover added successfully:", data);
            setRoverCreated(true);
        } catch (error) {
            console.error("Error adding rover:", error.message);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {!roverCreated && (
                <button onClick={addRoverToSupa}>Add Rover</button>
            )}
            {roverCreated && (
                <p>You've already created your first rover</p>
            )}
        </div>
    );
};

export function ViewRovers() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userRovers, setUserRovers] = useState<any[]>([]);
    const [roverDetails, setRoverDetails] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    useEffect(() => {
        getRovers();
    }, [session]);

    async function getRovers() {
        try {
            if (!session || !session.user || !session.user.id) {
                console.log("User session not available");
                return;
            };

            setIsLoading(true);

            const { data: userRovers, error: userRoversError } = await supabase
                .from("inventoryUSERS")
                .select("*")
                .eq("owner", session.user.id)
                .eq("item", 23 || 24); // Adjust this condition as needed

            if (userRoversError) {
                throw userRoversError;
            };

            if (userRovers && userRovers.length > 0) {
                setUserRovers(userRovers);
                const roverIds = userRovers.map(item => item.item);
                const { data, error } = await supabase
                    .from("inventoryITEMS")
                    .select("*")
                    .in("id", roverIds);

                if (data) {
                    setRoverDetails(data);
                };
            } else {
                setUserRovers([]);
            };
        } catch (error) {
            console.error("Error fetching rovers:", error.message);
        } finally {
            setIsLoading(false);
        };
    };

    const combinedRovers = userRovers.map(userRover => {
        const roverDetail = roverDetails.find(detail => detail.id === userRover.item);
        return {
            ...userRover,
            ...roverDetail,
        };
    });

    // If the component is loading, you can display a loading indicator or message
    if (isLoading) {
        return <div>Loading...</div>;
    };

    // Render the list of rovers
    return (
        <div className="w-full mt-5">
            Your rovers:
            {combinedRovers.map(rover => (
                <div key={rover.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={rover.icon_url} alt={rover.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm">{rover.name}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};