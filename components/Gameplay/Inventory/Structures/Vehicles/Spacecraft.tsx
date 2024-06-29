"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { CreateStructureWithItemRequirementinfo } from "../Structure";
import CraftStructure from "../../Actions/CraftStructure";
import LaunchpadButton from "./Launchpad";
import GoToYourPlanet from "@/components/Gameplay/Travel/InitTravel";

interface SpacecraftModalProps {
    isOpen: boolean;
    onClose: () => void;
};

export const SpaceceraftModal: React.FC<SpacecraftModalProps> = ({ isOpen, onClose }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [userSpaceship, setUserSpaceship] = useState();

    async function fetchSpacecraft() {
        if (session && activePlanet) {
            try {
                const { data, error } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("owner", session.user.id)
                    .eq("anomaly", activePlanet.id)
                    .eq("item", 29)

                if (data) {
                    setUserSpaceship(data[0]);
                };

                fetchLaunchpad();
            } catch (error: any) {
                console.error("Error fetching user spacecraft: ", error.message);
            };
        };
    };

    const [hasLaunchpad, setHasLaunchpad] = useState(false);
    const [launchpad, setLaunchpad] = useState();

    async function fetchLaunchpad() { // typically the launchpad should craft the spaceship, but since the user already starts with a spaceship....hmm
        if (session && activePlanet) {
            try {
                const { data, error } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("owner", session.user.id)
                    .eq("anomaly", activePlanet.id)
                    .eq("item", 33)

                if (data) {
                    setLaunchpad(data[0]);
                    setHasLaunchpad(true);
                }
            } catch (error: any) {
                console.error("Error fetching user spacecraft: ", error.message);
            };
        };
    };

    useEffect(() => {
        fetchSpacecraft();
    }, [session, activePlanet]);
    
    return (
        isOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-4 w-full max-w-lg mx-auto shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Spacecraft</h2>
                        <button className="btn btn-square btn-outline" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                        <p></p>
                        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto mt-4">
                            <div>
                            <GoToYourPlanet planetId={activePlanet ? parseInt(activePlanet.id) : 0} />
                            </div>
                            {/* {hasLaunchpad ? (
                                <>
                                    <LaunchpadButton />
                                    <GoToYourPlanet planetId={activePlanet ? parseInt(activePlanet.id) : 0} />
                                </>
                            ) : (
                                <CraftStructure structureId={33} />
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

const SpacecraftButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div>
            <button onClick={handleOpen} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                <span>Spacecraft</span>
            </button>
            <SpaceceraftModal isOpen={isOpen} onClose={handleClose} />
        </div>
    );
};

export default SpacecraftButton;