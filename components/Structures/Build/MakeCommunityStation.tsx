"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { InventoryItem } from '@/types/Items';

interface Project {
    id: string;
    name: string;
    identifier: string;
    level: number;
    locked: boolean;
};

interface Mission {
    id: string;
    name: string;
    type: string;
    project: string;
    level: number;
    locked: boolean;
};

interface CommunityStationConfig {
    stationName: string;
    inventoryItemId: number;
    projects: Project[];
    missions: Mission[];
};

export function CreateCommunityStation() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [unplacedCommunityStations, setUnplacedCommunityStations] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchStructures() {
            if (!session || !activePlanet) {
                setLoading(false);
                return;
            }

            try {
                const { data: userInventory, error: inventoryError } = await supabase
                    .from("inventory")
                    .select("*")
                    .in("item", [31011, 31012, 31013])
                    .eq("anomaly", activePlanet.id);

                if (inventoryError) {
                    throw inventoryError;
                }

                const availableStations = userInventory.map((item: { item: number }) => item.item);
                const response = await fetch("/api/gameplay/inventory");
                const inventoryItems: InventoryItem[] = await response.json();

                const unplacedStations = inventoryItems.filter(item =>
                    item.ItemCategory === "CommunityStation" && !availableStations.includes(item.id)
                );

                const unplaced = unplacedStations.filter(item => item.locationType === "Surface");
                setUnplacedCommunityStations(unplaced);
            } catch (error) {
                console.error("Error fetching structures", error);
                setError("Failed to load community stations.");
            } finally {
                setLoading(false);
            }
        }

        fetchStructures();
    }, [session, activePlanet]);

    async function fetchStationConfig(itemId: number): Promise<CommunityStationConfig | null> {
        const response = await fetch(`/api/gameplay/communityStations/projects/${itemId}`);
        if (!response.ok) {
            console.error("Failed to fetch station config");
            return null;
        }
        return await response.json();
    }

    async function placeCommunityStation(structure: InventoryItem) {
        if (!session || !activePlanet) {
            return;
        }

        const stationConfig = await fetchStationConfig(structure.id);
        if (!stationConfig) return;

        // Prepare the configuration object
        const configuration = {
            Uses: 5,
            projects: stationConfig.projects.map(project => ({
                ...project,
                level: 0,
                locked: true,
            })),
            missions: stationConfig.missions.map(mission => ({
                ...mission,
                level: 0,
                locked: true,
            })),
        };

        try {
            const { error } = await supabase
                .from("inventory")
                .insert([
                    {
                        owner: session.user.id,
                        anomaly: activePlanet.id,
                        item: structure.id,
                        quantity: 1,
                        configuration: configuration,
                    },
                ]);

            if (error) {
                throw error;
            }

            console.log("Community station placed");
            setOpen(false);
            setUnplacedCommunityStations(prev => prev.filter(item => item.id !== structure.id)); // Remove the placed station from the list
        } catch (error) {
            console.error("Error placing community station", error);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (unplacedCommunityStations.length === 0) {
        return (
            <div className='relative'>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className='rounded-full p-4 bg-[#FFD580] text-[#a9b1d6] hover:bg-[#24283b] shadow-lg'>
                            <Plus size={36} />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Select a Community Station</DialogTitle>
                        <p>No unplaced community stations available.</p>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className='relative'>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className='rounded-full p-4 bg-[#FFD580] text-[#a9b1d6] hover:bg-[#24283b] shadow-lg'>
                        <Plus size={36} />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Select a Community Station</DialogTitle>
                    <div className="flex flex-col">
                        {unplacedCommunityStations.map(station => (
                            <motion.div key={station.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center justify-between p-2 border-b border-gray-300"
                            >
                                <div className="flex items-center">
                                    <img src={station.icon_url} alt={station.name} className="w-10 h-10 mr-2" />
                                    <span className="font-semibold">{station.name}</span>
                                </div>
                                <Button onClick={() => placeCommunityStation(station)}>
                                    Place
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};