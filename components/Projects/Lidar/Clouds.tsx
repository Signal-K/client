"use client";

import React, { useEffect, useState } from "react"; 
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";
import { CloudspottingOnMarsTutorial } from "./cloudspottingOnMars"; 
import PreferredTerrestrialClassifications from "@/components/Structures/Missions/PickPlanet";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

export interface SelectedAnomProps {
    anomalyid?: number;
};

export function StarterLidar({ anomalyid }: SelectedAnomProps) {
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
    
    if (!hasMission3000010) {
    return <CloudspottingOnMarsTutorial anomalyId={anomaly?.id.toString() || "8423850802"} />;
    };

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

export function CloudspottingWrapper() {
    const [selectedAnomaly, setSelectedAnomaly] = useState<number | null>(null);

    return (
        <div className="space-y-8">
            {!selectedAnomaly && (
                <PreferredTerrestrialClassifications onSelectAnomaly={setSelectedAnomaly} />
            )}
            {selectedAnomaly && (
                <StarterLidar anomalyid={selectedAnomaly} />
            )}
        </div>
    )
}