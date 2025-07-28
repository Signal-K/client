'use client';

import { useState, useEffect } from "react";
import { LeafIcon } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "./TechSection";
import { UpgradeItem } from "./UpgradeItem";
import TotalPoints from "../Structures/Missions/Stardust/Total";
// import { GreenhouseResearchStations } from "../Structures/Missions/Biologists/ResearchStations";

type CapacityKey = "cameraCount" | "sensorCount" | "stationSize";
type UserCapacities =  Record<CapacityKey, number>;

export default function BiologyResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [availablePoints, setAvailablePoints] = useState(10);

    const [userCapacities, setUserCapacities] = useState<UserCapacities>({
        cameraCount: 1,
        sensorCount: 1,
        stationSize: 1,
    });
    
    const getUpgradeCost = ( currentLevel: number ): number => {
        return (
            currentLevel + 1
        ) * 2;
    };

    const handleUpgrade = async (
        capacity: CapacityKey,
        currentLevel: number,
    ) => {
        const cost = getUpgradeCost(currentLevel);
        if (availablePoints >= cost) {
            setAvailablePoints((prev) => prev - cost);
            setUserCapacities((prev) => ({
                ...prev,
                [capacity]: prev[capacity] + 1,
            }));

            if (session) {
                const techType = capacity === 'cameraCount' ? 'cameracount' : capacity === 'sensorCount' ? 'sensorcount' : 'stationsize';
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
                .from('researched')
                .select('tech_type')
                .eq('user_id', session.user.id);

            if (error) {
                throw error;
            };

            let cameraCount = 1;
            let sensorCount = 1;
            let stationSize = 1;

            researched?.forEach(item => {
                if (item.tech_type === 'cameracount') cameraCount += 1;
                if (item.tech_type === 'sensorcount') sensorCount += 1;
                if (item.tech_type === 'stationsize') stationSize += 1;
            });

            setUserCapacities({
                cameraCount,
                sensorCount,
                stationSize,
            });

            // const response = await fetch(`/api/gameplay/research/upgrades?techType=proberange&count=${balloonCount}`);
            // const data = await response.json();
        } catch (err) {
            console.error("Error fetching research data:", err);
        };
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-8">

            </div>
            <TechSection
                title="Biology Research"
                // description="Upgrade your biological research capabilities to enhance your capacity for exploration of your planets' ecosystems"
                icon={<LeafIcon className="h-6 w-6" />}
                color="#4cc9f0"
                glowColor="rgba(44, 56, 255, 0.3"
            >
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                            AVAILABLE UPGRADES
                        </h3>
                        <UpgradeItem
                            title="Camera Count ++"
                            description="Add more field cameras to capture diverse lifeforms and behavioral patterns"
                            current={userCapacities.cameraCount}
                            max={3}
                            cost={getUpgradeCost(userCapacities.cameraCount)}
                            onUpgrade={() => handleUpgrade("cameraCount", userCapacities.cameraCount)}
                            disabled={
                                userCapacities.cameraCount >= 3 ||
                                availablePoints < getUpgradeCost(userCapacities.cameraCount)
                            }
                            color="#4cc9f0"
                        />
                        <UpgradeItem
                            title="Sensor Count ++"
                            description="Install additional sensors to gather increased environmental and biological data."
                            current={userCapacities.sensorCount}
                            max={3}
                            cost={getUpgradeCost(userCapacities.sensorCount)}
                            onUpgrade={() => handleUpgrade("sensorCount", userCapacities.sensorCount)}
                            disabled={
                                userCapacities.sensorCount >= 3 ||
                                availablePoints < getUpgradeCost(userCapacities.sensorCount)
                            }
                            color="#4cc9f0"
                        />
                        <UpgradeItem
                            title="Station Size ++"
                            description="Expand your research stations to support more experiments and equipment"
                            current={userCapacities.stationSize}
                            max={3}
                            cost={getUpgradeCost(userCapacities.stationSize)}
                            onUpgrade={() => handleUpgrade("stationSize", userCapacities.stationSize)}
                            disabled={
                                userCapacities.stationSize >= 3 ||
                                availablePoints < getUpgradeCost(userCapacities.stationSize)
                            }
                            color="#4cc9f0"
                        />
                    </div>
                    {/* <div className="">
                        <GreenhouseResearchStations />
                    </div> */}
                </div>
            </TechSection>
        </>
    )
};

/*
AVAILABLE UPGRADES
Camera Count ++

Increase observation capabilities

Current: 1/3

UPGRADE
4
Station Count

View available biodome stations

SHOW AVAILABLE
UNAVAILABLE UPGRADES
Station Size ++

Expand the size of your research stations
*/