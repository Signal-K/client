'use client';

import { useState, useEffect } from "react";
import { SatelliteDishIcon } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "./TechSection";
import { UpgradeItem } from "./UpgradeItem"; 
import TotalPoints from "../deployment/missions/structures/Stardust/Total";
import { LockedItem } from "./LockedItem";

type CapacityKey = 'probeCount' | 'balloonCount';
type UserCapacities = Record<CapacityKey, number>;

export default function MeteorologyResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [availablePoints, setAvailablePoints] = useState(0); // update this to use real stardust balance

    const [userCapacities, setUserCapacities] = useState<UserCapacities>({
        probeCount: 1,
        balloonCount: 1,
    });
    const [satelliteCount, setSatelliteCount] = useState(1);
    const [probeRangeDescription, setProbeRangeDescription] = useState("Unknown");
    const [cloudClassificationsCount, setCloudClassificationsCount] = useState(0);

    const getUpgradeCost = (currentLevel: number): number => {
        return 10; // Fixed cost of 10 stardust per upgrade
    };

    const handleUpgrade = async ( capacity: CapacityKey, currentLevel: number ) => {
        const cost = getUpgradeCost(currentLevel);
        if (availablePoints >= cost && currentLevel < 2) {
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

    const handleSatelliteUpgrade = async () => {
        const cost = getUpgradeCost(satelliteCount);
        if (availablePoints >= cost && satelliteCount < 2) {
            setAvailablePoints((prev) => prev - cost);
            setSatelliteCount((prev) => prev + 1);

            if (session) {
                await supabase.from('researched').insert([
                    {
                        user_id: session.user.id,
                        tech_type: 'satellitecount',
                    },
                ]);
                fetchResearchData();
            }
        }
    };

    useEffect(() => {
        fetchResearchData();
    }, [session]);

    const fetchResearchData = async () => {
        if (!session) {
            return;
        }

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
            }

            const {
                data: classifications,
                error: classificationsError,
            } = await supabase
                .from("classifications")
                .select("id")
                .eq("author", session.user.id)
                .eq("classificationtype", "cloud");

            if (classificationsError) {
                throw classificationsError;
            }

            // Calculate stardust balance
            const { data: allClassifications } = await supabase
                .from("classifications")
                .select("id")
                .eq("author", session.user.id);

            const basePoints = allClassifications?.length || 0;
            const researchPenalty = (researched?.length || 0) * 10;
            const totalPoints = Math.max(0, basePoints - researchPenalty);
            setAvailablePoints(totalPoints);

            let probeCount = 1;
            let balloonCount = 1;
            let satelliteUpgrades = 0;

            researched?.forEach(item => {
                if (item.tech_type === 'probecount') probeCount += 1;
                if (item.tech_type === 'ballooncount') balloonCount += 1;
                if (item.tech_type === 'satellitecount') satelliteUpgrades += 1;
            });

            setUserCapacities({
                probeCount: Math.min(probeCount, 2),
                balloonCount: Math.min(balloonCount, 2),
            });

            setSatelliteCount(Math.min(1 + satelliteUpgrades, 2));
            setCloudClassificationsCount(classifications.length);

            const response = await fetch(`/api/gameplay/research/upgrades?techType=proberange&count=${balloonCount}`);
            const data = await response.json();
            setProbeRangeDescription(data.description);
        } catch (err) {
            console.error("Error fetching research data:", err);
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4 mb-8">
                
            </div>
            <TechSection
                title="SATELLITE TECHNOLOGY"
                icon={<SatelliteDishIcon />}
                color="#564HFG"
                glowColor="rgba(65, 44, 255, 0.8)"
            >       
                <div className="space-y-6">
                    {/* Projects Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                            PROJECTS
                        </h3>
                        <UpgradeItem
                            title="Terrestrial Cloudspotting"
                            description="Monitor terrestrial planets to spot cloud formation."
                            max={1}
                            cost={0}
                            onUpgrade={() => {}}
                            disabled={true}
                            color="#4361ee"
                        />
                        <UpgradeItem
                            title="Gaseous Cloudspotting"
                            description="Unlock gaseous cloud monitoring with advanced radar systems. Requires 2 classifications of weather events on terrestrial planets"
                            current={cloudClassificationsCount}
                            max={2}
                            cost={0}
                            onUpgrade={() => {}}
                            disabled={cloudClassificationsCount < 2}
                            color="#4cc9f0"
                        />
                        <LockedItem
                            title="Dust Stormspotting"
                            description="Coming soon. Unlock dust storm monitoring capabilities."
                        />
                    </div>

                    {/* Data Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                            DATA
                        </h3>
                        <LockedItem
                            title="Spectroscopy Data"
                            description="Coming soon. Access detailed spectroscopy data for atmospheric analysis."
                        />
                        <LockedItem
                            title="Metallicity Data"
                            description="Coming soon. Unlock metallicity data for satellite observations."
                        />
                    </div>

                    {/* Tech Improvements Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-[#4cc9f0] mb-4 border-b border-[#1e3a5f] pb-2">
                            TECH IMPROVEMENTS
                        </h3>
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <p className="text-sm text-blue-200 italic">
                                "Mission Control has authorized expansion of your satellite fleet for enhanced planetary coverage."
                            </p>
                        </div>
                        <UpgradeItem
                            title="Additional Satellite"
                            description="Deploy an additional weather satellite to your fleet, allowing you to monitor multiple planetary locations simultaneously. This expansion increases your observation capacity and enables comprehensive atmospheric analysis across different worlds."
                            current={satelliteCount}
                            max={2}
                            cost={getUpgradeCost(satelliteCount)}
                            onUpgrade={handleSatelliteUpgrade}
                            disabled={availablePoints < getUpgradeCost(satelliteCount) || satelliteCount >= 2}
                            color="#564HFG"
                        />
                        <LockedItem
                            title="Improved Range"
                            description="Coming soon. Extend the range of satellite observations."
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