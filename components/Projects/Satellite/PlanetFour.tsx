"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";

import { Anomaly } from "../Zoodex/ClassifyOthersAnimals";
import ImageAnnotation from "../(classifications)/Annotation";
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
    );;
};

export function PlanetFourProject() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [missionLoading, setMissionLoading] = useState<boolean>(true);
    const [hasMission20000005, setHasMission20000005] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const [markerArea, setMarkerArea] = useState<markerjs2.MarkerArea | null>(null);
    const [annotationState, setAnnotationState] = useState<string | null>(null);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check for the mission
    useEffect(() => {
        const checkTutorialMission = async () => {
            if (!session) return;
            try {
                const { data: missionData, error: missionError } = await supabase
                    .from("missions")
                    .select("id")
                    .eq("user", session.user.id)
                    .eq("mission", 20000005)
                    .single();

                if (missionError) throw missionError;
                setHasMission20000005(!!missionData);
            } catch (error: any) {
                console.error("Error checking user mission: ", error.message || error);
                setHasMission20000005(false);
            } finally {
                setMissionLoading(false);
            }
        };

        checkTutorialMission();
    }, [session, supabase]);

    // Fetch anomaly data
    useEffect(() => {
        const fetchAnomaly = async () => {
            if (!hasMission20000005 || missionLoading || !session) return;

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

        fetchAnomaly();
    }, [hasMission20000005, missionLoading, session, supabase, supabaseUrl]);

    // Initialize MarkerArea
    useEffect(() => {
        if (imageRef.current) {
            const ma = new markerjs2.MarkerArea(imageRef.current);
            setMarkerArea(ma);

            ma.addEventListener("render", (event) => {
                if (imageRef.current) {
                    setAnnotationState(JSON.stringify(ma.getState()));
                    imageRef.current.src = event.dataUrl;
                }
            });

            ma.addEventListener("close", () => {
                setAnnotationState(JSON.stringify(ma.getState()));
            });
        }
    }, [imageUrl]); // Re-run this effect whenever the imageUrl changes

    // Early return after hooks are called
    if (loading) {
        return <div><p>Loading...</p></div>;
    }

    if (!anomaly) {
        return <div><p>No anomaly found.</p></div>;
    }

    const showMarkerArea = () => {
        console.log("Show Marker Area called");
        if (markerArea) {
            if (annotationState) {
                try {
                    markerArea.restoreState(JSON.parse(annotationState));
                } catch (error) {
                    console.error("Error restoring state: ", error);
                }
            }
            markerArea.show();
        } else {
            console.error("MarkerArea is not initialized");
        }
    };

    const downloadImage = () => {
        if (imageRef.current) {
            const dataUrl = imageRef.current.src;
            if (dataUrl.startsWith('data:image')) {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'annotated_image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('No base64 data to download');
            }
        }
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 rounded-md relative w-full">
                {imageUrl && (
                    <Card className="w-full max-w-3xl mx-auto">
                        <CardHeader>
                            <CardTitle>Image</CardTitle>
                            <CardDescription>Annotate the image using marker.js</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-10 space-y-4">
                            <div className="flex space-x-2">
                                <Button onClick={showMarkerArea}>Start Annotating</Button>
                                <Button onClick={downloadImage} disabled={!annotationState}>Download Annotated Image</Button>
                            </div>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <img
                                    ref={imageRef}
                                    src={imageUrl}
                                    alt="Annotation"
                                    crossOrigin="anonymous"
                                    className="max-w-full h-auto"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            {imageUrl && (
                <ClassificationForm
                    anomalyId={anomaly?.id.toString() || ""}
                    anomalyType="satellite-planetFour"
                    missionNumber={200000052}
                    assetMentioned={imageUrl}
                    structureItemId={3103}
                />
            )}
        </div>
    );
};