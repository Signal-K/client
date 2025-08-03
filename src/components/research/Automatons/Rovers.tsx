'use client'

import { useState, useEffect } from "react";
import { SatelliteDish, RockingChair } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "../TechSection";
import { UpgradeItem } from "../UpgradeItem";

type CapacityKey = 'Seiscam' | 'Wheels';
type UserCapacities = Record<CapacityKey, number>;

export default function AutomatonSurfaceRoverResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [availablePoints, setAvailablePoints] = useState<number>(10); // WE NEED TO CHANGE THIS!!!
    const [userCapacities, setUserCapacities] = useState<UserCapacities>({
        Seiscam: 1,
        Wheels: 1,
    });

    const getUpgradeCost = ( currentLevel: number ): number => {
        return ( currentLevel + 1 ) * 2;
    };

    const handleUpgrade = async ( capacity: CapacityKey, currentLevel: number ) => {
        const cost = getUpgradeCost(currentLevel);
        if (availablePoints >= cost) {
            setAvailablePoints((prev) => prev - cost);
            setUserCapacities((prev) => ({
                ...prev,
                [capacity]: prev[capacity] + 1
            }));

            if (session) {
                const techType = capacity === "Seiscam" ? "Wheels" : "Seiscam";
                await supabase.from("researched").insert([{
                    user_id: session.user.id,
                    tech_type: techType
                }, ]);

                fetchResearchData();
            };
        };
    };

    useEffect(() => {
        fetchResearchData();
    }, [session]);

    const fetchResearchData = async () => {
        if (!session) {
            return;
        };

        try {
            const {
                data: researched,
                error
            } = await supabase
                .from("researched")
                .select("tech_type")
                .eq("user_id", session.user.id);

            if (error) {
                throw error;
            };

            let seiscamLevel = 1;
            let wheelsLevel = 1;

            researched?.forEach(item => {
                if (item.tech_type === "Seiscam") {
                    seiscamLevel += 1;
                } else if (item.tech_type === "Wheels") {
                    wheelsLevel += 1;
                }
            })
        } catch (error) {
            console.error("Error fetching research data:", error);
        }
    };

    return (
        <TechSection
                icon={<RockingChair size={32} />}
                title="Surface Rover Research" color={""} glowColor={""}    >
            <div className="flex flex-col gap-4">
                <UpgradeItem
                    title="Seismic Camera"
                    description="Enhances the rover's ability to detect subsurface features."
                    cost={getUpgradeCost(userCapacities.Seiscam)}
                    onUpgrade={() => handleUpgrade('Seiscam', userCapacities.Seiscam)}
                    disabled={availablePoints < getUpgradeCost(userCapacities.Seiscam)} current={0} max={0} color={""}        
                />
            <UpgradeItem
                    title="All-Terrain Wheels"
                    description="Improves rover mobility across difficult terrain."
                    cost={getUpgradeCost(userCapacities.Wheels)}
                    onUpgrade={() => handleUpgrade('Wheels', userCapacities.Wheels)}
                    disabled={availablePoints < getUpgradeCost(userCapacities.Wheels)} current={0} max={0} color={""}        
                />
            </div>
        </TechSection>
    );
};