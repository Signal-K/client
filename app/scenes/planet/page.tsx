"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import PlanetViewLayout from "@/components/(scenes)/planetScene/layout";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
import { InventoryStructureItem } from "@/types/Items";
import ChapterOneIntroduction from "@/components/(scenes)/chapters/one/ChapterOneIntro";
import { PlanetarySystem } from "@/components/(scenes)/planetScene/orbitals/system";
// import { BottomMenuBar } from "@/app/components/sections/bottomMenuBar";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";

export default function PlanetViewPage() {
    const session = useSession();
    const supabase = useSupabaseClient();

    const { activePlanet } = useActivePlanet();

    const [hasMission1370201, setHasMission1370201] = useState(false);
    const [hasChosenFirstClassification, setHasChosenFirstClassification] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTutorialExpanded, setIsTutorialExpanded] = useState(true);
    const [isGuidePopupVisible, setIsGuidePopupVisible] = useState(false); // Manage guide popup visibility

    const toggleTutorial = () => setIsTutorialExpanded(!isTutorialExpanded);

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
        };

        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([checkMission(), checkFirstClassificationStatus()]);
            setIsLoading(false);
        };

        fetchData();
    }, [session?.user, supabase]);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!hasMission1370201) {
        return (
            <PlanetViewLayout>
                <div></div>
                <div></div>
                <div></div>
                <div><ChapterOneIntroduction /></div>
            </PlanetViewLayout>
        );
    }

    if (!hasChosenFirstClassification) {
        return (
            <PlanetViewLayout>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </PlanetViewLayout>
        );
    }

    return (
        <div className="relative min-h-screen">
            <PlanetStructures />
            {isGuidePopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <ChapterOneIntroduction />
                    <button
                        onClick={() => setIsGuidePopupVisible(false)}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

function PlanetStructures() {
    return (
        <PlanetViewLayout>
            <div className="w-full">
                <div className="py-3">
                    <div className="py-1">
                        <PlanetarySystem />
                    </div>
                    <center><OrbitalStructuresOnPlanet /></center>
                </div>
            </div>
            <div className="w-full">
                <div className="py-3">
                    <center><AtmosphereStructuresOnPlanet /></center>
                </div>
            </div>
            <div className="w-full">
                <div className="py-3">
                    <center><StructuresOnPlanet /></center>
                </div>
            </div>
            <div className="relative flex-1">
                <AllAutomatonsOnActivePlanet />
            </div>
        </PlanetViewLayout>
    );
};