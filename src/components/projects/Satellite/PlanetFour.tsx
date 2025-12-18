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
    const supabase = useSupabaseClient();
    const session = useSession();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/satellite-planetFour/${anomalyid}.jpeg`;
    const [showClassification, setShowClassification] = useState(false);
    const [checkingTutorialStatus, setCheckingTutorialStatus] = useState(true);
    const [showTutorialButton, setShowTutorialButton] = useState(false);

    // Check if user has completed this classification type before
    useEffect(() => {
        const checkIfReturningUser = async () => {
            if (!session?.user?.id) {
                setCheckingTutorialStatus(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('classifications')
                    .select('id')
                    .eq('author', session.user.id)
                    .eq('classificationtype', 'satellite-planetFour')
                    .limit(1);

                if (error) {
                    console.error('Error checking classification history:', error);
                } else {
                    // If user has classifications, skip tutorial and show classification interface
                    const hasClassified = data && data.length > 0;
                    setShowClassification(hasClassified);
                }
            } catch (error) {
                console.error('Error in tutorial status check:', error);
            } finally {
                setCheckingTutorialStatus(false);
            }
        };

        checkIfReturningUser();
    }, [session, supabase]);

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

    if (checkingTutorialStatus) {
        return <div className="text-center p-8">Loading...</div>;
    }

    return (
        <div className="rounded-lg">
            {/* Show Tutorial Button for returning users */}
            {showClassification && !showTutorialButton && (
                <div className="mb-4">
                    <Button 
                        onClick={() => setShowTutorialButton(true)} 
                        variant="default"
                        size="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        📚 Show Tutorial
                    </Button>
                </div>
            )}

            {/* Tutorial Component - for returning users clicking the button */}
            {showTutorialButton && (
                <div className="mb-4 p-4 bg-[#1D2833]/90 rounded-lg border border-blue-500/50">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-white">Planet Four Tutorial</h3>
                        <Button 
                            onClick={() => setShowTutorialButton(false)} 
                            variant="outline"
                            size="sm"
                            className="text-white"
                        >
                            ✕ Close Tutorial
                        </Button>
                    </div>
                    <TutorialContentBlock
                        classificationtype="satellite-planetFour"
                        slides={tutorialSlides}
                        forceShow={true}
                        onComplete={() => {
                            setShowClassification(true);
                            setShowTutorialButton(false);
                        }}
                        onSkip={() => setShowTutorialButton(false)}
                        title="Planet Four Training"
                        description="Learn to analyze surface formations on planetary images"
                    />
                </div>
            )}

            {/* Tutorial Component - for first-time users */}
            {!showClassification && !showTutorialButton && (
                <TutorialContentBlock
                    classificationtype="satellite-planetFour"
                    slides={tutorialSlides}
                    onComplete={handleTutorialComplete}
                    title="Planet Four Training"
                    description="Learn to analyze surface formations on planetary images"
                />
            )}

            {/* Classification Interface - shown after tutorial or for returning users */}
            {showClassification && !showTutorialButton && (
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
                                onClassificationComplete={async () => {
                                    if (!session) return;

                                    try {
                                        const { 
                                            attemptMineralDepositCreation, 
                                            selectPlanetFourMineral 
                                        } = await import("@/src/utils/mineralDepositCreation");

                                        const { data: recentClassification } = await supabase
                                            .from("classifications")
                                            .select("id, classificationConfiguration")
                                            .eq("author", session.user.id)
                                            .eq("anomaly", parseInt(anomalyid.toString()))
                                            .eq("classificationtype", "satellite-planetFour")
                                            .order("created_at", { ascending: false })
                                            .limit(1)
                                            .single();

                                        if (recentClassification) {
                                            // Extract annotations from classification config if available
                                            let annotations;
                                            try {
                                                const config = typeof recentClassification.classificationConfiguration === 'string'
                                                    ? JSON.parse(recentClassification.classificationConfiguration)
                                                    : recentClassification.classificationConfiguration;
                                                annotations = config?.annotationOptions || [];
                                            } catch (e) {
                                                annotations = [];
                                            }

                                            const mineralConfig = selectPlanetFourMineral(annotations);
                                            const depositCreated = await attemptMineralDepositCreation({
                                                supabase,
                                                userId: session.user.id,
                                                anomalyId: parseInt(anomalyid.toString()),
                                                classificationId: recentClassification.id,
                                                mineralConfig,
                                                location: `Surface feature at anomaly ${anomalyid}`
                                            });

                                            if (depositCreated) {
                                                // mineral deposit created
                                            }
                                        }
                                    } catch (error) {
                                        console.error("[Planet Four] Error in mineral deposit creation:", error);
                                    }
                                }}
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
    const [hasMineralResearch, setHasMineralResearch] = useState<boolean>(false);

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

    useEffect(() => {
        async function checkMineralResearch() {
            if (!session) return;

            try {
                const { data } = await supabase
                    .from("inventory")
                    .select("id")
                    .eq("owner", session.user.id)
                    .eq("item", 3103)
                    .maybeSingle();

                setHasMineralResearch(!!data);
            } catch (error) {
                console.error("Error checking mineral research:", error);
            }
        }

        checkMineralResearch();
    }, [session, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!anomaly) {
        return <div>No anomaly found. Please try again later or contact support if this issue persists.</div>;
    }

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full rounded-lg overflow-x-hidden">
            <Button onClick={startTutorial} variant="outline">
                Show Tutorial
            </Button>

            {showTutorial && <StarterPlanetFour anomalyid={Number(anomaly.id)} />}

            {imageUrl && !showTutorial && (
                <>
                    {hasMineralResearch && (
                        <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-blue-800 font-medium">Mineral Discovery Active (33% chance per classification)</span>
                        </div>
                    )}
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
                            onClassificationComplete={async () => {
                                if (!session || !anomaly) return;

                                try {
                                    const { 
                                        attemptMineralDepositCreation, 
                                        selectPlanetFourMineral 
                                    } = await import("@/src/utils/mineralDepositCreation");

                                    const { data: recentClassification } = await supabase
                                        .from("classifications")
                                        .select("id, classificationConfiguration")
                                        .eq("author", session.user.id)
                                        .eq("anomaly", parseInt(anomaly.id.toString()))
                                        .eq("classificationtype", "satellite-planetFour")
                                        .order("created_at", { ascending: false })
                                        .limit(1)
                                        .single();

                                    if (recentClassification) {
                                        let annotations;
                                        try {
                                            const config = typeof recentClassification.classificationConfiguration === 'string'
                                                ? JSON.parse(recentClassification.classificationConfiguration)
                                                : recentClassification.classificationConfiguration;
                                            annotations = config?.annotationOptions || [];
                                        } catch (e) {
                                            annotations = [];
                                        }

                                        const mineralConfig = selectPlanetFourMineral(annotations);
                                        const depositCreated = await attemptMineralDepositCreation({
                                            supabase,
                                            userId: session.user.id,
                                            anomalyId: parseInt(anomaly.id.toString()),
                                            classificationId: recentClassification.id,
                                            mineralConfig,
                                            location: `Surface feature at anomaly ${anomaly.id}`
                                        });

                                        if (depositCreated) {
                                            console.log(`[Planet Four] Created ${mineralConfig.type} deposit!`);
                                        }
                                    }
                                } catch (error) {
                                    console.error("[Planet Four] Error in mineral deposit creation:", error);
                                }
                            }}
                        />
                    </div>
                </div>
                </>
            )}
        </div>
    );
};