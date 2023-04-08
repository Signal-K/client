"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface launchpadModalProps {
    isOpen: boolean;
    onClose: () => void;
};

const LaunchpadModal: React.FC<launchpadModalProps> = ({ isOpen, onClose }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [userLaunchpad, setUserLaunchpad] = useState();

    async function fetchLaunchpad() {
        if (session && activePlanet) {
            try {
                const { data, error } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("owner", session.user.id)
                    .eq("anomaly", activePlanet.id)
                    .eq("item", 33)

                if (data) {
                    setUserLaunchpad(data[0]);
                }
            } catch (error: any) {
                console.error("Error fetching user launchpad: ", error.message);
            };
        };
    };

    useEffect(() => {
        fetchLaunchpad();
    }, [session, activePlanet]);
    
    return (
        isOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-4 w-full max-w-lg mx-auto shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Launchpad</h2>
                        <button className="btn btn-square btn-outline" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                        <p></p>
                        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto mt-4">
                            <div>
                                You can now refuel and launch spacecraft from here!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

const LaunchpadButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <div>
            <button onClick={openModal}>Launchpad</button>
            <LaunchpadModal isOpen={isOpen} onClose={closeModal} />
        </div>
    );
};

export default LaunchpadButton;