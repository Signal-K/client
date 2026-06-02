"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useActivePlanet } from "@/src/lib/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import ImageAnnotator from "../(classifications)/Annotating/AnnotatorView";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

interface SelectedAnomalyProps {
    anomalyid: number;
};

interface TelescopeProps {
    anomalyId: string;
};

const SunspotDetectorTutorial: React.FC<TelescopeProps> = ({
    anomalyId,
}) => {
    const session = useSession(); 
    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyId}.png`;
    const [showClassification, setShowClassification] = useState(false);

    const tutorialSlides = createTutorialSlides([
        {
            title: "Data Protocol",
            text: "Solar observation analysis interface."
        },
        {
            title: "Metric: Sunspot Count",
            text: "Analyze subsets of solar imagery. Input the total count of identified sunspot formations in the provided field.",
            image: "/assets/Docs/Telescopes/Sunspots/Step1.webp"
        },
        {
            title: "Feature Identification",
            text: "Identify all dark markings representing solar features. This includes high-density clusters and smaller discrete formations. Example: 6 formations identified in the reference panel.",
            image: "/assets/Docs/Telescopes/Sunspots/Step2.webp"
        },
        {
            title: "Scaling Parameters",
            text: "Image dimensions vary based on the specific formation group. Zoom is generally not required for identifying primary features.",
            image: "/assets/Docs/Telescopes/Sunspots/Step3.webp"
        },
        {
            title: "Signal Noise",
            text: "Disregard artifacts, annotations, and processing smudges. Focus exclusively on magnetic activity signatures.",
            image: "/assets/Docs/Telescopes/Sunspots/Step4.webp"
        },
        {
            title: "Initialization",
            text: "Tutorial complete. Initialize sunspot classification protocol."
        }
    ]);

    const handleTutorialComplete = () => {
        setShowClassification(true);
    };

    return (
        <div className="rounded-lg">
            {/* Tutorial Component */}
            <TutorialContentBlock
                classificationtype="sunspot"
                slides={tutorialSlides}
                onComplete={handleTutorialComplete}
                title="Sunspot Detection Training"
                description="Learn to identify and count sunspots in solar observations"
            />

            {/* Classification Interface - shown after tutorial or for returning users */}
            {showClassification && (
                <div className="flex flex-col items-center">
                    <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <div className="relative">
                            <div className=" absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                            <div className="bg-white bg-opacity-90">
                                <img
                                    src={imageUrl}
                                    alt="Sunspot"
                                    className="relative z-10 w-128 h-128 object-contain"
                                />
                            </div>
                        </div>
                        <ClassificationForm anomalyId={anomalyId} anomalyType='sunspot' missionNumber={3000003} assetMentioned={imageUrl} />
                    </div>
                </div>
            )}
        </div>
    );
};

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};

export function StarterSunspot({ anomalyId }: { anomalyId?: string }) {
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [linkedRow, setLinkedRow] = useState<any | null>(null);
    const [unlocking, setUnlocking] = useState(false);
    const [now, setNow] = useState<Date>(new Date());

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const automatonType = "TelescopeSolar";

    useEffect(() => {
        async function fetchData() {
            if (!session) {
                setLoading(false);
                return;
            }
            try {
                // If anomalyId is provided, fetch that anomaly directly
                if (anomalyId) {
                    const anomalyRes = await fetch(`/api/gameplay/anomalies?id=${encodeURIComponent(anomalyId)}&limit=1`);
                    const anomalyPayload = await anomalyRes.json();
                    if (!anomalyRes.ok || !anomalyPayload?.anomalies?.[0]) {
                      throw new Error(anomalyPayload?.error || "Anomaly not found");
                    }
                    const anomalyData = anomalyPayload.anomalies[0];

                    if (anomalyData) {
                        setAnomaly(anomalyData);
                        setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyData.id}.png`);
                    }
                } else {
                    const anomalyRes = await fetch(
                      `/api/gameplay/anomalies?anomalySet=telescope-sunspots&limit=1`
                    );
                    const anomalyPayload = await anomalyRes.json();
                    if (!anomalyRes.ok || !anomalyPayload?.anomalies?.[0]) {
                      throw new Error(anomalyPayload?.error || "No sunspots available");
                    }
                    const anomalyData = anomalyPayload.anomalies[0];
                    if (anomalyData) {
                        setAnomaly(anomalyData);
                        setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyData.id}.png`);
                    }
                }
            } catch (error: any) {
                console.error("Error fetching sunspot data:", error.message);
                setError(error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [session, anomalyId]);

    if (loading) {
        return <div className="text-white p-4">Loading sunspot data...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="w-full h-screen bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="container mx-auto px-4 py-8 h-full flex flex-col">
                {showTutorial ? (
                    <div className="flex-1 overflow-y-auto">
                        <SunspotDetectorTutorial anomalyId={anomaly?.id.toString() || ""} />
                    </div>
                ) : (
                    anomaly && imageUrl ? (
                        <div className="flex-1 overflow-y-auto">
                            <ImageAnnotator
                                initialImageUrl={imageUrl}
                                anomalyId={anomaly.id.toString()}
                                anomalyType="sunspot"
                                assetMentioned={imageUrl}
                                structureItemId={3103}
                                missionNumber={5055655555}
                                annotationType="Sunspots"
                            />
                        </div>
                    ) : (
                        <div className="text-white p-4">No sunspots available now</div>
                    )
                )}
            </div>
        </div>
    );
}
