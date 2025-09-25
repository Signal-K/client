"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";
import TutorialContentBlock from "../TutorialContentBlock";

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};

import { useActivePlanet } from "@/src/core/context/ActivePlanet";

import { Props } from "@/types/Anomalies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function TutorialAWA({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyid}.png`;

    const [part, setPart] = useState(1);
    const nextPart = () => setPart(2);

    const tutorialSlides = [
        {
            title: "SETI Signal Classification",
            text: "Help us classify our single-line narrowband SETI data! Single-line narrowband emissions are often hypothesized to be how ET might initially signal their presence. But they can be hard to classify properly, and we need your help with the classification task.",
            image: "/assets/Docs/SETI/Step1.png"
        },
        {
            title: "Upgraded Detection Capability",
            text: "Your telescope has now been upgraded to track narrowband emissions that could be signs of alien life trying to get in touch with us - you can now help classify these signals and work with the community to find where in our universe they might be",
            image: "/assets/Docs/SETI/Step2.png"
        }
    ];

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <TutorialContentBlock
                        slides={tutorialSlides}
                        classificationtype="telescope-awa"
                        onComplete={nextPart}
                    />
                )}
                
                {part === 2 && (
                    <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                        <div className="bg-white bg-opacity-90 mb-4">
                            <img
                                src={imageUrl}
                                alt="SETI Signal Analysis"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <ClassificationForm 
                            anomalyId={anomalyid.toString()} 
                            anomalyType='telescope-awa' 
                            missionNumber={20000007}
                            assetMentioned={[imageUrl]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export function AWA() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            };

            try {
                const {
                    data: anomalyData,
                    error: anomalyError
                } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "telescope-awa");

                if (anomalyError) {
                    throw anomalyError;
                };

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)];
                setAnomaly(randomAnomaly);
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-awa/${randomAnomaly.id}.png`);
            } catch (error: any) {
                console.error("Error fetching anomaly", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        if (session) {
            fetchAnomaly();
        };
    }, [session]);

    if (loading) {
        return (
            <div>
                <p>
                    Loading...
                </p>
            </div>
        );
    };

    if (!anomaly) {
        return (
            <div>
                <p>No Anomaly Found</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relativd w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            .
        </div>
    );
};