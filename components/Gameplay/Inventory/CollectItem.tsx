import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ViewRovers } from "../Automations/BuildRover";

export default function CollectItemFromSector() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const user = session?.user?.id;

    const [userSectors, setUserSectors] = useState<any[]>([]);
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [deployedRover, setDeployedRover] = useState<any>(null);
    const [reward, setReward] = useState<number>(0);

    useEffect(() => {
        if (user) {
            fetchUserSectors(user);
            checkDeployedRover(user);
            const storedDeployedRover = localStorage.getItem("deployedRover");
            if (storedDeployedRover) {
                setDeployedRover(JSON.parse(storedDeployedRover));
            }
        }
    }, [session]);

    useEffect(() => {
        if (deployedRover) {
            localStorage.setItem("deployedRover", JSON.stringify(deployedRover));
        } else {
            localStorage.removeItem("deployedRover");
        }
    }, [deployedRover]);

    const fetchUserSectors = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("basePlanetSectors")
                .select("*")
                .eq("owner", userId);
    
            if (error) {
                throw error;
            }
    
            if (data) {
                setUserSectors(data);
            }
        } catch (error) {
            console.error("Error fetching user sectors:", error);
        }
    };
    
    const checkDeployedRover = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("inventoryUSERS")
                .select("*")
                .eq("owner", userId);
    
            if (error) {
                throw error;
            }
    
            if (data && data.length > 0) {
                setDeployedRover(data[0]); // Assuming only one rover is deployed at a time
            }
        } catch (error) {
            console.error("Error checking deployed rover:", error);
        }
    };
    
    const handleSectorSelect = (sectorId: string) => {
        setSelectedSectorId(sectorId);
    };

    const calculateReward = () => {
        if (deployedRover && deployedRover.time_of_deploy) {
            const currentTime = new Date();
            const timeDifference = currentTime.getTime() - new Date(deployedRover.time_of_deploy).getTime();
            const secondsDeployed = Math.floor(timeDifference / 1000); // Convert milliseconds to seconds
    
            // Calculate reward every 10 seconds, with a maximum of 20 items
            const rewardItems = 1; // Math.min(Math.floor(secondsDeployed / 10), 20);
            setReward(rewardItems);
        }
    };
    
    const deployRover = async () => {
        if (!selectedSectorId) {
            console.error("Please select a sector before deploying a rover.");
            return;
        }
    
        try {
            // Retrieve the user's items
            const { data: userData, error: userError } = await supabase
                .from("inventoryUSERS")
                .select("*")
                .eq("owner", session?.user?.id);
    
            if (userError) {
                throw userError;
            }
    
            // Find the rover with notes "first rover created by user"
            const roverToDeploy = userData.find(item => item.notes === "first rover created by user");
    
            if (!roverToDeploy) {
                console.error("No rover available for deployment.");
                return;
            }
    
            // Update the rover's planetSector and time_of_deploy
            const { error } = await supabase
                .from("inventoryUSERS")
                .update({
                    planetSector: selectedSectorId,
                    time_of_deploy: new Date().toISOString()
                })
                .eq("owner", session?.user?.id)
                .eq("id", roverToDeploy.id);
    
            if (error) {
                throw error;
            }
    
            setDeployedRover({
                ...roverToDeploy,
                planetSector: selectedSectorId,
                time_of_deploy: new Date().toISOString()
            });
    
            console.log("Rover deployed successfully.");
        } catch (error) {
            console.error("Error deploying rover:", error);
        }
    };    
    
    const collectReward = async () => {
        try {
            // Check if there is a deployed rover
            if (deployedRover && deployedRover.time_of_deploy) {
                // Fetch the sector data to determine the reward item
                const sectorData = await supabase
                    .from("basePlanetSectors")
                    .select("deposit")
                    .eq("id", deployedRover.planetSector)
                    .single();
    
                if (sectorData.error) {
                    throw sectorData.error;
                }
    
                const deposit = sectorData.data?.deposit;
    
                // Calculate the reward based on the deposit value
                const rewardItemId = deposit ? deposit : 0;
    
                // Calculate the reward based on the time deployed
                const currentTime = new Date();
                const timeDifference = currentTime.getTime() - new Date(deployedRover.time_of_deploy).getTime();
                const hoursDeployed = Math.min(Math.floor(timeDifference / (1000 * 60 * 60)), 6); // Cap at 6 hours
    
                // Create a new entry in inventoryUSERS for the reward item
                const { data: rewardData, error: rewardError } = await supabase
                    .from("inventoryUSERS")
                    .insert([
                        {
                            owner: session?.user?.id,
                            item: rewardItemId,
                            quantity: hoursDeployed,
                            notes: `Reward collected from rover/automaton ${deployedRover.id}`
                        }
                    ]);
    
                if (rewardError) {
                    throw rewardError;
                }
    
                // Clear the timestamp value for the deployed rover
                const { error } = await supabase
                    .from("inventoryUSERS")
                    .update({
                        time_of_deploy: null
                    })
                    .eq("id", deployedRover.id);
    
                if (error) {
                    throw error;
                }
    
                setDeployedRover(null);
                console.log("Rewards collected successfully.");
            } else {
                console.error("No rewards to collect.");
            }
        } catch (error) {
            console.error("Error collecting rewards:", error);
        }
    };
    
    return (
        <div>
            <h1>Collect Item from Sector</h1>
            <div style={{ border: "1px solid black", padding: "10px", marginBottom: "20px" }}>
                <h2>User Sectors</h2>
                <ul>
                    {userSectors.map(sector => (
                        <li key={sector.id} onClick={() => handleSectorSelect(sector.id)}>
                            Sector name: {sector.id} - {sector.name} - {sector.deposit}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ border: "1px solid black", padding: "10px", marginBottom: "20px" }}>
                <h2>Selected Sector</h2>
                {selectedSectorId && (
                    <div>
                        <p>ID: {selectedSectorId}</p>
                    </div>
                )}
            </div>
            <div style={{ border: "1px solid black", padding: "10px", marginBottom: "20px" }}>
                <h2>Deploy Rover</h2>
                <button style={{ padding: "10px", marginRight: "10px" }} onClick={deployRover}>Deploy Rover</button>
            </div>
            {/* Reward section */}
            {deployedRover && deployedRover.time_of_deploy && (
                <div style={{ border: "1px solid black", padding: "10px", marginBottom: "20px" }}>
                    <h2>Reward</h2>
                    <div>
                        <p>Reward: {reward}</p>
                        <button style={{ padding: "10px", marginRight: "10px" }} onClick={calculateReward}>Calculate Reward</button>
                        <button style={{ padding: "10px" }} onClick={collectReward}>Collect Reward</button>
                    </div>
                </div>
            )}
            <h2>Deployed Rovers</h2>
            <ViewRovers />
        </div>
    );    
}