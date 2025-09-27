"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

interface Props {
    anomalyid: number | bigint;
}; 

interface Anomaly {
  id: number;
  content: string | null;
  anomalySet: string | null;
};

export function StarterPlanetFour({
    anomalyid
}: Props) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/satellite-planetFour/${anomalyid}.jpeg`;
    const [showClassification, setShowClassification] = useState(false);

    // Tutorial slides for Planet Four
    const tutorialSlides = createTutorialSlides([
        {
            title: "Welcome to Planet Four Project",
            text: "Welcome to P4 project. The images you're about to review come directly from the observation satellites orbiting your assigned planet. These satellites are critical for mapping the surface, assessing terrain, and collecting vital data to support future construction efforts on this planet and others like it.",
            image: "/assets/Docs/Satellites/Planet-Four/Step1.jpeg"
        },
        {
            title: "Surface Formation Analysis",
            text: "In this region of the planet, unique surface formations are often observed due to geological and environmental factors. Your mission is to help analyze these formations. By classifying the surface features, you'll be providing invaluable data that will inform the development of infrastructure and scientific research for this planet.",
            image: "/assets/Docs/Satellites/Planet-Four/Step2.jpeg"
        },
        {
            title: "Understanding Surface Patterns",
            text: "In these images, you'll encounter various surface patterns that result from processes like wind erosion, tectonic activity, and weather phenomena. Some of these patterns may indicate areas ideal for constructing future research stations or landing sites, while others may suggest potential resource deposits.",
            image: "/assets/Docs/Satellites/Planet-Four/Step3.jpeg"
        },
        {
            title: "Ready to Classify",
            text: "To proceed, simply review the image and select the best classification from the options provided. Every classification you make brings us closer to building on this planet and establishing a foothold for exploration in the future.",
            image: "/assets/Docs/Satellites/Planet-Four/Step6.jpeg"
        }
    ]);

    const handleTutorialComplete = () => {
        setShowClassification(true);
    };

    return (
        <div className="rounded-lg">
            {/* Tutorial Component */}
            <TutorialContentBlock
                classificationtype="satellite-planetFour"
                slides={tutorialSlides}
                onComplete={handleTutorialComplete}
                title="Planet Four Training"
                description="Learn to analyze surface formations on planetary images"
            />

            {/* Classification Interface - shown after tutorial or for returning users */}
            {showClassification && (
                <div className="flex flex-col items-center">
                    <div className="mb-2">
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className="relative">
                            <ImageAnnotator
                                className="h-full w-full"
                                initialImageUrl={imageUrl}
                                anomalyId={anomalyid.toString()}
                                anomalyType="satellite-planetFour"
                                assetMentioned={imageUrl}
                                structureItemId={3105}
                                parentPlanetLocation={anomalyid?.toString()}
                                annotationType="P4"
                            />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export function PlanetFourProject() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [parentClassificationId, setParentClassificationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            }

            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("author", session.user.id)
                    .eq("anomalySet", "satellite-planetFour")
                    .limit(1)
                    .maybeSingle();

                if (anomalyError) {
                    throw anomalyError;
                }

                if (anomalyData) {
                    setAnomaly(anomalyData);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/satellite-planetFour/${anomalyData.id}.jpeg`);
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
        }

        fetchAnomaly();
    }, [session, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!anomaly) {
        return <div>No anomaly found. Please try again later or contact support if this issue persists.</div>;
    }

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg overflow-x-hidden">
            <Button onClick={startTutorial} variant="outline">
                Show Tutorial
            </Button>

            {showTutorial && <StarterPlanetFour anomalyid={Number(anomaly.id)} />}

            {imageUrl && !showTutorial && (
                <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                    <div className="relative">
                        <ImageAnnotator
                            className="h-full w-full"
                            initialImageUrl={imageUrl}
                            anomalyId={anomaly.id.toString()}
                            anomalyType="satellite-planetFour"
                            assetMentioned={imageUrl}
                            structureItemId={3105}
                            parentPlanetLocation={anomaly.id.toString()}
                            annotationType="P4"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};