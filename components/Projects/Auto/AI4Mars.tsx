"use client";

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import { StructureInfo } from "@/components/Structures/structureInfo";

import { Anomaly } from "../Zoodex/ClassifyOthersAnimals";
interface Props {
    anomalyid: number;
};

export function StarterAiForMars({ anomalyid }: Props) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
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
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">

                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    
                                </p>
                            )}

                            {line < 4 && (
                                <button
                                    onClick={nextLine}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Next
                                </button>
                            )}
                            {line === 4 && (
                                <button
                                    onClick={nextPart}
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-[#85DDA2] text-[#2C3A4A] rounded-md shadow-md"
                                >
                                    Continue
                                </button>
                            )}
                            {line < 5 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 1 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step1.jpeg" alt="Step 1" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 1 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step2.jpeg" alt="Step 2" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 1 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step3.jpeg" alt="Step 3" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 1 && <img src="/assets/Docs/Automatons/automatons-ai4Mars/Step4.jpeg" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
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

export function AiForMarsProject() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            };

            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", 'automaton-aiForMarss')

                if (anomalyError) {
                    throw anomalyError;
                };

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);
                setImageUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/telescope/automaton-aiForMars/${randomAnomaly.id}.jpeg`);
            } catch (error: any) {
                console.error("Error fetching anomaly", error.message);
                setAnomaly(null);
                return;

            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [session]);

    if (loading) {
        return (
            <div>
                <p>
                    Loading...
                </p>
            </div>
        );
    };

    return (
        <div className="todo">

        </div>
    );
};