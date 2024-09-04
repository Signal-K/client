"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "../../(create)/(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";

export function StarterLidar() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            };

            try {
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalytype", "cloud")
                    .limit(1)
                    .single();

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };

                const { data: classificationData, error: classificationError } = await supabase
                    .from("classifications")
                    .select("*")
                    .eq("anomaly", anomalyData.id)
                    .eq("author", session.user.id)
                    .maybeSingle();

                if (classificationError) {
                    throw classificationError;
                };

                if (classificationData) {
                    setAnomaly(null);
                } else {
                    setAnomaly(anomalyData as Anomaly);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/clouds/${anomalyData?.id}.png`);
                };
            } catch (error: any) {
                console.error("Error fetching cloud: ", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [session, supabase, activePlanet]);

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
                <p>No clouds found.</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 rounded-md relative w-full">
                {/* <h3>{anomaly.content}</h3> */}
                {/* {anomaly.avatar_url && (
                    <img src={anomaly.avatar_url} alt={anomaly.content} className="w-full h-64 object-cover" />
                )} */}
                {imageUrl && (
                    <img src={imageUrl} alt={anomaly.content} className="w-full h-64 object-cover" />
                )}
                <ClassificationForm
                    anomalyId={anomaly.id.toString()}
                    anomalyType="cloud"
                    missionNumber={137121301}
                    assetMentioned={imageUrl || ""}
                />
            </div>
        </div>
    );
};