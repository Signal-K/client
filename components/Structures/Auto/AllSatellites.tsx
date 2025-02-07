"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface InventoryItem {
    id: number;
    icon_url: string;
};

export default function AllSatellitesOnActivePlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [satellites, setSatellites] = useState<{ id: number; iconUrl: string }[]>([]);
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
        };
    };

    useEffect(() => {
        const fetchInventoryItems = async () => {
            try {
                const response = await fetch('/api/gameplay/inventory');
                const data: InventoryItem[] = await response.json();
                setInventoryItems(data);
            } catch (error) {
                console.error("Error fetching inventory items:", error);
            };
        };

        fetchInventoryItems();
    }, []); 

    useEffect(() => {
        const fetchSatellites = async () => {
            if (!activePlanet || !session) return;

            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from("inventory")
                    .select("id, item")
                    .eq("anomaly", activePlanet.id)
                    .eq("owner", session.user.id)
                    .eq("item", 24); 

                if (error) throw error;

                const automatonsData = data || [];
                const satellitesWithIcons = automatonsData.map((automaton: any) => {
                    const iconUrl = inventoryItems.find(item => item.id === 24)?.icon_url || '';
                    return {
                        id: automaton.id,
                        iconUrl
                    };
                });

                setSatellites(satellitesWithIcons);
            } catch (error) {
                console.error("Error fetching satellites: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSatellites();
    }, [activePlanet, session, supabase, inventoryItems]);

    if (loading) {
        return <div>Loading...</div>;
    };

    return (
        <div className="p-3">
            <div className="grid grid-cols-3 gap-4">
                {satellites.map((satellite) => (
                    <div key={satellite.id} className="flex flex-col items-center">
                        <img 
                            src={satellite.iconUrl} 
                            alt={`Automaton ${satellite.id}`} 
                            className="w-16 h-16 object-cover cursor-pointer" 
                            onClick={handleAutomatonClick} 
                        />
                    </div>
                ))}
            </div>
        </div>
    )
};