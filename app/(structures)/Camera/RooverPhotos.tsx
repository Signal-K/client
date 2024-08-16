"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

import { InventoryItem } from "@/types/Items";
import { OwnedItem } from "@/types/Items";

export const RoverPhotosModule: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [structureData, setStructureData] = useState<InventoryItem | null>(null);

    const newCameraModuleToInventoryData = {
        item: 104,
        owner: session?.user?.id || "",
        quantity: 1,
        notes: "Created for mission 1370104",
        parentItem: null,
        time_of_deploy: null,
        anomaly: activePlanet?.id || null,
    };

    useEffect(() => {
        const fetchOrCreateInventoryItem = async () => {
            try {
                const { data, error } = await supabase
                    .from("inventory")
                    .select("*")
                    .eq("item", 104)
                    .eq("owner", session?.user?.id);

                if (error) {
                    console.error("Error fetching inventory items: ", error);
                    return;
                }

                if (data && data.length > 0) {
                    // Entry exists (for camera structure...104)
                    console.log(`Camera structure already in inventory with ID: ${data[0].id}`);
                    setStructureData(data[0]);  // Set the existing structure data
                } else {
                    const { data: insertData, error: insertError } = await supabase
                        .from("inventory")
                        .insert(newCameraModuleToInventoryData)
                        .select("*"); // Return the inserted record

                    if (insertError) {
                        console.error("Error creating camera structure in inventory: ", insertError);
                    } else if (insertData && insertData.length > 0) {
                        console.log("New camera structure added to inventory");
                        setStructureData(insertData[0]); // Set the newly created structure data
                    }
                }
            } catch (error) {
                console.error("Unexpected error: ", error);
            }
        };

        if (session?.user?.id) {
            fetchOrCreateInventoryItem();
        }
    }, [session, supabase]);

    return (
        <>
        </>
    );
};