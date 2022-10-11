import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState, useRef, Fragment, createContext } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { Header, CompassIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from "@/ui/Sections/PlanetLayout";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlacedStructureSingle } from "./Structure";

import { Button } from "@/ui/ui/button";
import RoverSingle from "./Automation";

interface ActivePlanetContextValue {
    activePlanet: UserPlanetData | null;
    setActivePlanet: (planet: UserPlanetData | null) => void;
};

export interface UserStructure {
    id: string;
    item: number;
    name: string;
    icon_url: string;
    description: string;
    // Function (what is executed upon click)
};

export interface UserPlanetData {
    id: string;
    content: string;
    ticId: string;
    type: string;
    radius: number;
    mass: number;
    density: number;
    gravity: number;
    temperatureEq: number;
    temperature: number;
    smaxis: number;
    orbital_period: number;
    classification_status: string;
    avatar_url: string;
    created_at: string;
    deepnote: string;
    starSystems: number;
    Faction: number;
    lightkurve: string;
};

const ActivePlanetContext = createContext<ActivePlanetContextValue>({
    activePlanet: null,
    setActivePlanet: () => {} // Provide a default empty function
});

interface UserAutomaton {
    id: string;
};

interface UserAutomaton {
    id: string;
    item: number; // Add the 'item' property
};

// View structures
const UserPlanetPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [loading, setLoading] = useState<boolean>(true);
    const [userStructures, setUserStructures] = useState<UserStructure[]>([]);
    const [userPlanet, setUserPlanet] = useState<UserPlanetData | null>(null);
    const [roverData, setRoverData] = useState<UserAutomaton[]>([]);

    useEffect(() => {
        const fetchRoverData = async () => {
            try {
                const { data, error } = await supabase
                    .from("inventoryUSERS")
                    .select("*")
                    .eq("item", 23 || 22 || 18)
                    .eq("owner", session?.user?.id)
                    .limit(2);

                if (error) throw error;

                if (data && data.length > 0) {
                    setRoverData(data);
                }
            } catch (error: any) {
                console.error("Error fetching rover data:", error.message);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchRoverData();
        }
    }, [supabase, session]);

    if (!session) {
        return <p>Loading session...</p>;
    };

    if (loading) {
        return <p>Loading data...</p>;
    };

    return (
        <>
            {activePlanet && (<Header planetName={activePlanet.content} /> )}
            <div className="w-full">
                <div className="mx-auto max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4" style={{
                    gridTemplateAreas: `
                    "block36 block37"
                    "block51 block54"
                    "block55 block56"
                    "block57 block58"
                    `
                }}>
                    {Array.from({ length: 64 }, (_, index) => {
                        const isBlock36or37 = index + 1 === 36 || index + 1 === 37;
                        const isBlock51or54 = index + 1 === 51 || index + 1 === 54;
                        const isCombinedBlock = isBlock36or37 && index + 1 === 36;
                        const isBlock19or20or21 = index + 1 === 19 || index + 1 === 20 || index + 1 === 21;
    
                        return (
                            <div key={`block-${index}`} className={`flex items-center justify-center p-6 border border-gray-200 dark:border-gray-800 ${isCombinedBlock ? "grid-area: block36 block37" : ""}`}>
                                {isCombinedBlock && activePlanet && <UserPlanets userPlanet={activePlanet} />}
                                {/* {isBlock19or20or21 && activePlanet && userStructures.map((structure, structureIndex) => {
                                    if (structureIndex === 0) {
                                        return <PlacedStructureSingle key={structure.id} UserStructure={structure} />;
                                    }
                                })} */}
                                {isBlock51or54 && roverData.length > 0 && roverData.map((rover, roverIndex) => {
                                    if (roverIndex === 0 && roverData.length >= 2) return <p>Null</p>; // Skip rendering the first rover if there are two or more items
                                    return (
                                        <>
                                            <RoverSingle key={roverIndex} userAutomaton={rover} />
                                        </>
                                    );
                                })}
                                {!isCombinedBlock && !isBlock51or54 && null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default UserPlanetPage;

// Background image & other stats, structure-based block for more info/title tag // For now, users only have one planet
function UserPlanets({ userPlanet }: { userPlanet: UserPlanetData }) {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <button onClick={handleOpenDialog}>
                <img src={userPlanet.avatar_url} height={128} width={128} alt="User planet avatar" />
            </button>
            <p>{userPlanet.content}</p>
            <SinglePlanetDialogue open={dialogOpen} onClose={handleCloseDialog} userPlanet={userPlanet} />
        </>
    );
}; 

export function ActivePlanet() {
    const { activePlanet } = useActivePlanet();

    return (
        <>
            <div className="flex items-center gap-4">
                <Button className="rounded-full p-2" size="icon" variant="outline">
                    <CompassIcon className="h-5 w-5" />
                </Button>
                <Button className="rounded-full p-2" size="icon" variant="outline">
                    <ArrowLeftIcon className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex flex-col items-center">
                <div className="inline-block rounded-lg bg-gray-100/80 px-3 py-1 text-sm backdrop-blur-md dark:bg-gray-800/80">
                    Home
                </div>
                <h1 className="text-lg font-semibold">{activePlanet?.content}</h1>
            </div>
            <div className="flex items-center gap-4 relative">
                <Button className="rounded-full p-2" size="icon" variant="outline">
                    <ArrowRightIcon className="h-5 w-5" />
                </Button>
                <Button className="rounded-full p-2" size="icon" variant="outline">
                    <BookOpenIcon className="h-5 w-5" />
                </Button>
            </div>
        </>
    );
};

function SinglePlanetDialogue({ open, onClose, userPlanet }: { open: boolean; onClose: () => void; userPlanet: UserPlanetData; }) {
    const cancelButtonRef = useRef(null);

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><img src={userPlanet.avatar_url} height={128} width={128} alt="User planet avatar" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                {userPlanet?.content}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    You can view specific planet data here
                                                </p>
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
                                        Goto
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={onClose}
                                        ref={cancelButtonRef}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};