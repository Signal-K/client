import { Dialog, Transition } from '@headlessui/react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

// For the control panel
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { RoverImageNoHandle } from '@/Classifications/RoverContent';
import { useActivePlanet } from '@/context/ActivePlanet';

interface RoverSingleProps {
    userAutomaton: UserAutomaton;
};

export interface UserAutomaton {
    id: string;
    item: number;
};

const RoverSingle: React.FC<RoverSingleProps> = ({ userAutomaton }) => {
    const [roverInfo, setRoverInfo] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
        const fetchRoverInfo = async () => {
            try {
                const response = await fetch(`/api/gameplay/inventory?item=${userAutomaton.item}`);
                if (!response.ok) {
                    throw new Error(`Error fetching rover info: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setRoverInfo(data);
            } catch (error: any) {
                console.error("Error fetching rover info:", error.message);
            }
        };

        fetchRoverInfo();
    }, [userAutomaton.item]);

    if (!roverInfo) {
        return <p>Loading rover info...</p>;
    }

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <button onClick={handleOpenDialog}>
                <img src={roverInfo.icon_url} alt={roverInfo.name} className="w-32 h-32 mb-2" />
                <p className="text-center">Type: {roverInfo.id}</p>
            </button>
            <SingleAutomatonDialogue
                open={dialogOpen}
                onClose={handleCloseDialog}
                userAutomaton={userAutomaton}
                roverInfo={roverInfo}
            />
        </div>
    );
};

export default RoverSingle;

export function AllAutomatons () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [userAutomatons, setUserAutomatons] = useState<any[]>([]);

    const fetchAllUserRovers = async () => {
        try {
            const { data, error } = await supabase
                .from("inventory")
                .select("id, item, notes, time_of_deploy, basePlanet, planetSector, owner")
                .eq("owner", session?.user?.id)
                .eq("item", 23)
                .eq("basePlanet", activePlanet?.id);

            if (data) {
                setUserAutomatons(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAllUserRovers();
    }, [session, supabase, activePlanet]);

    return (
        <>{userAutomatons}</>
    );
};

function SingleAutomatonDialogue({ open, onClose, userAutomaton, roverInfo }: { open: boolean; onClose: () => void; userAutomaton: UserAutomaton; roverInfo: any; }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const cancelButtonRef = useRef(null);
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [deployedRover, setDeployedRover] = useState<any>(null);
    const [reward, setReward] = useState<number>(0);
    const [userSectors, setUserSectors] = useState<any[]>([]);

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
                .from("inventory")
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

                // Create a new entry in inventory for the reward item
                const { data: rewardData, error: rewardError } = await supabase
                    .from("inventory")
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
                    .from("inventory")
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

    if (!deployedRover) { // This should actually be if the rover is deployed, however as we're having issues with managing the state...
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
                                        </div>
                                    </div>
                                    {/* <AutomatonControlPanel /> */}
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