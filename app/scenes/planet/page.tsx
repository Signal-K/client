"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout from "@/app/components/(scenes)/planetScene/layout";
import StructuresOnPlanet, { ActiveMissionStructures, StarterMissionStructures } from "@/app/components/(structures)/Structures";
import { InventoryStructureItem } from "@/types/Items";
import ChapterOneIntroduction from "@/app/components/(scenes)/chapters/one/ChapterOneIntro";
import ChooseClassificationStarter from "@/app/components/(scenes)/chapters/one/ChooseClassifications";
import MissionLog from "@/app/components/(scenes)/(missions)/MissionList";
import { PlanetarySystem } from "@/app/components/(scenes)/planetScene/orbitals/system";
import { BottomMenuBar } from "@/app/components/sections/bottomMenuBar";
import StarterMissionsStats from "@/app/components/(scenes)/(missions)/CompletedMissions";

export default function PlanetViewPage() {
    const { activePlanet } = useActivePlanet();
    const session = useSession();
    const supabase = useSupabaseClient();

    const [hasMission1370201, setHasMission1370201] = useState(false);
    const [hasChosenFirstClassification, setHasChosenFirstClassification] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            } finally {
                setIsLoading(false);
            };
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
            } finally {
                setIsLoading(false);
            };
        };

        checkMission();
        checkFirstClassificationStatus();
    }, [session?.user, supabase]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!hasMission1370201) {
        return (
            <PlanetViewLayout>
                <div></div>
                <div><ChapterOneIntroduction /></div>
            </PlanetViewLayout>
        );
    };

    if (!hasChosenFirstClassification) {
        return (
            <PlanetViewLayout>
                <div></div>
                <div><ChooseClassificationStarter /></div>
            </PlanetViewLayout>
        );
    };

    return (
        <div className="relative min-h-screen">
            <PlanetStructures />
            {/* <div className="hidden lg:block lg:absolute lg:bottom-0 lg:right-0 lg:w-1/3 lg:h-1/3 lg:max-h-[30vh] lg:bg-white lg:z-50">
                <MissionLog />
            </div> */}
            <BottomMenuBar onClose={() => null} />
        </div>
    );
};

function PlanetStructures() {
    const { activePlanet } = useActivePlanet();

    const [orbitalStructures, setOrbitalStructures] = useState<InventoryStructureItem[]>([]);
    const [atmosphereStructures, setAtmosphereStructures] = useState<InventoryStructureItem[]>([]);
    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);

    const handleStructuresFetch = useCallback(
        (orbital: InventoryStructureItem[], atmosphere: InventoryStructureItem[], surface: InventoryStructureItem[]) => {
            setOrbitalStructures(orbital);
            setAtmosphereStructures(atmosphere);
            setSurfaceStructures(surface);
        },
        [],
    );

    return (
        <PlanetViewLayout>
            <div className="w-full">
                Orbital Structures
                <PlanetarySystem />
            </div>
            <div className="w-full">
                Atmosphere Structures
            </div>
            <div className="w-full">
                <center><StructuresOnPlanet onStructuresFetch={handleStructuresFetch} /></center>
            </div>
            <div className="relative flex-1">
                <div className="absolute right-0 w-full sm:w-auto sm:h-auto max-h-[30vh] sm:relative">
                    <StarterMissionsStats />
                </div>
            </div>
        </PlanetViewLayout>
    );
};

/*

<PlanetViewLayout>
            <div>
                Planet id: {activePlanet?.id}
                <br />
                Orbital & Orbital structures
                {/* <div className="flex flex-row space-y-4">
                    {orbitalStructures.map((structure) => (
                        <div key={structure.id} className="flex items-center space-x-4">
                            <img src={structure.itemDetail?.icon_url} alt={structure.itemDetail?.name} className="w-16 h-16 object-cover" />
                        </div>
                    ))}
                </div> 
                </div>
                <div>
                    Atmosphere Structures
                    {/* <div className="flex flex-row space-y-4">
                        {atmosphereStructures.map((structure) => (
                            <div key={structure.id} className="flex items-center space-x-4">
                                <img src={structure.itemDetail?.icon_url} alt={structure.itemDetail?.name} className="w-16 h-16 object-cover" />
                            </div>
                        ))}
                    </div> 
                </div>
                <div>
                    Surface Structures
                    {/* <div className="flex flex-row space-y-4">
                        {surfaceStructures.map((structure) => (
                            <div key={structure.id} className="flex items-center space-x-4">
                                <img src={structure.itemDetail?.icon_url} alt={structure.itemDetail?.name} className="w-16 h-16 object-cover" />
                            </div>
                        ))}
                    </div> 
                    <StructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
                </div>
                <div className="bg-white/50 h-full">
                    {/* Automatons 
                    <ChapterOneIntroduction />
                </div>
            </PlanetViewLayout>
*/