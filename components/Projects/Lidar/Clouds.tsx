"use client";

import React, { useEffect, useState } from "react"; 
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
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
    }, [session, supabase, activePlanet]);

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
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="p-4 rounded-md relative w-full">
                {imageUrl && (
                    // <img src={imageUrl} alt={anomaly.content} className="w-full h-64 object-cover" />
                    <ImageAnnotator
                        initialImageUrl={imageUrl}
                        anomalyId={anomaly.id.toString()}
                        anomalyType="cloud"
                        missionNumber={100000034}
                        assetMentioned={imageUrl} 
                        structureItemId={3105}
                        parentPlanetLocation={anomalyid?.toString() || ''}
                        annotationType="CoM"
                    />
                )}
                {/* <ClassificationForm
                    anomalyId={anomaly.id.toString()}
                    anomalyType="cloud"
                    missionNumber={100000034}
                    assetMentioned={imageUrl || ""}
                    structureItemId={3105}
                    parentPlanetLocation={anomalyid?.toString()} 
                /> */}
            </div>
        </div>
    );
};

export function CloudspottingOnMarsWithId() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
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
            // Step 1: Try to find a linked anomaly for this user
            const { data: linkedAnomalies, error: linkedError } = await supabase
                .from("linked_anomalies")
                .select(`
                    id,
                    anomaly_id,
                    anomalies (
                        id,
                        anomalySet,
                        content
                    )
                `)
                .eq("author", session.user.id)
                .filter("anomalies.anomalySet", "eq", "cloudspottingOnMars")
                .limit(1);

            if (linkedError) throw linkedError;

            let selectedAnomaly = null;

            if (linkedAnomalies && linkedAnomalies.length > 0 && linkedAnomalies[0].anomalies && linkedAnomalies[0].anomalies.length > 0) {
                selectedAnomaly = linkedAnomalies[0].anomalies[0];
                console.log("Using previously linked anomaly:", selectedAnomaly.id);
            } else {
                // Step 2: Fallback to random anomaly
                const { data: anomalies, error: fallbackError } = await supabase
                    .from("anomalies")
                    .select("*")
                    .eq("anomalySet", "cloudspottingOnMars");

                if (fallbackError) throw fallbackError;

                if (!anomalies || anomalies.length === 0) {
                    console.error("No anomalies found in cloudspottingOnMars");
                    setAnomaly(null);
                    return;
                }

                const randomIndex = Math.floor(Math.random() * anomalies.length);
                selectedAnomaly = anomalies[randomIndex];
                console.log("Using fallback random anomaly:", selectedAnomaly.id);
            }

            setAnomaly(selectedAnomaly);
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
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 rounded-md relative w-full">
                {imageUrl && (
                    <ImageAnnotator
                        initialImageUrl={imageUrl}
                        anomalyId={anomaly.id.toString()}
                        anomalyType="cloud"
                        assetMentioned={imageUrl}
                        structureItemId={3105}
                        parentPlanetLocation={anomaly.id.toString()}
                        annotationType="CoM"
                    />
                )}
            </div>
        </div>
    );
};