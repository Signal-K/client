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
    const [roverInfo, setRoverInfo] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const cancelButtonRef = useRef(null);

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
            <SingleAutomatonDialogue open={dialogOpen} onClose={handleCloseDialog} /* userAutomaton={roverInfo} */ />
        </div>
    );
};

export default RoverSingle;

// function SingleAutomatonDialogue({ open, onClose, userAutomaton }: { open: boolean; onClose: () => void; userAutomaton?: UserAutomaton; }) {
function SingleAutomatonDialogue({ open, onClose }: { open: boolean; onClose: () => void; }) {
    const cancelButtonRef = useRef(null);

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
                                        <img src="avatar_url" height={64} width={64} alt="User planet avatar" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            {/* {userAutomaton?.id} */} Automaton ID
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
                    </div>
                </Transition.Child>
            </div>
        </Dialog>
    </Transition.Root>
    );
};