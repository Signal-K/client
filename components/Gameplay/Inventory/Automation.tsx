import { Dialog, Transition } from '@headlessui/react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

interface RoverSingleProps {
    userAutomaton: UserAutomaton;
}

export interface UserAutomaton {
    id: string;
    item: number;
}

const RoverSingle: React.FC<RoverSingleProps> = ({ userAutomaton }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [roverInfo, setRoverInfo] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const cancelButtonRef = useRef(null);
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [deployedRover, setDeployedRover] = useState<any>(null);
    const [reward, setReward] = useState<number>(0);
    const [userSectors, setUserSectors] = useState<any[]>([]);

    useEffect(() => {
        const fetchRoverInfo = async () => {
            try {
                const { data, error } = await supabase
                    .from("inventoryITEMS")
                    .select("icon_url, name")
                    .eq("id", userAutomaton.item)
                    .single();

                if (error) throw error;

                if (data) {
                    setRoverInfo(data);
                }
            } catch (error: any) {
                console.error("Error fetching rover info:", error.message);
            }
        };

        fetchRoverInfo();
    }, [supabase, userAutomaton.item]);

    if (!roverInfo) {
        return <p>Loading rover info...</p>;
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <button onClick={handleOpenDialog}>
                <img src={roverInfo.icon_url} alt="Rover" className="w-8 h-8 mb-2" />
                <p className="text-center">Type: {roverInfo.name}</p>
            </button>
            <SingleAutomatonDialogue
                open={dialogOpen}
                onClose={handleCloseDialog}
                userAutomaton={userAutomaton}
                roverInfo={roverInfo}
                deployedRover={deployedRover}
                setDeployedRover={setDeployedRover}
                reward={reward}
                setReward={setReward}
                selectedSectorId={selectedSectorId}
                setSelectedSectorId={setSelectedSectorId}
                userSectors={userSectors}
            />
        </div>
    );
};

export default RoverSingle;

function SingleAutomatonDialogue({ open, onClose, userAutomaton, roverInfo, deployedRover, setDeployedRover, reward, setReward, selectedSectorId, setSelectedSectorId, userSectors }: { open: boolean; onClose: () => void; userAutomaton: UserAutomaton; roverInfo: any; deployedRover: any; setDeployedRover: React.Dispatch<any>; reward: number; setReward: React.Dispatch<number>; selectedSectorId: string; setSelectedSectorId: React.Dispatch<string>; userSectors: any[]; }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const cancelButtonRef = useRef(null);

    const handleSectorSelect = (sectorId: string) => {
        setSelectedSectorId(sectorId);
    };

    const deployRover = async () => {
        if (!selectedSectorId) {
            console.error("Please select a sector before deploying a rover.");
            return;
        }

        try {
            // Check if there is already a deployed rover
            if (deployedRover) {
                console.error("Rover already deployed.");
                return;
            }

            // Deploy the rover
            const { data, error } = await supabase
                .from("inventoryUSERS")
                .update({
                    planetSector: selectedSectorId,
                    time_of_deploy: new Date().toISOString()
                })
                .eq("owner", session?.user?.id)
                .eq("id", userAutomaton.id);

            if (error) {
                throw error;
            }

            if (data) {
                setDeployedRover({
                    id: userAutomaton.id,
                    planetSector: selectedSectorId,
                    time_of_deploy: new Date().toISOString()
                });

                console.log("Rover deployed successfully.");
            }
        } catch (error) {
            console.error("Error deploying rover:", error);
        }
    };

    const collectReward = async () => {
        try {
            // Check if there is a deployed rover and reward hasn't been claimed yet
            if (deployedRover && deployedRover.time_of_deploy) {
                // Calculate reward
                const reward = 1; // Fixed reward of 1 item

                // Create a new entry in inventoryUSERS for the reward item
                const { data: rewardData, error: rewardError } = await supabase
                    .from("inventoryUSERS")
                    .insert([
                        {
                            owner: session?.user?.id,
                            item: userAutomaton.item,
                            quantity: reward,
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

                // Update deployedRover state and reward state
                setDeployedRover(null);
                setReward(reward);

                console.log("Reward collected successfully.");
            } else {
                console.error("No rewards to collect.");
            }
        } catch (error) {
            console.error("Error collecting rewards:", error);
        }
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" initialFocus={cancelButtonRef} onClose={onClose}>
                <div className="flex items-center justify-center min-h-screen">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                    </Transition.Child>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="relative max-w-lg w-full bg-white rounded-lg shadow-lg">
                            <Dialog.Panel className="p-4">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <img src={roverInfo.icon_url} height={64} width={64} alt="Rover" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                Automaton ID: {userAutomaton.id}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <div>
                                                    <h2>Select Sector</h2>
                                                    <ul>
                                                        {userSectors.map(sector => (
                                                            <li key={sector.id} onClick={() => handleSectorSelect(sector.id)}>
                                                                Sector name: {sector.id} - {sector.name} - {sector.deposit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {selectedSectorId && (
                                                    <div>
                                                        <h2>Selected Sector</h2>
                                                        <p>ID: {selectedSectorId}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <button style={{ padding: "10px", marginRight: "10px" }} onClick={deployRover}>Deploy Rover</button>
                                                </div>
                                                {deployedRover && deployedRover.time_of_deploy && (
                                                    <div>
                                                        <h2>Reward</h2>
                                                        <p>Reward: {reward}</p>
                                                        <button style={{ padding: "10px" }} onClick={collectReward}>Collect Reward</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export function AutomatonControlPanel() {
    return (
        <div className="mockup-window border border-base-300">
            <div className="grid grid-cols-3 gap-4">
                {/* First Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        title="Atmospheric Pressure"
                        value="847kPa"
                        description="838-874"
                    />
                </div>
                {/* Duplicate First Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        title="Atmospheric Pressure"
                        value="847kPa"
                        description="838-874"
                    />
                </div>
                {/* Duplicate First Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        title="Atmospheric Pressure"
                        value="847kPa"
                        description="838-874"
                    />
                </div>

                {/* Second Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
                        title="Battery cell status"
                        value="85%"
                        description="↗︎ 10% drain/minute"
                    />
                </div>
                {/* Duplicate Second Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
                        title="Battery cell status"
                        value="85%"
                        description="↗︎ 10% drain/minute"
                    />
                </div>
                {/* Duplicate Second Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>}
                        title="Battery cell status"
                        value="85%"
                        description="↗︎ 10% drain/minute"
                    />
                </div>

                {/* Third Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>}
                        title="Temperature"
                        value="145K"
                        description="↘︎ 139-198 (14%)"
                    />
                </div>
                {/* Duplicate Third Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>}
                        title="Temperature"
                        value="145K"
                        description="↘︎ 139-198 (14%)"
                    />
                </div>
                {/* Duplicate Third Column */}
                <div className="stats shadow">
                    <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>}
                        title="Temperature"
                        value="145K"
                        description="↘︎ 139-198 (14%)"
                    />
                </div>
            </div>
        </div>
    );
}


// Stat component for rendering individual statistics
interface StatProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
}

const StatItem: React.FC<StatProps> = ({ icon, title, value, description }) => (
    <div className="stat">
        <div className="stat-figure text-secondary">{icon}</div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-desc">{description}</div>
    </div>
);

// export function AutomatonControlPanel() { // Should/will actually go into `SingleAutomatonDialogue` component but just creating a separate component for testing
//     return (
//         <div className="mockup-window border border-base-300">
//             <div className="stats shadow">
//                 <div className="stat">
//                     <div className="stat-figure text-secondary">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//                     </div>
//                     <div className="stat-title">Atmospheric Pressure</div>
//                     <div className="stat-value">847kPa</div>
//                     <div className="stat-desc">838-874</div> {/* Range */}
//                 </div>
//                 <div className="stat">
//                     <div className="stat-figure text-secondary">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
//                     </div>
//                     <div className="stat-title">Battery cell status</div>
//                     <div className="stat-value">85%</div>
//                     <div className="stat-desc">↗︎ 10% drain/minute</div>
//                 </div>
//                 <div className="stat">
//                     <div className="stat-figure text-secondary">
//                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
//                     </div>
//                     <div className="stat-title">Temperature</div>
//                     <div className="stat-value">145K</div>
//                     <div className="stat-desc">↘︎ 139-198 (14%)</div> {/* Range */}
//                 </div>
//             </div>
//         </div>
//     );
// };