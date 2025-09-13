"use client";

import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "./TechSection";
import { LockedItem } from "./LockedItem";

export default function RoverResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [availablePoints, setAvailablePoints] = useState(10);

    const getUpgradeCost = (currentLevel: number): number => {
        return (currentLevel + 1) * 2;
    };

    const handleUpgrade = async (techType: string, currentLevel: number) => {
        const cost = getUpgradeCost(currentLevel);
        if (availablePoints >= cost) {
            setAvailablePoints((prev) => prev - cost);

            if (session?.user) {
                await supabase.from("researched").insert([
                    {
                        user_id: session.user.id,
                        tech_type: techType,
                    },
                ]);
                fetchResearchData(); // Re-fetch after upgrade
            }
        }
    };

    const fetchResearchData = async () => {
        if (!session?.user) return;

        try {
            const { data: researched, error } = await supabase
                .from("researched")
                .select("tech_type")
                .eq("user_id", session.user.id);

            if (error) throw error;

            // Placeholder for processing researched data
            console.log(researched);
        } catch (err) {
            console.error("Error fetching research data:", err);
        }
    };

    useEffect(() => {
        fetchResearchData();
    }, [session]);

    return (
        <TechSection
            title="ROVER RESEARCH"
            icon={<span>🛞</span>} // Replace with an appropriate icon
            color="#FF5733"
            glowColor="rgba(255, 87, 51, 0.8)"
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                        ROVER IMPROVEMENTS
                    </h3>
                    <LockedItem
                        title="Increase Battery"
                        description="Coming soon. More points on routes."
                    />
                    <LockedItem
                        title="Increase Range"
                        description="Coming soon. Longer distance for routes."
                    />
                    <LockedItem
                        title="Improve Wheel Durability"
                        description="Coming soon. Decreases odds of getting stuck."
                    />
                    <LockedItem
                        title="Increase Cameras"
                        description="Coming soon. More anomalies available."
                    />
                </div>
            </div>
        </TechSection>
    );
}