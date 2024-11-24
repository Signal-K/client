"use client";

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { MiningComponentComponent } from "@/components/mining-component";

interface InventoryItem {
    id: number;
    icon_url: string;
};

export default function AllAutomatonsOnActivePlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [automatons, setAutomatons] = useState<{ id: number; iconUrl: string }[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAutomatonClick = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    useEffect(() => {
        const fetchInventoryItems = async () => {
            try {
                const response = await fetch('/api/gameplay/inventory');
                const data: InventoryItem[] = await response.json();
                setInventoryItems(data);
            } catch (error) {
                console.error("Error fetching inventory items:", error);
            }
        };

        fetchInventoryItems();
    }, []); 

    useEffect(() => {
        const fetchAutomatons = async () => {
            if (!activePlanet || !session) return;

            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from("inventory")
                    .select("id, item")
                    .eq("anomaly", activePlanet.id)
                    .eq("owner", session.user.id)
                    .eq("item", 23); 

                if (error) throw error;

                const automatonsData = data || [];
                const automatonsWithIcons = automatonsData.map((automaton: any) => {
                    const iconUrl = inventoryItems.find(item => item.id === 23)?.icon_url || '';
                    return {
                        id: automaton.id,
                        iconUrl
                    };
                });

                setAutomatons(automatonsWithIcons);
            } catch (error) {
                console.error("Error fetching automatons:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAutomatons();
    }, [activePlanet, session, supabase, inventoryItems]);

    if (loading) {
        return <div>Loading...</div>;
    };

    return (
        <div className="p-3">
            <div className="grid grid-cols-3 gap-4">
                {automatons.map((automaton) => (
                    <div key={automaton.id} className="flex flex-col items-center">
                        <img 
                            src={automaton.iconUrl} 
                            alt={`Automaton ${automaton.id}`} 
                            className="w-16 h-16 object-cover cursor-pointer" 
                            onClick={handleAutomatonClick} 
                        />
                    </div>
                ))}
            </div>

            {isModalVisible && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={handleOverlayClick}
                >
                    <div className="relative bg-white w-1/2 h-1/2 p-4 overflow-y-auto">
                        <button
                            className="absolute top-2 right-2 text-2xl font-bold"
                            onClick={closeModal}
                        >
                            &times;
                        </button>

                        <MiningComponentComponent />
                    </div>
                </div>
            )}
        </div>
    );
};