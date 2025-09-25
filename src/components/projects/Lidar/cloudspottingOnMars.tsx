"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

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

    // Tutorial slides for Cloudspotting on Mars
    const tutorialSlides = createTutorialSlides([
        {
            title: "Cloudspotting on Mars",
            text: "Hello, and welcome to Cloudspotting on Mars!",
        },
        {
            title: "Finding Mars Clouds",
            text: "We need your help finding clouds in Mars's atmosphere. The Mars Climate Sounder (MCS) on NASA's Mars Reconnaissance Orbiter observes the atmosphere in the infrared to determine the temperature and ice and dust content. Its measurements point to water-ice clouds and carbon-dioxide clouds at very high altitudes.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step1.jpeg"
        },
        {
            title: "Citizen Science",
            text: "Clouds have been observed at Mars by various instruments on several orbiters (and rovers!). But there are so many clouds, a single individual cannot find them all on their own. With help from you and other citizen scientists, we think tens of thousands of these clouds can be identified!",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step2.png"
        },
        {
            title: "Cloud Arches",
            text: "As your spacecraft moves through its orbit, clouds appear to rise from behind the atmosphere to a higher altitude and then fall again. This leads to an arch-like shape in the data. The peak of the arch is the real location of the cloud.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step3.jpeg"
        },
        {
            title: "Reading the Data",
            text: "You'll be presented with images that span four hours worth of MCS observations. From left to right, time moves forward as the spacecraft moves through its orbit. The vertical axis represents altitude (from 0 to 100 km) -- you'll see the brighter lower atmosphere on the bottom fading out higher in the atmosphere above. But sometimes high-altitude clouds appear as arches! Your goal is to search for arches like this. To decide if something is an arch, look for two distinct legs and a peak. Tell us what shape you see, how many clouds, and then the rough location in the text box.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step4.png"
        },
        {
            title: "Identifying Arches",
            text: "Remember, you're looking for an arch with two legs and a peak. There are several bright streaks in the zoomed-in image below, but only the one on the left has two legs with a clear gap in between and a peak at the top.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step5.png"
        },
        {
            title: "Few Arches Example",
            text: "Most images have about 2-3 arches. Here's an example with just 1-2:",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step6.jpeg"
        },
        {
            title: "Many Arches Example",
            text: "Many have several arches throughout (sometimes more than 10):",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step7.png"
        },
        {
            title: "No Arches Example",
            text: "Others have none at all:",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step8.png"
        },
        {
            title: "Ready to Begin!",
            text: "You're ready to begin cloudspotting on Mars!",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step9.jpeg"
        }
    ]);

    const handleTutorialComplete = () => {
        setShowClassification(true);
    };

    return (
        <div className="rounded-lg">
            {/* Tutorial Component */}
            <TutorialContentBlock
                classificationtype="cloud"
                slides={tutorialSlides}
                onComplete={handleTutorialComplete}
                title="Cloudspotting on Mars Training"
                description="Learn to identify cloud arches in Mars atmospheric data"
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