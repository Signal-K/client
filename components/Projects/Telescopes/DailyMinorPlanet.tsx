"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";

import { Anomaly } from "../Zoodex/ClassifyOthersAnimals";
interface Props {
    anomalyid: number | bigint;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function StarterDailyMinorPlanet({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${anomalyid}.png`;

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
    );

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
                                <ClassificationForm anomalyId={anomalyid.toString()} anomalyType='telescope-minorPlanet' missionNumber={20000003} assetMentioned={imageUrl} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export function DailyMinorPlanet() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [missionLoading, setMissionLoading] = useState<boolean>(true);

    const [hasMission20000003, setHasMission20000003] = useState<boolean | null>(false);

    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) {
                setLoading(false);
                return;
            }
    
            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("*")
                    .eq("user", session.user.id)
                    .eq("mission", 20000003)
                    .single();
    
                console.log("Mission Data:", missionData); 
    
                if (missionError) {
                    throw missionError;
                }
    
                setHasMission20000003(!!missionData);
            } catch (error: any) {
                console.error("Mission error:", error);
                setHasMission20000003(false);
            } finally {
                setMissionLoading(false);
            }
        };
    
        checkTutorialMission();
    }, [session, supabase]);

    // Fetch anomaly data
    useEffect(() => {
        if (!hasMission20000003 || missionLoading || !session) return;

        const fetchAnomaly = async () => {
            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "telescope-minorPlanet");
    
                if (anomalyError) {
                    throw anomalyError;
                }
    
                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-dailyMinorPlanet/${randomAnomaly.id}.png`);
            } catch (error: any) {
                console.error("Error fetching anomaly", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [hasMission20000003, missionLoading, session, supabase]);

    // Handle loading states
    if (loading || missionLoading) {
        return <div>Loading...</div>;
    }

    // Render conditionally based on mission
    if (!hasMission20000003) {
        return <StarterDailyMinorPlanet anomalyid={anomaly?.id || 100879215} />;
    }

    // Render anomaly or no anomaly found message
    if (!anomaly) {
        return (
            <div>
                <p>No anomaly found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 rounded-md relative w-full">
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Anomaly"
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
            {imageUrl && (
                <ClassificationForm
                    anomalyId={anomaly?.id.toString() || ""}
                    anomalyType='telescope-minorPlanet'
                    missionNumber={20000003}
                    assetMentioned={imageUrl}
                    structureItemId={3103}
                />
            )}
        </div>
    );
};