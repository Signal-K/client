import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";

interface InventoryEntry {
    id: number;
    item: number;
    owner: string;
    quantity: number;
    notes: string;
    parentItem: number | null;
    time_of_deploy: string;
    anomaly: string | null;
}

export default function UserItemsUndeployed() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [inventoryItems, setInventoryItems] = useState<InventoryEntry[] | null>(null);

    const fetchInventoryItems = async () => {
        try {
            if (session) {
                const { data, error } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq('owner', session?.user.id)
                    .in('item', [12, 14, 22, 24])
                    .is('anomaly', null);

                if (error) {
                    throw error;
                };

                if (data) {
                    setInventoryItems(data);
                };
            };
        } catch (error: any) {
            console.error('Error fetching inventory items:', error.message);
        };
    };

    const deployStructure = async (itemId: number) => {
        try {
            if (session && activePlanet) {
                const { data, error } = await supabase
                    .from('inventory')
                    .update({ anomaly: activePlanet.id })
                    .eq('id', itemId)
                    .single();

                if (error) {
                    throw error;
                };

                handleMissionComplete();

                if (data) {
                    setInventoryItems(prevItems => {
                        if (prevItems) {
                            return prevItems.map(item => {
                                if (item.id === itemId) {
                                    return { ...item, anomaly: activePlanet.id };
                                } else {
                                    return item;
                                }
                            });
                        } else {
                            return null;
                        }
                    });
                };
            };
        } catch (error: any) {
            console.error('Error deploying structure:', error.message);
        };
    };

    const handleMissionComplete = async () => {
        try {
            const missionData = {
                user: session?.user?.id,
                time_of_completion: new Date().toISOString(),
                mission: 4,
                configuration: null,
                rewarded_items: [23],
            };

            const { data: newMission, error: newMissionError } = await supabase
                .from("missions")
                .insert([missionData]);

            if (newMissionError) {
                throw newMissionError;
            };
        } catch (error: any) {
            console.error("Error handling mission completion:", error.message);
        };
    };

    useEffect(() => {
        fetchInventoryItems();
    }, [session]);

    return (
        <div className="p-5">
            <h2 className="text-2xl font-semibold mb-4">Undeployed Structures</h2>
            <div className="grid grid-cols-4 gap-4">
                {inventoryItems?.map((item) => (
                    <div key={item.id} className="border p-2">
                        {/* <img src={`https://raw.githubusercontent.com/Signal-K/client/initialClassification/public/assets/Inventory/Structures/Telescope2.png`} alt="Item icon" className="w-16 h-16" /> */}
                        <p>{item.id}</p>
                        <p>{item.item}</p>
                        <p>{item.quantity}</p>
                        <p>{item.anomaly}</p>
                        <button onClick={() => deployStructure(item.id)}>Deploy</button>
                    </div>
                ))}
            </div>
        </div>
    );
};