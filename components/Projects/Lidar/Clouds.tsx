"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/components/(classifications)/PostForm";
import { Anomaly } from "../Telescopes/Transiting";
import { CloudspottingOnMars } from "./cloudspottingOnMars";

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
                    .rpc("get_random_anomaly", { anomaly_type: "cloud" })
                    .single();

                if (anomalyError) {
                    throw anomalyError;
                };

                if (!anomalyData) {
                    setAnomaly(null);
                    setLoading(false);
                    return;
                };

                const fetchedAnomaly = anomalyData as Anomaly;

                setAnomaly(fetchedAnomaly);
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/clouds/${fetchedAnomaly.id}.png`);

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
        return <CloudspottingOnMars anomalyId={anomaly?.id.toString() || "8423850802"} />;
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
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="p-4 rounded-md relative w-full">
                {imageUrl && (
                    <img src={imageUrl} alt={anomaly.content} className="w-full h-64 object-cover" />
                )}
                <ClassificationForm
                    anomalyId={anomaly.id.toString()}
                    anomalyType="cloud"
                    missionNumber={100000034}
                    assetMentioned={imageUrl || ""}
                    originatingStructure={3105}
                />
            </div>
        </div>
    );
};