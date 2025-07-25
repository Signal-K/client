'use client';

import React, { useState, useEffect } from "react"; 
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";

import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
import { Button } from "@/components/ui/button";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 
type Anomaly = {
  id: number;
  anomalySet: string;
  content?: any;
};

interface Props {
    anomalyid: number;
};

export function StarterJovianVortexHunter({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyid}.png`;

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
                                    Welcome! In this workflow, you will be identifying the type of atmosphere feature visible in satellite images of gas giants in your network. The images you will see are cropped from your automated satellite data, and correspond to an area of ~7000x7000km on nearby gaseous planets.
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    There are four main categories that we are interested in. The first three (vortex, turbulent region and cloud bands) are discrete atmospheric features. The last option is for when the image either shows no large scale structure, or if it is unclear.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    A vortex is an atmospheric feature that is generally round/elliptical in shape. On Earth, an example is a hurricane/cyclone/typhoon. On gaseous planets, there are examples of both cyclones and anti-cyclones (spin in the opposite direction of cyclones), and they appear in a variety of sizes and colours. If you see any feature that has a compact oval shape, select this option.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    Turbulent features are ubiquitous on gas giants. These are cloud structures that don't have a definite shape, but form lots of curls and swirls. Sometimes these structures swirl inwards and appear to form vortices, as shown below. These images should be labelled with the vortices option and the turbulent region option.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    Sometimes, there are gradients in color that are mostly horizontal in direction. These are the separation between different cloud bands (usually near the equator). 
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    Sometimes, there might be no features of interest in the image. In this case, select the no visible structure option.
                                </p>
                            )}
                            {line === 7 && (
                                <p className="text-[#EEEAD1]">
                                    Don't forget that you can select multiple options. Now, let's get started!
                                </p>
                            )}

                            {line < 7 && (
                                <button
                                    className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                                    onClick={nextLine}
                                >
                                    Next
                                </button>
                            )}

                            {line === 7 && (
                                <button
                                    onClick={nextPart}
                                    className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                                >
                                    Continue
                                </button>
                            )}

                            {line < 8 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 1 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step1.png" alt="Step 1" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 2 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step2.png" alt="Step 2" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 3 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step3.png" alt="Step 3" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 4 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step4.png" alt="Step 4" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 5 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step5.png" alt="Step 5" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 6 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step6.png" alt="Step 6" className="mex-w-full max-h-full object-contain" />} 
                                    {line === 7 && <img src="/assets/Docs/Satellites/JovianVortexHunter/Step7.png" alt="Step 7" className="mex-w-full max-h-full object-contain" />} 
                                </div>
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
                                <div className=" absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                                <div className="bg-white bg-opacity-90">
                                    <img
                                        src={imageUrl}
                                        alt='Vortex'
                                        className="relative z-10 w-128 h-128 object-contain"
                                    />
                                </div>
                            </div>
                            <ClassificationForm
                                anomalyId={anomalyid.toString()}
                                anomalyType="lidar-jovianVortexHunter"
                                missionNumber={20000007}
                                assetMentioned={imageUrl}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export function LidarJVHSatelliteWithId() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [parentClassificationId, setParentClassificationId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    async function fetchAnomaly() {
        if (!session) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Try exact match first
            const { data: linkedAnomalies, error: linkedError } = await supabase
                .from("linked_anomalies")
                .select(`
                    id,
                    anomaly_id,
                    classification_id,
                    anomalies (
                        id,
                        anomalySet,
                        content
                    )
                `)
                .eq("author", session.user.id)
                .filter("anomalies.anomalySet", "eq", "lidar-jovianVortexHunter")
                .limit(1);

            if (linkedError) throw linkedError;

            let selectedAnomaly: Anomaly | null = null;
            let classificationId: number | null = null;

            if (linkedAnomalies && linkedAnomalies.length > 0 && linkedAnomalies[0].anomalies) {
                selectedAnomaly = linkedAnomalies[0].anomalies as unknown as Anomaly;
                classificationId = linkedAnomalies[0].classification_id;
                console.log("Using previously linked JVH anomaly:", selectedAnomaly.id);
            } else {
                // Try fallback: first linked anomaly with a classification_id
                const { data: fallbackLinked, error: fallbackLinkedError } = await supabase
                    .from("linked_anomalies")
                    .select(`
                        id,
                        anomaly_id,
                        classification_id,
                        anomalies (
                            id,
                            anomalySet,
                            content
                        )
                    `)
                    .eq("author", session.user.id)
                    .not("classification_id", "is", null)
                    .limit(1);

                if (fallbackLinkedError) throw fallbackLinkedError;

                if (fallbackLinked && fallbackLinked.length > 0 && fallbackLinked[0].anomalies) {
                    selectedAnomaly = fallbackLinked[0].anomalies as unknown as Anomaly;
                    classificationId = fallbackLinked[0].classification_id;
                    console.log("Using fallback linked JVH anomaly with classification_id:", selectedAnomaly.id);
                } else {
                    // Final fallback: random anomaly from the anomalySet
                    const { data: anomalies, error: fallbackError } = await supabase
                        .from("anomalies")
                        .select("*")
                        .eq("anomalySet", "lidar-jovianVortexHunter");

                    if (fallbackError) throw fallbackError;

                    if (!anomalies || anomalies.length === 0) {
                        console.error("No JVH anomalies available");
                        setAnomaly(null);
                        return;
                    }

                    const randomIndex = Math.floor(Math.random() * anomalies.length);
                    selectedAnomaly = anomalies[randomIndex] as Anomaly;
                    classificationId = null;
                    console.log("Using fallback JVH anomaly:", selectedAnomaly.id);
                }
            }

            if (!selectedAnomaly) {
                throw new Error("Anomaly selection failed");
            }

            setAnomaly(selectedAnomaly);
            setParentClassificationId(classificationId);
            setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${selectedAnomaly.id}.png`);
        } catch (error: any) {
            console.error("Error fetching JVH anomaly:", error.message);
            setAnomaly(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnomaly();
    }, [session]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!anomaly || !imageUrl) {
        return <p>No anomaly found.</p>;
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E5EEF4] to-[#D8E5EC] px-4 py-6 overflow-hidden">
            <div className="w-full max-w-4xl h-full flex flex-col rounded-xl bg-white shadow-lg p-4 overflow-hidden">
                <ImageAnnotator
                    anomalyId={anomaly.id.toString()}
                    anomalyType="lidar-jovianVortexHunter"
                    missionNumber={200000072}
                    assetMentioned={imageUrl}
                    structureItemId={3105}
                    initialImageUrl={imageUrl}
                    annotationType="JVH"
                    parentClassificationId={parentClassificationId ?? undefined}
                />
            </div>
        </div>
    );
};