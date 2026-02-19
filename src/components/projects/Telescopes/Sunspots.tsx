"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
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
    const supabase = useSupabaseClient();
    const session = useSession(); 
    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyId}.png`;
    const [showClassification, setShowClassification] = useState(false);

    // Tutorial slides for Sunspot Detection
    const tutorialSlides = createTutorialSlides([
        {
            title: "Sunspot Classification",
            text: "Hello, and welcome to the Sunspot Classification"
        },
        {
            title: "Counting Sunspots",
            text: "You will be shown small subsets of the sunspot drawings and you would have to input the number of spots you see in the text box below",
            image: "/assets/Docs/Telescopes/Sunspots/Step1.png"
        },
        {
            title: "What Counts as Spots",
            text: "For this exercise, as spots we refer to all dark markings made by the observer to represent a solar feature. That includes small dots, like the ones shown on the right side of this image, but also bigger structures like the one on the left. In this example one should count 6 spots as marked on the right panel.",
            image: "/assets/Docs/Telescopes/Sunspots/Step2.png"
        },
        {
            title: "Image Sizes",
            text: "The image sizes vary significantly because each includes only a single group of sunspots. You do not need to zoom in the images to search for smaller features, as these would only be smudges.",
            image: "/assets/Docs/Telescopes/Sunspots/Step3.png"
        },
        {
            title: "Avoiding False Spots",
            text: "Pay attention to not count as spots the various lines, writings, and smudges that these images have",
            image: "/assets/Docs/Telescopes/Sunspots/Step4.png"
        },
        {
            title: "Ready to Start!",
            text: "Let's get started with counting sunspots!"
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
    const supabase = useSupabaseClient();
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
                    const { data: anomalyData, error: anomalyError } = await supabase
                        .from("anomalies")
                        .select("*")
                        .eq("id", anomalyId)
                        .single();

                    if (anomalyError) throw anomalyError;

                    if (anomalyData) {
                        setAnomaly(anomalyData);
                        setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${anomalyData.id}.png`);
                    }
                } else {
                    // Fetch user's linked anomaly
                    const { data: linkedData, error: linkedError } = await supabase
                        .from("linked_anomalies")
                        .select("*, anomalies(*)")
                        .eq("author", session.user.id)
                        .eq("anomalies.anomalySet", "telescope-sunspots")
                        .limit(1)
                        .single();

                    if (linkedError) throw linkedError;

                    if (linkedData?.anomalies) {
                        setLinkedRow(linkedData);
                        setAnomaly(linkedData.anomalies);
                        setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-sunspots/${linkedData.anomalies.id}.png`);
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
    }, [session, anomalyId, supabase]);

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