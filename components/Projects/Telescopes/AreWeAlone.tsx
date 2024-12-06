"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";

import { Anomaly } from "./Transiting";
import { useActivePlanet } from "@/context/ActivePlanet";

import { Props } from "@/types/Anomalies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function StarterAWA({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyid}.png`;
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