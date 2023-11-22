import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CreateBasePlanetSector() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userPlanet, setUserPlanet] = useState(null);

    // Get the planet that the user owns
    const fetchUserPlanet = async () => {
        if (!session) {
            return;
        };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user?.id)
                .single();

            if (data) {
                setUserPlanet(data.location);
            };

            if (error) {
                throw error;
            };
        } catch (error: any) {
            console.error(error.message);
        };
    };

    fetchUserPlanet();

    const createSector = async () => {
        if (session) {
            fetchUserPlanet();
    
            // Array of available resources
            const resources = ["Silicates", "Alloy", "Iron", "Fuel", "Water", "Coal"];
    
            // Randomly choose a resource
            const chosenResource = resources[Math.floor(Math.random() * resources.length)];
    
            // Get the corresponding row from inventoryITEMS
            let depositRowId;
            if (chosenResource === "Coal") {
                depositRowId = 11; // Row ID for Coal
            } else if (chosenResource === "Silicates") {
                depositRowId = 13; // Row ID for Silicates
            } else {
                // You can add similar conditions for other resources if needed
                // depositRowId = 1; // Default to a row ID (you may want to adjust this)
                depositRowId = 13;
            }
    
            // Fetch the corresponding row from inventoryITEMS
            const { data: depositData, error: depositError } = await supabase
                .from('inventoryITEMS')
                .select('name, icon_url')
                .eq('id', depositRowId)
                .single();
    
            if (depositError) {
                console.error(depositError);
                return;
            }
    
            // Set the deposit and coverUrl based on the chosen resource
            const response = await supabase.from('basePlanetSectors').upsert([
                {
                    anomaly: userPlanet,
                    owner: session?.user?.id,
                    deposit: depositData?.name || "Unknown Resource",
                    coverUrl: depositData?.icon_url || "https://example.com/default-image.jpg",
                    explored: false,
                },
            ]);
    
            if (response.error) {
                console.error(response.error);
            } else {
                // Handle success if needed
            }
        }
    };    

    return (
        <div>
            <pre>{userPlanet}</pre>
            <button onClick={createSector}>Create sector</button>
        </div>
    );
};

export function UserOwnedSectorGrid() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [sectorData, setSectorData] = useState([]);

    useEffect(() => {
        const fetchUserSectorImages = async () => {
            if (session) {
                try {
                    const { data, error } = await supabase
                        .from("basePlanetSectors")
                        .select('id, coverUrl')
                        .eq('owner', session?.user?.id);

                    if (data) {
                        setSectorData(data);
                    };

                    if (error) {
                        throw error;
                    };
                } catch (error) {
                    console.error(error.message);
                };
            };
        };

        fetchUserSectorImages();
    }, [session, supabase]);

    return (
        <div className="grid grid-cols-4 gap-2 p-4">
            {sectorData.map((item) => (
                <Link href={`/planets/sector/${item.id}`}><div
                    key={item.id}
                    className="relative overflow-hidden bg-center bg-cover"
                    style={{
                        backgroundImage: `url(${item.coverUrl})`,
                        paddingBottom: '100%',
                        // backgroundPosition: `-${(index % 4) * 25}% -${Math.floor(index / 4) * 25}%`,
                    }}
                ></div></Link>
            ))}
        </div>
    );
};