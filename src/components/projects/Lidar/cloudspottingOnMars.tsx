"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";
import { useActivePlanet } from "@/src/lib/context/ActivePlanet";
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

    const tutorialSlides = createTutorialSlides([
        {
            title: "Data Acquisition",
            text: "Atmospheric analysis protocol. The Mars Climate Sounder (MCS) captures infrared telemetry to document weather patterns and track aerosol composition.",
            tip: "Classifications inform long-term meteorological models.",
        },
        {
            title: "Sensor Telemetry",
            text: "MCS measures temperature, ice, and dust content. Data identifies water-ice and carbon-dioxide formations at high altitude (>80km).",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step1.jpeg",
            tip: "Similar to terrestrial noctilucent clouds, but composed of CO₂ and water ice.",
        },
        {
            title: "Pattern: Cloud Arches",
            text: "Orbital progression creates distinctive arch-like signatures. The arch peak identifies the precise spatial coordinate of the formation.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step3.jpeg",
            tip: "The arch geometry is an artifact of the sensor's orbital motion.",
        },
        {
            title: "Telemetry Interpretation",
            text: "X-axis: Time (4h duration). Y-axis: Altitude (0-100km). Identify high-altitude arches with two distinct legs and a peak.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step4.webp",
            tip: "Prioritize analysis of the upper quadrant (>40km) against low-noise background.",
        },
        {
            title: "Morphology Validation",
            text: "A valid signal requires two legs and a clear peak. Disregard linear streaks or isolated bright artifacts.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step5.webp",
        },
        {
            title: "Classification Guidelines",
            text: "Report all identified arches. Zero-arch data packets are valid and required for baseline atmospheric modeling.",
            image: "/assets/Docs/LIDAR/lidar-martianClouds/Step8.webp",
        },
        {
            title: "Initialization",
            text: "Tutorial complete. Initialize atmospheric classification protocol.",
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