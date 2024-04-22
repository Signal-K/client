import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import React, { useEffect, useState } from "react"
import { ViewRovers } from "../Automatons/BuildRover";

export default function CollectItemFromSector() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userSectors, setUserSectors] = useState<any[]>([]);
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [timeOfDeploy, setTimeOfDeploy] = useState<Date | null>(null);
    const [isDeployed, setIsDeployed] = useState<boolean>(false);
    const [reward, setReward] = useState<number>(0);

    useEffect(() => {
        fetchUserSectors();
    }, [session]);

    const fetchUserSectors = async () => {
        try {
            const { data, error } = await supabase
                .from("basePlanetSectors")
                .select("*")
                .eq("owner", session?.user?.id);

            if (error) {
                throw error;
            }

            if (data) {
                setUserSectors(data);
            }
        } catch (error) {
            console.error("Error fetching user sectors:", error.message);
        }
    };

    const handleSectorSelect = (sectorId: string) => {
        setSelectedSectorId(sectorId);
    };

    const deployRover = async () => {
        if (!selectedSectorId) {
            console.error("Please select a sector before deploying a rover.");
            return;
        }

        // Check if the user owns the selected sector
        const ownedSector = userSectors.find(sector => sector.id === selectedSectorId);
        if (!ownedSector) {
            console.error("You don't own the selected sector.");
            return;
        };

        try {
            // Update inventoryUSERS table
            const { data, error } = await supabase
                .from("inventoryUSERS")
                .update({
                    planetSector: selectedSectorId,
                    time_of_deploy: new Date().toISOString()
                })
                .eq("owner", session?.user?.id);

            if (error) {
                throw error;
            }

            // Set deployment status
            setTimeOfDeploy(new Date());
            setIsDeployed(true);
        } catch (error) {
            console.error("Error deploying rover:", error.message);
        };

        // Update this so that it can pull already deployed rovers
    };

    const calculateReward = () => {
        // Calculate the reward based on deployment time
        if (timeOfDeploy) {
            const currentTime = new Date();
            const timeDifference = currentTime.getTime() - timeOfDeploy.getTime();
            // Convert milliseconds to hours
            const hoursDeployed = timeDifference / (1000 * 60 ); // * 60 -> for one hour/item
            // For now, let's say 1 item per hour
            setReward(Math.min(Math.floor(hoursDeployed), 6));
        }
    };

    const collectReward = () => {
        // Here you can add the reward to the user's inventory
        // For now, let's just log the reward
        console.log("Collected reward:", reward);
    };

    return (
        <div>
            <h1>Collect Item from Sector</h1>
            <h2>User Sectors</h2>
            <ul>
                {userSectors.map(sector => (
                    <li key={sector.id} onClick={() => handleSectorSelect(sector.id)}>
                        {sector.id} - {sector.name} - {sector.deposit}
                    </li>
                ))}
            </ul>
            <h2>Selected Sector</h2>
            {selectedSectorId && (
                <div>
                    <p>ID: {selectedSectorId}</p>
                    {/* Display other sector details if needed */}
                </div>
            )}
            <h2>Deploy Rover</h2>
            <button onClick={deployRover}>Deploy Rover</button>
            <h2>Reward</h2>
            {isDeployed && (
                <div>
                    <p>Reward: {reward}</p>
                    <button onClick={calculateReward}>Calculate Reward</button>
                    <button onClick={collectReward}>Collect Reward</button>
                </div>
            )}
        </div>
    );
}
