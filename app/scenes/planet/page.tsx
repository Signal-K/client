"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout from "@/app/components/(scenes)/planetScene/layout";
import StructuresOnPlanet, { ActiveMissionStructures, StarterMissionStructures } from "@/app/components/(structures)/Structures";
import { InventoryStructureItem } from "@/types/Items";
import ChapterOneIntroduction from "@/app/components/(scenes)/chapters/one/ChapterOneIntro";
import ChooseClassificationStarter from "@/app/components/(scenes)/chapters/one/ChooseClassifications";

export default function PlanetViewPage() {
    const { activePlanet } = useActivePlanet();
    const session = useSession();
    const supabase = useSupabaseClient();

    const [orbitalStructures, setOrbitalStructures] = useState<InventoryStructureItem[]>([]);
    const [atmosphereStructures, setAtmosphereStructures] = useState<InventoryStructureItem[]>([]);
    const [surfaceStructures, setSurfaceStructures] = useState<InventoryStructureItem[]>([]);
    const [hasMission1370201, setHasMission1370201] = useState(false);
    const [hasChosenFirstClassification, setHasChosenFirstClassification] = useState(false); // 1370203
    const [isLoading, setIsLoading] = useState(true);

    const handleStructuresFetch = useCallback(
        (orbital: InventoryStructureItem[], atmosphere: InventoryStructureItem[], surface: InventoryStructureItem[]) => {
            setOrbitalStructures(orbital);
            setAtmosphereStructures(atmosphere);
            setSurfaceStructures(surface);
        },
        []
    );

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

    // If loading, return nothing or a loading spinner
    if (isLoading) {
        return <p>Loading...</p>;
    }

    // If user does not have mission 1370201, return an empty <p> tag
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

    // If user has mission 1370201, return the full component content (aka they have initialised chapter 1)
    return (
        <PlanetViewLayout>
            <div>
                Planet id: {activePlanet?.id}
                <br />
                Orbital Structures
            </div>
            <div>
                Atmosphere Structures
                <StructuresOnPlanet onStructuresFetch={handleStructuresFetch} />
            </div>
            <div>
                <StarterMissionStructures />
            </div>
            <div className="bg-white/50 h-full">
                <ActiveMissionStructures />
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