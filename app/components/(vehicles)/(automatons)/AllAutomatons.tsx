"use client";

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface InventoryItem {
    id: number;
    icon_url: string;
}

export default function AllAutomatonsOnActivePlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [automatons, setAutomatons] = useState<{ id: number; iconUrl: string }[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

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
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Automatons on {activePlanet?.content}</h1>
            <div className="grid grid-cols-3 gap-4">
                {automatons.map((automaton) => (
                    <div key={automaton.id} className="flex flex-col items-center">
                        <img 
                            src={automaton.iconUrl} 
                            alt={`Automaton ${automaton.id}`} 
                            className="w-16 h-16 object-cover" 
                        />
                        <p className="text-sm text-center mt-2">{`ID: ${automaton.id}`}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}