"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";

import { Anomaly } from "../Zoodex/ClassifyOthersAnimals";
// import ImageAnnotation from "../(classifications)/Annotation";
import * as markerjs2 from "markerjs2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
interface Props {
    anomalyid: number | bigint;
};

export function StarterPlanetFour({
    anomalyid
}: Props) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/satellite-planetFour/${anomalyid}.jpeg`;

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
                                    Welcome to P4 project. The images you're about to review come directly from the observation satellites orbiting your assigned planet. These satellites are critical for mapping the surface, assessing terrain, and collecting vital data to support future construction efforts on this planet and others like it.
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    In this region of the planet, unique surface formations are often observed due to geological and environmental factors. Your mission is to help analyze these formations. By classifying the surface features, you'll be providing invaluable data that will inform the development of infrastructure and scientific research for this planet.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    In these images, you'll encounter various surface patterns that result from processes like wind erosion, tectonic activity, and weather phenomena. Some of these patterns may indicate areas ideal for constructing future research stations or landing sites, while others may suggest potential resource deposits.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    To proceed, simply review the image and select the best classification from the options provided. Every classification you make brings us closer to building on this planet and establishing a foothold for exploration in the future.
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
                                    {line === 1 && <img src="/assets/Docs/Satellites/Planet-Four/Step1.jpeg" alt="Step 1" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 2 && <img src="/assets/Docs/Satellites/Planet-Four/Step2.jpeg" alt="Step 2" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 3 && <img src="/assets/Docs/Satellites/Planet-Four/Step3.jpeg" alt="Step 3" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 4 && <img src="/assets/Docs/Satellites/Planet-Four/Step6.jpeg" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
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
                    <div className="mb-1">
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
                                            alt="Planet Four"
                                            className="relative z-10 w-128 h-128 object-contain"
                                        />
                                    </div>
                                </div>
                                <ClassificationForm
                                    anomalyId={anomalyid.toString()}
                                    anomalyType="satellite-planetFour"
                                    missionNumber={20000005}
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

export function PlanetFourProject() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);
    const [hasMission20000005, setHasMission20000005] = useState(false);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;
    
            try {
                const { data: missionData, error: missionError } = await supabase
                    .from('missions')
                    .select('id')
                    .eq('user', session.user.id)
                    .eq('mission', '20000005')
                    .limit(1);
    
                if (missionError) {
                    console.error("Error fetching mission data:", missionError);
                    setHasMission20000005(false);
                } else {
                    const hasMission = missionData && missionData.length > 0;
                    setHasMission20000005(hasMission);
                }
            } catch (error) {
                console.error("Error checking user mission: ", error);
                setHasMission20000005(false);
            } finally {
                setLoading(false); 
            }
        };
    
        if (session) {
            checkTutorialMission();
        } else {
            setLoading(false); 
        }
    }, [session, supabase]);

    const handleShowTutorial = () => {
        setShowTutorial(true);
    };
    
    useEffect(() => {
        const fetchAnomaly = async () => {
            if (!hasMission20000005 || !session) return;
    
            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from('anomalies')
                    .select('*')
                    .eq('anomalySet', 'satellite-planetFour');
    
                if (anomalyError) throw anomalyError;
    
                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/satellite-planetFour/${randomAnomaly.id}.jpeg`);
            } catch (error: any) {
                console.error("Error fetching anomaly", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false); 
            }
        };
    
        if (hasMission20000005 && session) {
            fetchAnomaly();
        }
    }, [session, supabase, supabaseUrl, hasMission20000005]);
    
    if (loading) {
        return <div><p>Loading...</p></div>;
    };
    
    if (!hasMission20000005) {
        return <StarterPlanetFour anomalyid={83742405} />;
    };
    
    if (!anomaly) {
        return <div><p>No anomaly found.</p></div>;
    };
    
    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            {!showTutorial ? (
                <>
                    <div className="p-4 rounded-md relative w-full">
                        {imageUrl && (
                            <Card className="w-full max-w-3xl mx-auto">
                                <CardHeader>
                                    <CardTitle>Image</CardTitle>
                                    <CardDescription>Annotate the image using marker.js</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center py-10 space-y-4">
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <img
                                            src={imageUrl}
                                            alt="Annotation"
                                            crossOrigin="anonymous"
                                            className="max-w-full h-auto" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <Button
                        className="mb-4"
                        onClick={handleShowTutorial}
                    >
                        Show Tutorial
                    </Button>
                    {imageUrl && (
                        <ClassificationForm
                            anomalyId={anomaly?.id.toString() || ""}
                            anomalyType="satellite-planetFour"
                            missionNumber={200000052}
                            assetMentioned={imageUrl}
                            structureItemId={3103}
                        />
                    )}
                </>
            ) : (
                <div>
                    <StarterPlanetFour anomalyid={anomaly?.id} />
                </div>
            )}
        </div>
    );
};    