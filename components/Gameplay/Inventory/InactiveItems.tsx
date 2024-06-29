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
    const [refresh, setRefresh] = useState(false); // State to trigger re-render

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
                    setRefresh(!refresh); // Toggle the refresh state to trigger re-render
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
    }, [session, refresh]);

    return (
        <div className="p-5">
            <h2 className="text-2xl font-semibold mb-4">Undeployed Structures</h2>
            <div className="grid grid-cols-4 gap-4">
                {inventoryItems?.map((item) => (
                    <div key={item.id} className="p-2">
                        <img src={`https://cdn.cloud.scenario.com/assets-transform/asset_3yHn7dAKpw3cSQmccrenG7N6?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfM3lIbjdkQUtwdzNjU1FtY2NyZW5HN042PyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MjAzOTY3OTl9fX1dfQ__&Key-Pair-Id=K36FIAB9LE2OLR&Signature=ujTSqdkLvrgV8Jy-OjjT5W57hBYHVVuMFlQVF0bY-w~OU1MOMIwaEsm5yd2uK~0plCSGTW6Oj29fvlBxDuZoKt0qqWgvvJvMt8wKpTn7AjR0KSg6Jaf~xFaxsCxZ57so~lKwGziqy~UQkwvcIz61cmnyajcrSv~5kyfsu4CNOuf5J2HHrx67HanLGuwIlSx1xe52LQlQD3QHcFdQdEfYfSh8sXvRTGgu6lwkEnryUIKgXEjNg~~aKr9SRi15XhX1-UjBmQQqD-gxq2QrVd0BVCYHs-aUBCb0F2-ypbzbbB7vEAUQ4HPSmxXQOfNKC9Ky46pHLjRePH3ON5GiCLXAxg__&quality=80`} alt="Item icon" className="w-16 h-16" />
                        {/* <p>{item.id}</p>
                        <p>{item.item}</p>
                        <p>{item.quantity}</p>
                        <p>{item.anomaly}</p> */}
                        <button 
                            onClick={() => deployStructure(item.id)} 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-200 py-2"
                        >
                            Deploy
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};