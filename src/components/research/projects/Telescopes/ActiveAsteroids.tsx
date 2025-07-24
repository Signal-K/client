'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "@/src/components/ui/button";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

interface Props {
    anomalyid: number | bigint;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function StarterActiveAsteroids({ anomalyid }: Props) {
    const [part, setPart] = useState<number>(1);
    const [line, setLine] = useState<number>(1);
    const nextLine = () => setLine(prev => prev + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    const imageUrls = [
        "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step0.jpeg",
        "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step1.png",
        "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step2.gif",
        "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step3.gif",
        "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step.png",
        "/assets/Docs/Telescopes/DailyMinorPlanet/ActiveAsteroids/Step.png"
    ];

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-active-asteroids/${anomalyid}.png`;

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>

                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Solar system bodies like asteroids or comets are considered <em>active</em> when they show a tail or <em>coma</em> — a cloud of dust and gas. These features reveal where ices exist throughout the solar system and may even hint at how Earth got its water.
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    Each image contains one <strong>object of interest</strong> centered in the frame. Classify the object as <strong>hot</strong> (if it has a tail or cloud) or <strong>not</strong> (if it doesn't).
                                    <br />
                                    <em>Left:</em> A tail is visible at 7 o’clock — this is <strong>hot</strong>.
                                    <br />
                                    <em>Right:</em> The object isn’t visible — this is <strong>not</strong> active.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    This image shows a classic comet tail, highlighted by blinking arrows.
                                    <br />
                                    Tails can vary a lot — they might be long, faint, split in multiple directions, or barely visible.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    This is a coma — a diffuse cloud of gas and dust. It's often a fuzzy shell or smudge. Some comae are directional, and you may even see more than one in the same image.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    Be cautious! Sometimes other effects can look like activity but aren't. Classify these as <strong>not active</strong>:
                                    <ol className="list-decimal ml-6 mt-2 space-y-1">
                                        <li>Streaked images from telescope movement.</li>
                                        <li>Wooly textures caused by clouds.</li>
                                        <li>Light scatter like sun rays.</li>
                                        <li>Overlapping objects — stars, galaxies, etc.</li>
                                        <li>Cosmic rays — thin, dark lines.</li>
                                        <li>Bright halos from the telescope mirror.</li>
                                    </ol>
                                    More examples are in the Field Guide.
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    Sometimes there's nothing in the center. This may mean the object is too faint or poorly tracked. These should be classified as <strong>not active</strong>. If something catches your eye — like a fuzzy blob — you can always bring it up in Talk!
                                </p>
                            )}
                            {line === 7 && (
                                <p className="text-[#EEEAD1]">
                                    You're all set! Let's get started with identifying activity in asteroid images.
                                </p>
                            )}

                            {line < 7 && (
                                <>
                                    <div className="flex justify-center mt-4 w-full h-64">
                                        <img
                                            src={imageUrls[line - 1]}
                                            alt={`Step ${line}`}
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={nextLine}
                                        className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                                    >
                                        Next
                                    </button>
                                </>
                            )}

                            {line === 7 && (
                                <button
                                    onClick={nextPart}
                                    className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded"
                                >
                                    Continue
                                </button>
                            )}
                        </>
                    )}

                    {part === 2 && (
                        <p className="text-[#EEEAD1]">
                            Great job! You can now start classifying asteroid images.
                        </p>
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
                    <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <div className="relative">
                            <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                            <div className="bg-white bg-opacity-90">
                                <img
                                    src="/assets/"
                                    alt="Asteroid"
                                    className="relative z-10 w-128 h-128 object-contain"
                                />
                            </div>
                        </div>
                        {/* <ClassificationForm
                            anomalyId={anomalyid.toString()}
                            anomalyType="active-asteroid"
                            assetMentioned={imageUrl}
                        /> */}
                        <ImageAnnotator
                            initialImageUrl={imageUrl}
                            anomalyId={anomalyid.toString()}
                            anomalyType="active-asteroid"
                            assetMentioned={imageUrl}
                            structureItemId={3103}
                            annotationType="AA"
                        />
                    </div>
                )}
            </div>
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
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "active-asteroids")

                if (anomalyError) {
                    throw anomalyError;
                    setLoading(false);
                    return;
                };

                if (!anomalyData || anomalyData.length === 0) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                }
                
                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);                
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-active-asteroids/${randomAnomaly.id}.png`);
            } catch (err: any) {
                console.error("Error fetching asteroid anomaly asset: ", err.message);
                setAnomaly(null);
                setLoading(false);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [session]);

    if (loading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    };

    if (!anomaly) {
        return (
            <div>
                <p>No active asteroids available</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="w-full flex justify-start">
                <Button variant="outline" onClick={() => setShowTutorial(prev => !prev)}>
                    {showTutorial ? "Hide Tutorial" : "View Tutorial"}
                </Button>
            </div>

            <div className="p-4 rounded-md relative w-full">
                {showTutorial ? (
                    <StarterActiveAsteroids anomalyid={parseInt(anomaly.id)} />
                ) : (
                    imageUrl && (
                        <ImageAnnotator
                            initialImageUrl={imageUrl}
                            anomalyId={anomaly.id.toString()}
                            anomalyType="active-asteroid"
                            assetMentioned={imageUrl}
                            structureItemId={3103}
                            annotationType="AA"
                        />
                    )
                )}
            </div>
        </div>
    );
};