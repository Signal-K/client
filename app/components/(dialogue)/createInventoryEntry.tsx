"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface InventoryEntryProps {
    item: number;
};

const CreateInventoryEntry: React.FC<InventoryEntryProps> = ({ item }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleCreateEntry = async () => {
        if (!session?.user || !activePlanet?.id) {
            setError("User or planet information is missing.");
            return;
        };

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { data, error: insertError } = await supabase
                .from("inventory")
                .insert({
                    owner: session.user.id,
                    anomaly: activePlanet.id,
                    item,
                });

            if (insertError) {
                throw insertError;
            };

            setSuccess(true);
        } catch (insertError: any) {
            setError(insertError.message);
        } finally {
            setIsLoading(false);
        };
    };

    return (
        <div className="p-4 rounded-md bg-gray-800 text-white">
            <h2 className="text-xl mb-4">Create Inventory Entry</h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">Inventory entry created successfully!</div>}

            <button
                onClick={handleCreateEntry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                disabled={isLoading}
            >
                {isLoading ? "Creating..." : "Create Entry"}
            </button>
        </div>
    );
};

export default CreateInventoryEntry;