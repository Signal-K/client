"use client";
// Structures relating to terrestrial-based aero studies (anything to do with space/"observatoring" (yes, made up word), but fetching terrestrial data)

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { CreateCloudClassification } from "@/Classifications/ClassificationForm";

interface UserStructure {
    id: number;
    item: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
};

interface OwnedItem { 
    id: string;
    item: string;
    quantity: number;
    notes?: string;
    anomaly: number;
};

interface MeteorologyToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
};

export function MeteorologyToolModalPlaceable() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [userStructures, setUserStructures] = useState<{ ownedItem: OwnedItem; structure: UserStructure }[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchData() {
        if (!session || !activePlanet) return;

        setLoading(true);

        try {
            const { data: ownedItemsData, error: ownedItemsError } = await supabase
                .from("inventory")
                .select("id, item, quantity, notes, anomaly")
                .eq("anomaly", activePlanet.id)
                .eq("item", 26)
                .eq("owner", session.user.id);

            if (ownedItemsError) throw ownedItemsError;

            if (ownedItemsData && ownedItemsData.length > 0) {
                const ownedItem = ownedItemsData[0];

                const { data: structureData, error: structureError } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("id", ownedItem.item)
                    .limit(1);

                if (structureError) throw structureError;

                if (structureData && structureData.length > 0) {
                    const structure = structureData[0];
                    setUserStructures([{ ownedItem, structure }]);
                    console.log(ownedItem)
                    console.log(structure)
                }
            }
        } catch (error: any) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [session, activePlanet]);

    return (
        <>
            {userStructures.length > 0 && (
                <MeteorologyToolModal 
                    isOpen={true} 
                    onClose={() => setUserStructures([])} 
                    ownedItem={userStructures[0].ownedItem} 
                    structure={userStructures[0].structure} 
                />
            )}
        </>
    );
}

export const MeteorologyToolModal: React.FC<MeteorologyToolModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const { activePlanet } = useActivePlanet();
    const [isActionDone, setIsActionDone] = useState(false);

    if (!isOpen) return null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/citiCloud/${activePlanet?.id}/cloud.png`;

    return (
        <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{structure.name}</h2>
                <button className="btn btn-square btn-outline" onClick={onClose}>
                    ✕
                </button>
            </div>
            <div className="flex flex-col items-center mt-4">
                <img src={structure.icon_url} alt={structure.name} className="w-32 h-32 mb-2" />
                <p>ID: {ownedItem.id}</p>
                <p>{ownedItem.notes}</p>
                <p>Description: {structure.description}</p>
                <div className="mt-4">
                    <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} />
                    <CreateCloudClassification assetMentioned={imageUrl} />
                    {isActionDone && <p className="mt-2 text-green-500">Action Completed</p>}
                </div>
            </div>
        </div>
    );
};
