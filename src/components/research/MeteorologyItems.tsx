'use client';

import { useState, useEffect } from "react";
import { SatelliteDishIcon } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "./TechSection";
import { UpgradeItem } from "./UpgradeItem"; 
import TotalPoints from "../deployment/missions/structures/Stardust/Total";

type CapacityKey = 'probeCount' | 'balloonCount';
type UserCapacities = Record<CapacityKey, number>;

export default function MeteorologyResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [availablePoints, setAvailablePoints] = useState(10); // update this to use the value from `TotalPoints`

    const [userCapacities, setUserCapacities] = useState<UserCapacities>({
        probeCount: 1,
        balloonCount: 1,
    });
    const [probeRangeDescription, setProbeRangeDescription] = useState("Unknown");

    const getUpgradeCost = (currentLevel: number): number => {
        return(currentLevel + 1) * 2;
    };

    const handleUpgrade = async ( capacity: CapacityKey, currentLevel: number ) => {
        const cost = getUpgradeCost(currentLevel);
        if (availablePoints >= cost) {
            setAvailablePoints((prev) => prev - cost);
            setUserCapacities((prev) => ({
                ...prev,
                [capacity]: prev[capacity] + 1,
            }));

            if (session) {
                const techType = capacity === 'probeCount' ? 'probecount' : 'ballooncount';
                await supabase.from('researched').insert([
                    {
                        user_id: session.user.id,
                        tech_type: techType,
                    },
                ]);
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
                error,
            } = await supabase
                .from("researched")
                .select("tech_type")
                .eq('user_id', session.user.id);

            if (error) {
                throw error;
            };

            let probeCount = 1;
            let balloonCount = 1;

            researched?.forEach(item => {
                if (item.tech_type === 'probecount') probeCount += 1;
                if (item.tech_type === 'ballooncount') balloonCount += 1;
            });

            setUserCapacities({
                probeCount,
                balloonCount,
            });

            const response = await fetch(`/api/gameplay/research/upgrades?techType=proberange&count=${balloonCount}`);
            const data = await response.json();
            setProbeRangeDescription(data.description);
        } catch (err) {
            console.error("Error fetching research data:", err);
        };
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-8">
                
            </div>
            <TechSection
                title="METEOROLOGY"
                icon={<SatelliteDishIcon />}
                color="#564HFG"
                glowColor="rgba(65, 44, 255, 0.8)"
            >       
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                            AVAILABLE UPGRADES
                        </h3>
                        <UpgradeItem
                            title="Probe Count ++"
                            description="Build additional probes to expand climate data collection capabilities"
                            current={userCapacities.probeCount}
                            max={3}
                            cost={getUpgradeCost(userCapacities.probeCount)}
                            onUpgrade={() => handleUpgrade("probeCount", userCapacities.probeCount)}
                            disabled={
                            userCapacities.probeCount >= 3 ||
                            availablePoints < getUpgradeCost(userCapacities.probeCount)
                            }
                            color="#4361ee"
                        />
                    </div>
                </div>
            </TechSection>
        </>
    );
};

/*
Add weather balloons to monitor atmospheric conditions

Weather Balloons on Settlements

Deploy weather monitoring on your settlements

*/