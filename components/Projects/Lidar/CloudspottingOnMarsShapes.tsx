'use client';

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Anomaly } from "../Telescopes/Transiting";
import PreferredTerrestrialClassifications from "@/components/Structures/Missions/PickPlanet";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

interface SelectedAnomProps {
    anomalyid: number;
};

export function ShapesOnMarsWithId({ anomalyid }: SelectedAnomProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    async function fetchAnomaly() {
        if (!session) {
            setLoading(false);
            return;
        };

        const {
            data: anomalyData,
            error,
        } = await supabase
            .from("anomalies")
            .select("*")
            .eq("anomalySet", 'balloon-marsCloudShapes')
            .eq('id', anomalyid);

        if (error) {
            setAnomaly(null);
            return;
            setLoading(false);
        } else {
            setAnomaly(anomalyData[0]);
        }
    };
};

export function StarterCoMShapes({ anomalyid }: SelectedAnomProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);

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
                    .eq("anomalySet", "balloon-marsCloudShapes")

                if (anomalyError) throw anomalyError;

                if (!anomalyData || anomalyData.length === 0) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                }

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
                setAnomaly(randomAnomaly);

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (supabaseUrl && randomAnomaly?.id) {
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/balloon-marsCloudsShapes/${randomAnomaly.id}/${randomAnomaly.id}/${randomAnomaly.id}/1.png`);
                    setBaseImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/balloon-marsCloudsShapes/${randomAnomaly.id}/${randomAnomaly.id}/${randomAnomaly.id}/2.png`);
                } else {
                    console.error('Supabase URL or Anomaly ID is missing!');
                    setAnomaly(null);
                }
            } catch (error: any) {
                console.error("Error fetching cloud shape: ", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        }

        fetchAnomaly();
    }, [session, anomalyid]);

    if (loading) return <div><p>Loading...</p></div>;
    if (!anomaly) return <div><p>No clouds found today</p></div>;

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="p-4 rounded-md relative w-full"> {/* Add base image with grid (1*2) format */}
                {imageUrl && (
                    <ImageAnnotator
                        initialImageUrl={imageUrl}
                        anomalyId={anomaly.id.toString()}
                        anomalyType='balloon-marsCloudShapes'
                        missionNumber={2000000555}
                        assetMentioned={imageUrl}
                        structureItemId={3105}
                        parentClassificationId={anomalyid}
                        parentPlanetLocation={anomalyid?.toString() || ''}
                        annotationType="CoMS"
                    />
                )}
            </div>
        </div>
    );
};

export function CloudspottingShapesWrapper() {
    const [selectedAnomaly, setSelectedAnomaly] = useState<number | null>(null);

    return (
        <div className="space-y-8">
            {!selectedAnomaly && (
                <PreferredTerrestrialClassifications onSelectAnomaly={setSelectedAnomaly} />
            )}
            {selectedAnomaly && (
                <StarterCoMShapes anomalyid={selectedAnomaly} />
            )}
        </div>
    );
};