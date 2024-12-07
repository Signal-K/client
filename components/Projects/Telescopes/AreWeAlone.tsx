"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";

import { Anomaly } from "./Transiting";
import { useActivePlanet } from "@/context/ActivePlanet";

import { Props } from "@/types/Anomalies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function TutorialAWA({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyid}.png`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);
    const nextLine = () => {
        setLine(prevLine => prevLine + 1);
    };
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                {part === 1 && (
                    <>
                        {line === 1 && (
                            <p className="text-[#EEEAD1]">
                                Help us classify our single-line narrowband SETI data! Single-line narrowband emissions are often hypothesized to be how ET might initially signal their presence. But they can be hard to classify properly, and we need your help with the classification task.
                            </p>
                        )}
                        {line === 2 && (
                            <p className="text-[#EEEAD1]">
                                Your telescope has now been upgraded to track narrowband emissions that could be signs of alien life trying to get in touch with us - you can now help classify these signals and work with the community to find where in our universe they might be
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
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