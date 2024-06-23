"use client";

import React, { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface TravelBuddyProps {
    isOpen: boolean;
    onClose: () => void;
}

const TravelBuddy: React.FC<TravelBuddyProps> = ({ isOpen, onClose }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    return (
        isOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-4 w-full max-w-lg mx-auto shadow-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Travel buddy</h2>
                        <button className="btn btn-square btn-outline" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                        <p></p>
                        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-lg max-w-4xl mx-auto mt-4">
                            <div>
                                You can now visit other planets
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

const TravelBuddyButton: React.FC = () => {
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
                <span>🚀</span>
                <span>Things to do</span>
            </button>
            <TravelBuddy isOpen={isOpen} onClose={handleClose} />
        </div>
    );
};

export default TravelBuddyButton;
