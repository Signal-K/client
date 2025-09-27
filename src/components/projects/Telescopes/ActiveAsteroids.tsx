'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "@/src/components/ui/button";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

interface Props {
    anomalyid: number | bigint;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function StarterActiveAsteroids({ anomalyid }: Props) {
    const [showClassification, setShowClassification] = useState(false);

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-active-asteroids/${anomalyid}.png`;

    // Tutorial slides for Active Asteroids
    const tutorialSlides = createTutorialSlides([
        {
            title: "Active Asteroids - Finding Tails and Comas",
            text: "Solar system bodies like asteroids or comets are considered active when they show a tail or coma — a cloud of dust and gas. These features reveal where ices exist throughout the solar system and may even hint at how Earth got its water.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step0.jpeg"
        },
        {
            title: "Classifying Activity",
            text: "Each image contains one object of interest centered in the frame. Classify the object as hot (if it has a tail or cloud) or not (if it doesn't). Left: A tail is visible at 7 o'clock — this is hot. Right: The object isn't visible — this is not active.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step1.png"
        },
        {
            title: "Identifying Tails",
            text: "This image shows a classic comet tail, highlighted by blinking arrows. Tails can vary a lot — they might be long, faint, split in multiple directions, or barely visible.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step2.gif"
        },
        {
            title: "Identifying Comas",
            text: "This is a coma — a diffuse cloud of gas and dust. It's often a fuzzy shell or smudge. Some comae are directional, and you may even see more than one in the same image.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step3.gif"
        },
        {
            title: "Avoid False Positives",
            text: "Be cautious! Sometimes other effects can look like activity but aren't. Classify these as not active: 1) Streaked images from telescope movement 2) Wooly textures caused by clouds 3) Light scatter like sun rays 4) Overlapping objects — stars, galaxies, etc. 5) Cosmic rays — thin, dark lines 6) Bright halos from the telescope mirror. More examples are in the Field Guide.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step.png"
        },
        {
            title: "Empty Centers",
            text: "Sometimes there's nothing in the center. This may mean the object is too faint or poorly tracked. These should be classified as not active. If something catches your eye — like a fuzzy blob — you can always bring it up in Talk!",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step.png"
        },
        {
            title: "Ready to Start!",
            text: "You're all set! Let's get started with identifying activity in asteroid images.",
            image: "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step0.jpeg"
        }
    ]);

    const handleTutorialComplete = () => {
        setShowClassification(true);
    };

    return (
        <div className="rounded-lg">
            {/* Tutorial Component */}
            <TutorialContentBlock
                classificationtype="active-asteroid"
                slides={tutorialSlides}
                onComplete={handleTutorialComplete}
                title="Active Asteroids Training"
                description="Learn to identify tails and comas in asteroid images"
            />

            {/* Classification Interface - shown after tutorial or for returning users */}
            {showClassification && (
                <div className="flex flex-col items-center">
                    <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <div className="relative">
                            <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                            <div className="bg-white bg-opacity-90">
                                <img
                                    src={imageUrl}
                                    alt="Asteroid"
                                    className="relative z-10 w-128 h-128 object-contain"
                                />
                            </div>
                        </div>
                        <ImageAnnotator
                            initialImageUrl={imageUrl}
                            anomalyId={anomalyid.toString()}
                            anomalyType="active-asteroid"
                            assetMentioned={imageUrl}
                            structureItemId={3103}
                            annotationType="AA"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

type Anomaly = {
    id: string;
    name: string;
    details?: string;
};

export function ActiveAsteroidWithId() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    const [loading, setLoading] = useState<boolean | null>(true);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            };

            try {
                const {
                    data: anomalyData,
                    error: anomalyError,
                } = await supabase
                    .from('anomalies')
                    .select("*")
                    .eq("author", session.user.id)
                    .eq("anomalySet", "telescope-active-asteroids")
                    .limit(1)
                    .maybeSingle();

                if (anomalyError) {
                    throw anomalyError;
                };

                if (anomalyData) {
                    setAnomaly(anomalyData);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-active-asteroids/${anomalyData.id}.png`);
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
    };

    if (!anomaly) {
        return <div>No anomaly found. Please try again later or contact support if this issue persists.</div>
    };

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg overflow-x-hidden">
            <Button onClick={startTutorial} variant="outline">
                Show Tutorial
            </Button>

            {showTutorial && <StarterActiveAsteroids anomalyid={Number(anomaly.id)} />}

            {imageUrl && (
                <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                    <div className="relative">
                        <div className='absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                        <div className="bg-white bg-opacity-90">
                            <img
                                src={imageUrl}
                                alt="Active asteroid candidate"
                                className="relative z-10 w-128 h-128 object-contain"
                            />
                        </div>
                    </div>
                    <ImageAnnotator
                        initialImageUrl={imageUrl}
                        anomalyId={anomaly.id}
                        anomalyType="active-asteroid"
                        assetMentioned={imageUrl}
                        structureItemId={3103}
                        annotationType="AA"
                    />
                </div>
            )}
        </div>
    );
};