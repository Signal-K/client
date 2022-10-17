import { Dialog, Transition } from '@headlessui/react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

// For the control panel
import { Button } from "@/ui/ui/button";
import { ScrollArea } from "@/ui/scroll-area";

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
                                <AutomatonControlPanel />
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

export function AutomatonControlPanel() {
    // Show sector the rover is deployed on
    return (
        <div className="mockup-window border border-base-300">
            <div className="grid grid-cols-3 gap-4">
                {/* First Column */}
                <div className="stats shadow">
                    <StatItem // Compass item goes here
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


export function RoverControlPanel() {
    return (
      <div className="bg-[#333333] text-white p-8 flex flex-col md:flex-row md:space-x-8 rounded-lg max-w-screen-xl mx-auto">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">End Operation</h1>
            <Button className="text-white" variant="ghost">
              ...
            </Button>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Mars 2020 Perseverance Rover</h2>
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">Time</h3>
                <p>Sunrise: 6:05 am</p>
                <p>Sunset: 9:37 pm</p>
              </div>
              <div>
                <h3 className="font-semibold">Pressure</h3>
                <p>16.12</p>
              </div>
              <div>
                <h3 className="font-semibold">Oxygen</h3>
                <p>0.027 %</p>
              </div>
              <div>
                <h3 className="font-semibold">Temperature</h3>
                <p>-35°C</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">ROVER STATUS</h3>
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">Battery</h4>
                <div className="flex">
                  <BatteryFullIcon className="w-5 h-5" />
                  <BatteryFullIcon className="w-5 h-5" />
                  <BatteryFullIcon className="w-5 h-5" />
                  <BatteryFullIcon className="w-5 h-5" />
                  <BatteryFullIcon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Trunk</h4>
                <div className="flex">
                  <CircleIcon className="w-5 h-5" />
                  <CircleIcon className="w-5 h-5" />
                  <CircleIcon className="w-5 h-5" />
                  <CircleIcon className="w-5 h-5" />
                  <CircleIcon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Delay</h4>
                <p>40 min</p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Cameras</h3>
            <p>All Report Online</p>
          </div>
          <div className="flex justify-center">
            <CurvedlineChart className="w-[200px] h-[200px]" />
          </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <img
              alt="Rover Image"
              className="rounded-lg"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
            <img
              alt="Rover Image"
              className="rounded-lg"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
            <img
              alt="Rover Image"
              className="rounded-lg"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
            <img
              alt="Rover Image"
              className="rounded-lg"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
            <img
              alt="Rover Image"
              className="rounded-lg"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
            <img
              alt="Rover Image"
              className="rounded-lg"
              height="100"
              src="/placeholder.svg"
              style={{
                aspectRatio: "100/100",
                objectFit: "cover",
              }}
              width="100"
            />
          </div>
          <div className="bg-[#222222] p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Results</h3>
            <ScrollArea className="space-y-2 h-48">
              <p>
                <CheckIcon className="w-4 h-4" /> Sample taken
              </p>
              <p>
                <XIcon className="w-4 h-4" /> Error in Cam 7
              </p>
              <p>
                <CheckIcon className="w-4 h-4" /> Cam 7 selfixed
              </p>
              <p>
                <CheckIcon className="w-4 h-4" /> Picture taken
              </p>
              <p>
                <CheckIcon className="w-4 h-4" /> Sample taken
              </p>
              <p>
                <CheckIcon className="w-4 h-4" /> Rover moved
              </p>
            </ScrollArea>
            <Button className="mt-4" variant="outline">
              Download All
            </Button>
          </div>
          <div className="flex justify-center">
            <CurvedlineChart className="w-[200px] h-[200px]" />
          </div>
        </div>
      </div>
    )
  }
  
  function BatteryFullIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
        <line x1="22" x2="22" y1="11" y2="13" />
        <line x1="6" x2="6" y1="11" y2="13" />
        <line x1="10" x2="10" y1="11" y2="13" />
        <line x1="14" x2="14" y1="11" y2="13" />
      </svg>
    )
  }
  
  
  function CheckIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }
  
  
  function CircleIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
  }
  
  
  function CurvedlineChart(props: any) {
    return (
      <div {...props}>
        {/* <ResponsiveLine
          data={[
            {
              id: "Desktop",
              data: [
                { x: "Jan", y: 43 },
                { x: "Feb", y: 137 },
                { x: "Mar", y: 61 },
                { x: "Apr", y: 145 },
                { x: "May", y: 26 },
                { x: "Jun", y: 154 },
              ],
            },
            {
              id: "Mobile",
              data: [
                { x: "Jan", y: 60 },
                { x: "Feb", y: 48 },
                { x: "Mar", y: 177 },
                { x: "Apr", y: 78 },
                { x: "May", y: 96 },
                { x: "Jun", y: 204 },
              ],
            },
          ]}
          margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
          xScale={{
            type: "point",
          }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 16,
          }}
          axisLeft={{
            tickSize: 0,
            tickValues: 5,
            tickPadding: 16,
          }}
          colors={["#2563eb", "#e11d48"]}
          pointSize={6}
          useMesh={true}
          gridYValues={6}
          theme={{
            tooltip: {
              chip: {
                borderRadius: "9999px",
              },
              container: {
                fontSize: "12px",
                textTransform: "capitalize",
                borderRadius: "6px",
              },
            },
            grid: {
              line: {
                stroke: "#f3f4f6",
              },
            },
          }}
          role="application"
        /> */}
      </div>
    )
  }
  
  
  function XIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    )
  }
  