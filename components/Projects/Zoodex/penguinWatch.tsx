"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructureInfo } from "@/components/(structures)/structureInfo";
import ClassificationForm from "@/components/(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";

interface ZoodexProps {
    anomalyId: string;
};

export const PenguinWatchTutorial: React.FC<ZoodexProps> = ({ anomalyId }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-penguinWatch/${anomalyId}.jpeg`; 

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine((prevLine) => prevLine + 1);
    const nextPart = () => setPart((prevPart) => prevPart + 1);
 
    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Welcome to the Penguin Watch tutorial. Count penguin adults, chicks and eggs in far away lands to help us understand their lives and environment
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    {/* Individually mark rockhopper penguin adults, chicks and eggs in the foreground of the image by clicking at the centre of each one's visible area.  
                                    Click and drag the marks to recentre them as needed. */}
                                    Tell us if you see chicks, adult penguins or eggs and then extrapolate your answer in the text area in your classification screen
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    Too small to count? Ignore any penguin too far in the background like in the yellow circle above.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    If it is too difficult to see any animal on the image, simply select '_This image is too dark or blurry_'.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    Let's get started!
                                </p>
                            )}

                            {line < 6 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 2 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-penguinWatch/Step1.jpeg"
                                            alt="Step 2"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 3 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-penguinWatch/Step2.jpeg"
                                            alt="Step 3"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 4 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-penguinWatch/Step3.jpeg"
                                            alt="Step 4"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 5 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-penguinWatch/Step4.jpeg"
                                            alt="Step 5"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                </div>
                            )}

                            {line < 5 && (
                                <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Next
                                </button>
                            )}
                            {line === 5 && (
                                <button onClick={nextPart} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Continue
                                </button>
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
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className="relative">
                                <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0">
                                    <div className="bg-white bg-opacity-90">
                                        <img
                                            src={imageUrl}
                                            alt="Penguin Image"
                                            className="w-full h-96 object-cover rounded-t-md"
                                        />
                                    </div>                                    
                                </div>
                                <ClassificationForm
                                    anomalyId={anomalyId}
                                    anomalyType="zoodex-penguinWatch"
                                    missionNumber={200000010}
                                    assetMentioned={imageUrl}
                                />
                            </div>   
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export function PenguinWatch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [hasMission200000010, setHasMission200000010] = useState<boolean | null>(null);
    const [missionLoading, setMissionLoading] = useState<boolean>(true);

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
                    .eq("anomalySet", 'zoodex-penguinWatch');
    
                if (anomalyError) {
                    throw anomalyError;
                };
    
                if (!anomalyData || anomalyData.length === 0) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };
    
                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);
    
                // Set the imageUrl after selecting the anomaly
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const anomalyImageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-penguinWatch/${randomAnomaly.id}.jpeg`;
                setImageUrl(anomalyImageUrl);  // Set the image URL state here
            } catch (error: any) {
                console.error('Error fetching penguins: ', error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };
    
        fetchAnomaly();
    }, [session, supabase, activePlanet]);
    

    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;

            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", "200000010");

                if (missionError) throw missionError;

                setHasMission200000010(missionData.length > 0);
            } catch (error: any) {
                console.error("Error checking user mission: ", error.message || error);
                setHasMission200000010(false);
            } finally {
                setMissionLoading(false);
            };
        };

        checkTutorialMission();
    }, [session, supabase]);

    if (missionLoading) {
        return (
            <div>
                Loading mission status...
            </div>
        );
    };

    if (!hasMission200000010) {
        return (
            <PenguinWatchTutorial anomalyId={anomaly?.id.toString() || "47279235"} />
        );
    };

    if (loading) {
        return (
            <div className="mb-1">
                <p>
                    Loading...
                </p>
            </div>
        );
    };

    if (!anomaly) {
        return (
            <div>
                <p>The penguins are sleeping, try again later</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="pb-4 rounded-md relative w-full">
                {imageUrl && (
                    <img src={imageUrl} alt={anomaly.content} className="w-full h-64 object-cover" />
                )}
                <ClassificationForm
                    anomalyId={anomaly.id.toString()}
                    anomalyType="zoodex-penguinWatch"
                    missionNumber={2000000102}
                    assetMentioned={imageUrl || ""}
                    originatingStructure={3104}
                />
            </div>
        </div>
    );
};