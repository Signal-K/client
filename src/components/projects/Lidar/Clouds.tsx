"use client";

import React, { useEffect, useState } from "react"; 
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import { CloudspottingOnMarsTutorial } from "./cloudspottingOnMars"; 
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};

export function StarterLidar({ anomalyid }: { anomalyid: string }) {
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
                // If anomalyid is provided, fetch that specific anomaly
                if (anomalyid) {
                    const { data: anomalyData, error: anomalyError } = await supabase
                        .from("anomalies")
                        .select("*")
                        .eq("id", anomalyid)
                        .single();

                    if (anomalyError) {
                        throw anomalyError;
                    };

                    if (anomalyData) {
                        setAnomaly(anomalyData as Anomaly);
                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        setImageUrl(`${supabaseUrl}/storage/v1/object/public/clouds/${anomalyData.id}.png`);
                    } else {
                        setAnomaly(null);
                    }
                    setLoading(false);
                    return;
                }

                // Otherwise, fetch a random cloud anomaly (original behavior)
                const { data: anomalyData, error: anomalyError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalytype", "cloud")

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };

                const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;

                setAnomaly(randomAnomaly);
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/clouds/${randomAnomaly.id}.png`);

                // const { data: classificationData, error: classificationError } = await supabase
                //     .from("classifications")
                //     .select("*")
                //     .eq("anomaly", fetchedAnomaly.id)
                //     .eq("author", session.user.id)
                //     .maybeSingle();

                // if (classificationError) {
                //     throw classificationError;
                // }

                // if (classificationData) {
                //     setAnomaly(null);
                // }
            } catch (error: any) {
                console.error("Error fetching cloud: ", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            };
        };

        fetchAnomaly();
    }, [session, supabase, activePlanet, anomalyid]);

    const [hasMission3000010, setHasMission3000010] = useState<boolean | null>(
        null
      );
      const [missionLoading, setMissionLoading] = useState<boolean>(true);
    
      // Check tutorial mission
      useEffect(() => {
        const checkTutorialMission = async () => {
          if (!session) return;
    
          try {
            const { data: missionData, error: missionError } = await supabase
              .from("missions")
              .select("id")
              .eq("user", session.user.id)
              .eq("mission", "3000010")
              .single();
    
            if (missionError) throw missionError;
    
            setHasMission3000010(!!missionData);
          } catch (error: any) {
            console.error("Error checking user mission:", error.message || error);
            setHasMission3000010(false);
          } finally {
            setMissionLoading(false);
          }
        };
    
        checkTutorialMission();
      }, [session, supabase]);
    
    // if (!hasMission3000010) {
    // return <CloudspottingOnMarsTutorial anomalyId={anomaly?.id.toString() || "8423850802"} />;
    // };

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
        <div className="w-full h-screen flex flex-col gap-2 px-4">
            <div className="p-4 rounded-md relative w-full h-full md:h-[90vh] lg:h-[90vh] overflow-hidden">
                {imageUrl && (
                    <ImageAnnotator
                        initialImageUrl={imageUrl}
                        anomalyId={anomaly.id.toString()}
                        anomalyType="cloud"
                        missionNumber={100000034}
                        assetMentioned={imageUrl} 
                        structureItemId={3105}
                        parentPlanetLocation={anomalyid?.toString() || ''}
                        annotationType="CoM"
                        className="h-full w-full"
                    />
                )}
            </div>
        </div>
    );
};

export function CloudspottingOnMarsWithId() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [classificationId, setClassificationId] = useState<number | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    const fetchAnomaly = async () => {
        if (!session) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Step 1: Try to find a linked anomaly for this user in cloudspottingOnMars
            const { data: linkedAnomalies, error: linkedError } = await supabase
                .from("linked_anomalies")
                .select(`
                    id,
                    anomaly_id,
                    anomalies (
                        id,
                        anomalySet,
                        content
                    ),
                    classification_id
                `)
                .eq("author", session.user.id)
                .filter("anomalies.anomalySet", "eq", "cloudspottingOnMars")
                .limit(1);

            if (linkedError) throw linkedError;

            let selectedAnomaly = null;
            let selectedClassificationId: number | null = null;

            if (
                linkedAnomalies &&
                linkedAnomalies.length > 0 &&
                linkedAnomalies[0].anomalies
            ) {
                selectedAnomaly = Array.isArray(linkedAnomalies[0].anomalies)
                    ? linkedAnomalies[0].anomalies[0]
                    : linkedAnomalies[0].anomalies;
                selectedClassificationId = linkedAnomalies[0].classification_id;
                console.log("Using linked anomaly in cloudspottingOnMars:", selectedAnomaly.id);
            } else {
                // Step 2: Fallback to any linked anomaly with classification_id
                const { data: fallbackLinked, error: fallbackLinkedError } = await supabase
                    .from("linked_anomalies")
                    .select(`
                        id,
                        anomaly_id,
                        classification_id,
                        anomalies (
                            id,
                            anomalySet,
                            content
                        )
                    `)
                    .eq("author", session.user.id)
                    .not("classification_id", "is", null)
                    .limit(1);

                if (fallbackLinkedError) throw fallbackLinkedError;

                if (
                    fallbackLinked &&
                    fallbackLinked.length > 0 &&
                    fallbackLinked[0].anomalies
                ) {
                    selectedAnomaly = Array.isArray(fallbackLinked[0].anomalies)
                        ? fallbackLinked[0].anomalies[0]
                        : fallbackLinked[0].anomalies;
                    selectedClassificationId = fallbackLinked[0].classification_id;
                    console.log("Using fallback anomaly with classification_id:", selectedAnomaly.id);
                } else {
                    console.error("No suitable linked anomalies found");
                    setAnomaly(null);
                    return;
                }
            }

            setAnomaly({
                id: selectedAnomaly.id,
                name: selectedAnomaly.content || "Unknown",
                details: selectedAnomaly.anomalySet || undefined,
            });
            setClassificationId(selectedClassificationId);
            setImageUrl(`${supabaseUrl}/storage/v1/object/public/clouds/${selectedAnomaly.id}.png`);
        } catch (error: any) {
            console.error("Error fetching cloud:", error.message);
            setAnomaly(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnomaly();
    }, [session, supabase]);

    if (loading) {
        return <div><p>Loading...</p></div>;
    }

    if (!anomaly) {
        return <div><p>No anomaly found.</p></div>;
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#E5EEF4] to-[#D8E5EC] px-4 py-6">
            <div className="w-full max-w-4xl min-h-[80vh] flex flex-col rounded-xl bg-white shadow-lg p-4">
                <div className="w-full">
                    {imageUrl && (
                        <ImageAnnotator
                            initialImageUrl={imageUrl}
                            anomalyId={anomaly.id.toString()}
                            anomalyType="cloud"
                            assetMentioned={imageUrl}
                            structureItemId={3105}
                            parentClassificationId={classificationId ?? undefined}
                            parentPlanetLocation={anomaly.id.toString()}
                            annotationType="CoM"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};