"use client";

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

interface Props {
    anomalyid: number | bigint;
};

type AnomalyRecord = {
    id: number;
    anomalySet: string;
    content: string | null;
};

type LinkedAnomaly = {
    id: number;
    anomaly_id: number;
    classification_id: number | null;
    anomalies: AnomalyRecord[];
};

type Anomaly = AnomalyRecord;

interface SelectedAnomProps {
    anomalyid?: number;
    parentClassificationId?: number;
}; 

export function AiForMarsProjectWithID({ anomalyid }: { anomalyid?: number }) {
    const supabase = useSupabaseClient();
    const [anomaly, setAnomaly] = useState<AnomalyRecord | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!anomalyid) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("id", anomalyid)
                    .single();

                if (error) throw error;
                setAnomaly(data);
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/automaton-ai4Mars/${data.id}.jpeg`);
            } catch (err: any) {
                console.error("Error fetching anomaly:", err.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        }
        fetchAnomaly();
    }, [anomalyid, supabase]);

    if (loading) return <p>Loading...</p>;
    if (!anomaly || !imageUrl) {
        return (
            <div>
                <p>No anomaly found.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E5EEF4] to-[#D8E5EC] px-4 py-6 overflow-hidden">
            
            <div className="w-full max-w-4xl h-full flex flex-col rounded-xl bg-white shadow-lg p-4 overflow-hidden">
                <ImageAnnotator 
                    anomalyId={anomalyid?.toString()}
                    initialImageUrl={imageUrl || ''}
                    annotationType="AI4M"
                />
            </div>
        </div>
    );
}

export function AiForMarsProject({
    anomalyid,
    parentClassificationId,
}: SelectedAnomProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnomaly = async () => {
        if (!session || !anomalyid) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("linked_anomalies")
                .select(`
                    id,
                    anomaly_id,
                    anomalies (
                        id,
                        anomalySet,
                        content
                    )
                `)
                .eq("author", session.user.id)
                .eq("anomaly_id", anomalyid)
                .filter("anomalies.anomalySet", "eq", "automaton-aiForMars")
                .maybeSingle();

            if (error) throw error;

                if (data?.anomalies && Array.isArray(data.anomalies) && data.anomalies.length > 0) {
                setAnomaly(data.anomalies[0] as Anomaly);
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/automaton-ai4Mars/${data.anomalies[0].id}.jpeg`);
            } else {
                setAnomaly(null);
                setImageUrl(null);
            }
        } catch (error: any) {
            console.error("Error fetching anomaly:", error.message);
            setAnomaly(null);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Easily removable fallback function
    const __DEV_FALLBACK_fetchFromAnomaliesTable = async (id: number) => {
        try {
            const { data, error } = await supabase
                .from("anomalies")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setAnomaly(data);
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/automaton-ai4Mars/${data.id}.jpeg`);
        } catch (err: any) {
            console.error("DEV fallback error:", err.message);
        }
    };

    useEffect(() => {
        fetchAnomaly();
    }, [session, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!anomaly) {
        return <div>No anomaly found.</div>;
    }

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg overflow-x-hidden">
            <Button onClick={startTutorial} variant="outline">
                Show Tutorial
            </Button>
            
            <ImageAnnotator 
                anomalyId={anomalyid?.toString()}
                initialImageUrl={imageUrl || ''}
                annotationType="AI4M"
            />
        </div>
    );
};

export function StarterAiForMars({ anomalyid }: Props) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/automaton-ai4Mars/${anomalyid}.jpeg`;
    const [showClassification, setShowClassification] = useState(false);

    // Tutorial slides for AI4Mars
    const tutorialSlides = createTutorialSlides([
        {
            title: "AI for Mars - Rover Safety",
            text: "You can help to improve rover performance & safety by labeling images from your rovers. You will see a series of images taken on your planet - label what you see and any landmarks that are visible.",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step1.jpeg"
        },
        {
            title: "Sand Classification",
            text: "Sand - Look for areas with fine, powdery dust, often with visible ripples. Sand is slippery for rovers and leaves deep wheel tracks. Ignore small sand patches narrower than 20-50 cm based on the trapezoid marker.",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step2.png"
        },
        {
            title: "Soil Classification",
            text: "Soil - Soil is cohesive and may have small gravel. The rover can drive on it without much slip, leaving light wheel tracks. It looks more compact and smooth compared to sand.",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step3.png"
        },
        {
            title: "Bedrock Classification",
            text: "Bedrock - Bedrock appears as large, solid, often cracked plates. It's a stable surface for the rover and easily distinguishable from sand or soil. Large flat rocks form the base.",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step4.png"
        },
        {
            title: "Large Objects",
            text: "Larger objects - Big rocks are larger than the trapezoid (20-50 cm) and act as obstacles for the rover. Avoid overlapping these with other labels since they're distinct hazards.",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step5.png"
        },
        {
            title: "Distance Guidelines",
            text: "Ignore terrain further than 30 meters, as it is too far to classify. Dark areas in the distance usually indicate this.",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step6.png"
        },
        {
            title: "Ready to Start!",
            text: "Now you're ready to help improve rover safety by classifying terrain features. Let's get started!",
            image: "/assets/Docs/Automatons/automatons-ai4Mars/Step7.jpeg"
        }
    ]);

    const handleTutorialComplete = () => {
        setShowClassification(true);
    };

    return (
        <div className="rounded-lg">
            {/* Tutorial Component */}
            <TutorialContentBlock
                classificationtype="automaton-aiForMars"
                slides={tutorialSlides}
                onComplete={handleTutorialComplete}
                title="AI for Mars Training"
                description="Learn to identify terrain features for rover navigation"
            />

            {/* Classification Interface - shown after tutorial or for returning users */}
            {showClassification && (
                <div className="flex flex-col items-center">
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
                </div>
            )}
        </div>
    );
};