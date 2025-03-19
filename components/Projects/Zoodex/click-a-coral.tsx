'use client';

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "../(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

interface ZoodexProps {
    anomalyid: string;
};

export function ClickACoral() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);

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
                    .eq("anomalySet", "zoodex-clickACoral")

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)];
                setAnomaly(randomAnomaly);

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-clickACoral/${randomAnomaly.id}.png`);
            } catch (error: any) {
                console.error(error);
                setLoading(false);
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
                <p>The owls are sleeping, try again later</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="pb-4 rounded-md relative w-full">
                <center>
                    <button
                        onClick={() => setShowTutorial((prev) => (!prev))}
                        className="mb--4 px-4 py-2 bg=[#D689E3] text-white rounded"
                    >
                        {showTutorial ? "Hide" : "Show"} Tutorial
                    </button>

                    {/* {showTutorial && anomaly && <ClickACoralTutorial anomalyId={anomaly.id.toString()} />} */}

                    {!showTutorial && (
                        <>
                            {/* <img src={imageUrl || ''} alt={anomaly.content} className="w-full h-64 object-cover" /> */}
                            <ImageAnnotator
                                initialImageUrl={imageUrl || ''}
                                anomalyId={anomaly.id.toString()}
                                anomalyType="zoodex-clickACoral"
                                assetMentioned={imageUrl || ""}
                                structureItemId={3104}
                                annotationType="CAC"
                            />
                            {/* <ClassificationForm
                                anomalyId={anomaly.id.toString()}
                                anomalyType="zoodex-clickACoral"
                                missionNumber={100000039}
                                assetMentioned={imageUrl || ""}
                                structureItemId={3104}
                            /> */}
                        </>
                    )}
                </center>
            </div>
        </div>
    );
};

interface ClickACoralPassedProps {
    anomalyid: string;
};

export function ClickACoralPassed ( { anomalyid }: ClickACoralPassedProps ) {
    const supabase = useSupabaseClient();
    const session = useSession();

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
                    error: anomalyError,
                } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("id", anomalyid)

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setLoading(false);
                    setImageUrl('');
                    return;
                };

                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-clickACoral/${anomalyid}.png`)
            } catch (err: any) {
                throw err;
                console.error(err);
                setLoading(false);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [session, supabase]);

    if (loading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    };

    if (!imageUrl) {
        return (
            <div>
                <p>The requested coral couldn't be found, please try again later</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="pb-4 rounded-md relative w-full">
                <center>
                    <ImageAnnotator
                        initialImageUrl={imageUrl || ''}
                        anomalyId={anomalyid}
                        anomalyType='zoodex-clickACoral'
                        assetMentioned={imageUrl || ''}
                        structureItemId={3104}
                        annotationType="CAC"
                    />
                </center>
            </div>
        </div>
    );
};