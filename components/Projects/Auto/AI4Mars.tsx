"use client";

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import { Anomaly } from "../Zoodex/ClassifyOthersAnimals";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
import PreferredTerrestrialClassifications from "@/components/Structures/Missions/PickPlanet";

interface Props {
    anomalyid: number | bigint;
};

export function StarterAiForMars({ anomalyid }: Props) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/automaton-aiForMars/${anomalyid}.jpeg`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine(prevLine => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    You can help to improve rover performance & safety by labeling images from your rovers. You will see a series of images taken on your planet - label what you see and any landmarks that are visible.
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    Sand - Look for areas with fine, powdery dust, often with visible ripples. Sand is slippery for rovers and leaves deep wheel tracks. Ignore small sand patches narrower than 20-50 cm based on the trapezoid marker.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    Soil - Soil is cohesive and may have small gravel. The rover can drive on it without much slip, leaving light wheel tracks. It looks more compact and smooth compared to sand.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    Bedrock - Bedrock appears as large, solid, often cracked plates. It's a stable surface for the rover and easily distinguishable from sand or soil. Large flat rocks form the base.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    Larger objects - Big rocks are larger than the trapezoid (20-50 cm) and act as obstacles for the rover. Avoid overlapping these with other labels since they’re distinct hazards. 
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    Ignore terrain further than 30 meters, as it is too far to classify. Dark areas in the distance usually indicate this.
                                </p>
                            )}
                            {line === 7 && (
                                <p className="text-[#EEEAD1]">
                                    Let's get started!
                                </p>
                            )}

                            {line < 7 && (
                                <button
                                    onClick={nextLine}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Next
                                </button>
                            )}
                            {line === 7 && (
                                <button
                                    onClick={nextPart}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Continue
                                </button>
                            )}
                            {line < 8 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 1 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step1.jpeg" alt="Step 1" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 2 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step2.png" alt="Step 2" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 3 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step3.png" alt="Step 3" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 4 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step4.png" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 5 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step5.png" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 6 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step6.png" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 7 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step7.jpeg" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
                                </div>
                            )}
                        </>
                    )}

                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Content
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );;

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <div className="mb-2">
                        {tutorialContent}
                    </div>
                )}

                {part === 2 && (
                    <>
                        <div className="mb-2">
                            <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                                <div className="relative">
                                    <div className='absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                                    <div className="bg-white bg-opacity-90">
                                        <img
                                            src={imageUrl}
                                            alt="Anomaly"
                                            className="relative z-10 w-128 h-128 object-contain"
                                        />
                                    </div>
                                </div>
                                <ClassificationForm anomalyId={anomalyid.toString()} anomalyType='automaton-aiForMars' missionNumber={20000006} assetMentioned={imageUrl} />
                            </div>
                        </div>
                    </>
                )}
            </div> 
        </div>
    );
};

interface SelectedAnomProps {
    anomalyid?: number;
}; 

export function AiForMarsProject({
    anomalyid
}: SelectedAnomProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMission20000006, setHasMission20000006] = useState<boolean | null>(null);

    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;

            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", "20000006")
                    .limit(1);

                if (missionError) {
                    console.error("Error fetching mission data:", missionError);
                    setHasMission20000006(false);
                    return;
                }

                setHasMission20000006(missionData && missionData.length > 0);
            } catch (error) {
                console.error("Error checking user mission: ", error);
                setHasMission20000006(false);
            }
        };

        checkTutorialMission();
    }, [session, supabase]);

    const fetchAnomaly = async () => {
        if (!session) {
            setLoading(false);
            return;
        };

        try {
            const { data: anomalyData, error: anomalyError } = await supabase
                .from("anomalies")
                .select("*")
                .eq("anomalySet", "automaton-aiForMars");

            if (anomalyError) throw anomalyError;

            const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
            setAnomaly(randomAnomaly);
            setImageUrl(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/telescope/automaton-aiForMars/${randomAnomaly.id}.jpeg`
            );
        } catch (error: any) {
            console.error("Error fetching anomaly", error.message);
            setAnomaly(null);
        } finally {
            setLoading(false);
        };
    };

    useEffect(() => {
        // async function fetchAnomaly() {
        //     if (!session) {
        //         setLoading(false);
        //         return;
        //     };

        //     try {
        //         const { data: anomalyData, error: anomalyError } = await supabase
        //             .from("anomalies")
        //             .select("*")
        //             .eq("anomalySet", "automaton-aiForMars");

        //         if (anomalyError) throw anomalyError;

        //         const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
        //         setAnomaly(randomAnomaly);
        //         setImageUrl(
        //             `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/telescope/automaton-aiForMars/${randomAnomaly.id}.jpeg`
        //         );
        //     } catch (error: any) {
        //         console.error("Error fetching anomaly", error.message);
        //         setAnomaly(null);
        //     } finally {
        //         setLoading(false);
        //     }
        // }

        fetchAnomaly();
    }, [session, supabase]);

    if (loading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    };

    if (!anomaly) {
        return (
            <div>
                <p>No anomaly found.</p>
            </div>
        );
    };

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg">
            {!hasMission20000006 ? (
                <StarterAiForMars anomalyid={anomaly.id || 69592674} />
            ) : (
                <>
                    {imageUrl && (
                        <>
                            <ImageAnnotator
                                initialImageUrl={imageUrl}
                                anomalyId={anomaly.id.toString()}
                                anomalyType="automaton-aiForMars"
                                missionNumber={200000062}
                                assetMentioned={imageUrl}
                                structureItemId={3102}
                                annotationType="AI4M"
                            />
                            {/* <ClassificationForm
                                
                            /> */}
                        </>
                    )}
                    <button
                        onClick={startTutorial}
                        className="mt-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                    >
                        Reopen Tutorial
                    </button>
                </>
            )}
        </div>
    );
};

export function AI4MWrapper() {
    const [selectedAnomaly, setSelectedAnomaly] = useState<number | null>(null);

    return (
        <div className="space-y-8">
            {!selectedAnomaly && (
                <PreferredTerrestrialClassifications onSelectAnomaly={setSelectedAnomaly} />
            )} 
            {selectedAnomaly && 
                <AiForMarsProject anomalyid={selectedAnomaly}
            />}
        </div>
    );
};