"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout from "@/app/components/(scenes)/planetScene/layout";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/app/components/(structures)/Structures";
import { InventoryStructureItem } from "@/types/Items";
import ChapterOneIntroduction from "@/app/components/(scenes)/chapters/one/ChapterOneIntro";
import { PlanetarySystem } from "@/app/components/(scenes)/planetScene/orbitals/system";
import { BottomMenuBar } from "@/app/components/sections/bottomMenuBar";
import AllAutomatonsOnActivePlanet from "@/app/components/(vehicles)/(automatons)/AllAutomatons";
import { SciFiPopupMenu } from "@/components/ui/popupMenu";
import { CaptnCosmosGuideModal } from "@/app/components/(dialogue)/guideBot";
import CitizenData from "@/app/auth/readToFlask";

export default function PlanetViewPage() {
    const { activePlanet } = useActivePlanet();
    const session = useSession();
    const supabase = useSupabaseClient();

    const [hasMission1370201, setHasMission1370201] = useState(false);
    const [hasChosenFirstClassification, setHasChosenFirstClassification] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isTutorialExpanded, setIsTutorialExpanded] = useState(true)
    const toggleTutorial = () => setIsTutorialExpanded(!isTutorialExpanded)

    /* --- Start of changes ---
    Consolidated loading state management using Promise.all
    */
    useEffect(() => {
        const checkMission = async () => {
            if (!session?.user) return;

            try {
                const { data: missions, error } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id)
                    .eq('mission', 1370201);

                if (error) throw error;

                setHasMission1370201(missions?.length > 0);
            } catch (error: any) {
                console.error('Error checking mission:', error.message);
            }
            /* --- Removed finally block ---
            finally {
                setIsLoading(false);
            };
            */
        };

        const checkFirstClassificationStatus = async () => {
            if (!session?.user) return;

            try {
                const { data: missions, error } = await supabase
                    .from('missions')
                    .select('mission')
                    .eq('user', session.user.id)
                    .eq('mission', 1370203);

                if (error) throw error;

                setHasChosenFirstClassification(missions?.length > 0);
            } catch (error: any) {
                console.error('Error checking mission:', error.message);
            }
            /* --- Removed finally block ---
            finally {
                setIsLoading(false);
            };
            */
        };

        /* --- Start of changes ---
        Consolidated loading state management using Promise.all
        */
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([checkMission(), checkFirstClassificationStatus()]);
            setIsLoading(false);
        };

        fetchData();
        /* --- End of changes --- */
    }, [session?.user, supabase]);

    if (isLoading) {
        return <p>Loading...</p>;
    };

    if (!hasMission1370201) {
        return (
            <PlanetViewLayout>
                <div></div>
                <div></div>
                <div></div>
                <div><ChapterOneIntroduction /></div>
            </PlanetViewLayout>
        );
    };

    if (!hasChosenFirstClassification) {
        return (
            <PlanetViewLayout>
                <div></div>
                <div></div>
                <div></div>
                <div><CaptnCosmosGuideModal isExpanded={isTutorialExpanded} toggleExpand={toggleTutorial} /></div>
            </PlanetViewLayout>
        );
    };

    return (
        <div className="relative min-h-screen">
            <PlanetStructures />
            <SciFiPopupMenu />
            <BottomMenuBar onClose={() => null} />
        </div>
    );
};

function PlanetStructures() {
    const { activePlanet } = useActivePlanet();
    const supabase = useSupabaseClient();
    const session = useSession();

    const [orbitalStructures, setOrbitalStructures] = useState<InventoryStructureItem[]>([]);
    const [atmosphereStructures, setAtmosphereStructures] = useState<InventoryStructureItem[]>([]);
    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);
    const [tooltip, setTooltip] = useState<{ visible: boolean, text: string } | null>(null);

    const handleStructuresFetch = (
        orbital: InventoryStructureItem[],
        atmosphere: InventoryStructureItem[],
        surface: InventoryStructureItem[]
    ) => {
        setOrbitalStructures(orbital);
        setAtmosphereStructures(atmosphere);
        setSurfaceStructures(surface);
    };

    const fetchStructures = useCallback(async () => {
        if (!session?.user?.id || !activePlanet?.id) return;

        try {
            const { data: inventoryData, error } = await supabase
                .from('inventory')
                .select('*')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id)
                .not('item', 'lte', 100);

            if (error) throw error;

            const orbital = inventoryData.filter((item) => item.locationType === 'Orbital');
            const atmosphere = inventoryData.filter((item) => item.locationType === 'Atmosphere');
            const surface = inventoryData.filter((item) => item.locationType === 'Surface');

            handleStructuresFetch(orbital, atmosphere, surface);
        } catch (error) {
            console.error('Error fetching structures:', error);
        }
    }, [session?.user?.id, activePlanet?.id, supabase]);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    return (
        <PlanetViewLayout>
            <div className="w-full">
                <div className="flex flex-row space-y-4">
                    {orbitalStructures.map((structure) => (
                        <div
                            key={structure.id}
                            className="relative flex items-center space-x-4"
                            onMouseEnter={() => setTooltip({ visible: true, text: structure.itemDetail?.name || 'Unknown' })}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <img
                                src={structure.itemDetail?.icon_url}
                                alt={structure.itemDetail?.name}
                                className="w-16 h-16 object-cover"
                            />
                            {tooltip?.visible && (
                                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm p-2 rounded-md">
                                    {tooltip.text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                    <center><OrbitalStructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
                </div>
            </div>
            <div className="w-full">
                <div className="flex flex-row space-y-4">
                    {atmosphereStructures.map((structure) => (
                        <div
                            key={structure.id}
                            className="relative flex items-center space-x-4"
                            onMouseEnter={() => setTooltip({ visible: true, text: structure.itemDetail?.name || 'Unknown' })}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <img
                                src={structure.itemDetail?.icon_url}
                                alt={structure.itemDetail?.name}
                                className="w-16 h-16 object-cover"
                            />
                            {tooltip?.visible && (
                                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm p-2 rounded-md">
                                    {tooltip.text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="py-2">
                    <center><AtmosphereStructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
                </div>
            </div>
            <div className="w-full">
                <center><StructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
                <div className="flex flex-row space-y-4">
                    {surfaceStructures.map((structure) => (
                        <div
                            key={structure.id}
                            className="relative flex items-center space-x-4"
                            onMouseEnter={() => setTooltip({ visible: true, text: structure.itemDetail?.name || 'Unknown' })}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <img
                                src={structure.itemDetail?.icon_url}
                                alt={structure.itemDetail?.name}
                                className="w-16 h-16 object-cover"
                            />
                            {tooltip?.visible && (
                                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm p-2 rounded-md">
                                    {tooltip.text}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative flex-1">
                <div className="absolute right-0 w-full sm:w-auto sm:h-auto max-h-[30vh] sm:relative">
                    {/* <StarterMissionsStats /> */}
                </div>
                <AllAutomatonsOnActivePlanet />
                <SciFiPopupMenu />
                <CitizenData />
            </div>
        </PlanetViewLayout>
    );
};