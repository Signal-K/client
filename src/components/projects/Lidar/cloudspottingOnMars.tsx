"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import TutorialContentBlock, { createTutorialSlides, SCIENTIFIC_CONTEXTS } from "../TutorialContentBlock";

interface LidarProps { 
    anomalyId: string;
};

export const CloudspottingOnMarsTutorial: React.FC<LidarProps> = ({
    anomalyId
}) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/clouds/${anomalyId}.png`;
    const [showClassification, setShowClassification] = useState(false);

    // Enhanced tutorial slides with tips and quizzes
    const tutorialSlides = createTutorialSlides([
        {
            title: "Welcome to Cloudspotting on Mars! ☁️",
            text: "You're about to help NASA scientists study the Martian atmosphere! The Mars Climate Sounder on the Mars Reconnaissance Orbiter has captured incredible data about clouds high above the red planet, and we need your keen eyes to identify them.",
            tip: "Your classifications help scientists understand Martian weather patterns and track water and CO₂ in the atmosphere.",
        },
        {
            title: "The Mars Climate Sounder",
            text: "The Mars Climate Sounder (MCS) on NASA's Mars Reconnaissance Orbiter observes the atmosphere in the infrared to measure temperature, ice, and dust content. Its measurements reveal water-ice clouds and carbon-dioxide clouds at very high altitudes - sometimes over 80 km above the surface!",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step1.jpeg",
            tip: "These clouds are similar to Earth's noctilucent clouds, but they form from CO₂ and water ice instead of just water.",
        },
        {
            title: "Why Citizen Science?",
            text: "Clouds have been observed at Mars by various instruments on several orbiters and rovers. But there are SO many clouds that no single researcher could possibly find them all! With your help, tens of thousands of cloud arches can be identified, creating a complete picture of Martian atmospheric dynamics.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step2.png",
            quiz: {
                question: "Why do we need citizen scientists to identify Mars clouds?",
                options: [
                    "The images are too blurry for computers",
                    "There are too many images for researchers to analyze alone",
                    "NASA doesn't have any scientists",
                    "The clouds are invisible to machines"
                ],
                correctIndex: 1,
                explanation: "Correct! There are thousands of observations, and human pattern recognition combined with many volunteers helps identify features that might otherwise be missed.",
            },
        },
        {
            title: "Understanding Cloud Arches",
            text: "As the spacecraft moves through its orbit, clouds appear to rise from behind the atmosphere to a higher altitude and then fall again. This creates a distinctive arch-like shape in the data. The peak of the arch marks the real location of the cloud in space.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step3.jpeg",
            tip: "Think of it like driving past a mountain - it seems to 'rise' and 'fall' as you pass by, even though it's standing still.",
        },
        {
            title: "Reading the Data",
            text: "Each image spans about four hours of MCS observations. Time moves from left to right. The vertical axis shows altitude (0-100 km) - you'll see the brighter lower atmosphere at the bottom, fading out higher up. High-altitude clouds appear as arches! Your goal: search for arches with two distinct legs and a peak.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step4.png",
            tip: "Focus on the upper portions of the image (above ~40km) where clouds are most visible against the darker background.",
        },
        {
            title: "What Makes a Valid Arch?",
            text: "A valid cloud arch has TWO LEGS and a clear PEAK at the top. Look carefully - there might be bright streaks that aren't arches! In this zoomed example, only the left feature has two distinct legs with a gap between them and a clear peak.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step5.png",
            quiz: {
                question: "What are the key features of a cloud arch?",
                options: [
                    "Just one bright vertical line",
                    "Two legs with a peak connecting them",
                    "A horizontal bright band",
                    "Random scattered dots"
                ],
                correctIndex: 1,
                explanation: "Correct! Look for two distinct 'legs' rising up and connecting at a peak - like an upside-down V or the letter Λ.",
            },
        },
        {
            title: "Example: 1-2 Arches",
            text: "Most images have 2-3 arches, but some have fewer. Here's an example with just 1-2 visible cloud arches. Don't worry if you only find a few - that's still valuable data!",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step6.jpeg",
            tip: "Quality over quantity! It's better to identify one definite arch than to guess at several uncertain ones.",
        },
        {
            title: "Example: Many Arches",
            text: "Some images are rich with cloud activity and contain many arches - sometimes more than 10! These are exciting finds that show lots of atmospheric activity.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step7.png",
        },
        {
            title: "Example: No Arches",
            text: "And some images have no arches at all - that's perfectly normal and still useful information! Knowing where clouds AREN'T is just as valuable as knowing where they are.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step8.png",
            tip: "If you don't see any arches, that's a valid classification. Don't try to force patterns that aren't there.",
        },
        {
            title: "You're Ready! 🚀",
            text: "You're now equipped to spot clouds in the Martian atmosphere! Remember: look for arch shapes with two legs and a peak. Report what you see, even if it's 'no arches.' Every classification helps scientists understand Mars better. Happy cloudspotting!",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step9.jpeg",
        }
    ]);

    const handleTutorialComplete = () => {
        setShowClassification(true);
    };

    return (
        <div className="rounded-lg">
            {/* Tutorial Component with scientific context */}
            <TutorialContentBlock
                classificationtype="cloud"
                slides={tutorialSlides}
                onComplete={handleTutorialComplete}
                title="Cloudspotting on Mars Training"
                description="Learn to identify cloud arches in Mars atmospheric data"
                scientificContext={SCIENTIFIC_CONTEXTS['balloon-marsCloudShapes']}
                structureType="satellite"
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
                                    alt="LIDAR image - Cloud(s) from Mars"
                                    className="w-full h-96 object-cover rounded-t-md"
                                />
                            </div>
                        </div>
                        <ClassificationForm
                            anomalyId={anomalyId}
                            anomalyType="cloud"
                            missionNumber={3000010}
                            assetMentioned={imageUrl}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};