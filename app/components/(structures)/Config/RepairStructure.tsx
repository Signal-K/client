"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

import { Plus, Minus, Hammer } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StructureRepairProps {
    inventoryId: number;
    onSave?: () => void;
}

const StructureRepair: React.FC<StructureRepairProps> = ({ onSave, inventoryId }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [structureDurability, setStructureDurability] = useState<number>(0);
    const [structureName, setStructureName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStructureData = async () => {
            try {
                // Fetch the structure's configuration
                const { data, error } = await supabase
                    .from('inventory')
                    .select('configuration, item')
                    .eq('id', inventoryId)
                    .single();

                if (error) {
                    throw error;
                }

                if (data) {
                    const config = data.configuration as { uses?: number };
                    setStructureDurability(config.uses ?? 0);

                    // Fetch the item name from the API
                    const itemId = data.item;
                    const response = await fetch('/api/gameplay/inventory');
                    const inventoryItems = await response.json();

                    const item = inventoryItems.find((item: { id: number }) => item.id === itemId);
                    if (item) {
                        setStructureName(item.name);
                    } else {
                        setStructureName("Unknown Structure");
                    }
                }
            } catch (err) {
                console.error('Error fetching structure data:', err);
                setError('Failed to fetch structure data.');
            } finally {
                setLoading(false);
            }
        };

        fetchStructureData();
    }, [supabase, inventoryId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Structure Repair</h2>
            <div className="flex items-center justify-center min-h-screen bg-[#F7F5E9]">
                <Card className="w-80 bg-[#2C4F64] text-[#F7F5E9] shadow-lg">
                    <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                        <div className="w-16 h-16 bg-[#5FCbC3] rounded-full flex items-center justify-center">
                            <Hammer className="w-10 h-10 text-[#2C4F64]" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{structureName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Durability: {structureDurability}</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={onSave}>Save</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default StructureRepair;