import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import React, { useEffect, useState } from "react"
import { ViewRovers } from "../Automatons/BuildRover";

export default function CollectItemFromSector() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userSectors, setUserSectors] = useState<any[]>([]);
    const [selectedSector, setSelectedSector] = useState<any>(null);
    const [selectedRover, setSelectedRover] = useState<any>(null);
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

    const handleSectorSelect = (sector: any) => {
        setSelectedSector(sector);
    };

    const handleRoverSelect = (rover: any) => {
        setSelectedRover(rover);
    };

    const deployRover = () => {
        // Set the time of deployment to the current time
        setTimeOfDeploy(new Date());
        setIsDeployed(true);
    };

    const calculateReward = () => {
        // Calculate the time difference between the current time and the time of deployment
        if (timeOfDeploy) {
            const currentTime = new Date();
            const timeDifference = currentTime.getTime() - timeOfDeploy.getTime();
            // Convert milliseconds to hours
            const hoursDeployed = timeDifference / (1000 * 60 * 60);
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
                    <li key={sector.id} onClick={() => handleSectorSelect(sector)}>
                        {sector.id} - {sector.name} - {sector.deposit}
                    </li>
                ))}
            </ul>
            <h2>Selected Sector</h2>
            {selectedSector && (
                <div>
                    <p>ID: {selectedSector.id}</p>
                    <p>Name: {selectedSector.name}</p>
                    <p>Deposit: {selectedSector.deposit}</p>
                </div>
            )}
            <h2>Deploy Rover</h2>
            <ViewRovers onRoverSelect={handleRoverSelect} />
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