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

    useEffect(() => {
        getRovers();
    }, [session]);

    async function getRovers() {
        try {
            if (!session || !session.user || !session.user.id) {
                console.log("User session not available");
                return;
            }
    
            const { data: userRovers, error: userRoversError } = await supabase
                .from("inventoryUSERS")
                .select("*")
                .eq("owner", session.user.id)
                .eq("item", 23 || 24); // Adjust this condition as needed
    
            if (userRoversError) {
                throw userRoversError;
            }
    
            if (userRovers && userRovers.length > 0) {
                // Extract item IDs from userRovers
                const itemIds = userRovers.map(rover => rover.item);
    
                // Fetch details of items from inventoryITEMS table
                const { data: items, error: itemsError } = await supabase
                    .from("inventoryITEMS")
                    .select("*")
                    .in("id", itemIds);
    
                if (itemsError) {
                    throw itemsError;
                }
    
                // Merge item details with userRovers
                const mergedRovers = userRovers.map(rover => {
                    const item = items.find(item => item.id === rover.item);
                    return { ...rover, item };
                });
    
                setUserRovers(mergedRovers);
                console.log('Test', mergedRovers);
            } else {
                setUserRovers([]);
            }
        } catch (error) {
            console.error("Error fetching rovers:", error.message);
        }
    };
    

    return (
        <div className="grid grid-cols-3 gap-4">
            {userRovers.map(rover => (
                <div key={rover.id} className="border p-4">
                    <img src={rover.icon_url} alt={rover.name} className="h-24 mx-auto mb-2" />
                    <p>ID: {rover.id}</p>
                    <p>Name: {rover.name}</p>
                </div>
            ))}
        </div>
    );
};