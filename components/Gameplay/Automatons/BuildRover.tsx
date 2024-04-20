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
}
