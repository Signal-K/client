'use client';

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};

interface ShapesProps {
  anomalyid: number;
};

export function StarterCoMShapes({
    anomalyid
}: ShapesProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMineralResearch, setHasMineralResearch] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: anomalyData, error: anomalyError } = await supabase
          .from("anomalies")
          .select("*")
          .eq("anomalySet", "balloon-marsCloudShapes")
          .eq("content", anomalyid);

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
          setImageUrl(
            `${supabaseUrl}/storage/v1/object/public/telescope/balloon-marsCloudsShapes/${randomAnomaly.id}/${randomAnomaly.id}/1.png`
          );
          setBaseImageUrl(
            `${supabaseUrl}/storage/v1/object/public/telescope/balloon-marsCloudsShapes/${randomAnomaly.id}/${randomAnomaly.id}/2.png`
          );
        } else {
          console.error("Supabase URL or Anomaly ID is missing!");
          setAnomaly(null);
        }
      } catch (error: any) {
        console.error("Error fetching cloud shape:", error.message);
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnomaly();
  }, [session]);

  useEffect(() => {
    async function checkMineralResearch() {
      if (!session) return;

      console.log("[CoM Shapes] Checking mineral research for user:", session.user.id);

      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("id")
          .eq("owner", session.user.id)
          .eq("item", 3103);

        console.log("[CoM Shapes] Mineral research query result:", { data, error });

        if (error) {
          console.error("[CoM Shapes] Error checking mineral research:", error);
        }

        const hasResearch = !!data && data.length > 0;
        console.log("[CoM Shapes] Has mineral research:", hasResearch);
        setHasMineralResearch(hasResearch);
      } catch (error) {
        console.error("[CoM Shapes] Exception checking mineral research:", error);
      }
    }

    checkMineralResearch();
  }, [session, supabase]);

  if (loading) return <div><p>Loading...</p></div>;
  if (!anomaly || !imageUrl) return <div><p>No clouds found today.</p></div>;

  const handleClassificationComplete = async () => {
    if (!session || !anomaly) return;

    console.log("[CoM Shapes] Classification complete callback triggered");
    console.log("[CoM Shapes] Session:", session.user.id);
    console.log("[CoM Shapes] Anomaly:", anomaly.id);

    try {
      const { 
        attemptMineralDepositCreation, 
        selectCloudMineral 
      } = await import("@/src/utils/mineralDepositCreation");

      const { data: recentClassification } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .eq("anomaly", parseInt(anomaly.id.toString()))
        .eq("classificationtype", "balloon-marsCloudShapes")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      console.log("[CoM Shapes] Recent classification:", recentClassification);

      if (recentClassification) {
        const mineralConfig = selectCloudMineral();
        console.log("[CoM Shapes] Attempting mineral deposit creation with config:", mineralConfig);
        
        const depositCreated = await attemptMineralDepositCreation({
          supabase,
          userId: session.user.id,
          anomalyId: parseInt(anomaly.id.toString()),
          classificationId: recentClassification.id,
          mineralConfig,
          location: `Cloud shape formation at anomaly ${anomaly.id}`
        });

        if (depositCreated) {
          console.log(`[CoM Shapes] ✅ SUCCESS! Created ${mineralConfig.type} deposit!`);
        } else {
          console.log(`[CoM Shapes] ❌ FAILED to create deposit`);
        }
      } else {
        console.log("[CoM Shapes] No recent classification found");
      }
    } catch (error) {
      console.error("[CoM Shapes] Error in mineral deposit creation:", error);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
      {hasMineralResearch && (
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-blue-800 font-medium">Mineral Discovery Active (33% chance per classification)</span>
        </div>
      )}
      <div className="p-4 rounded-md relative w-full">
        <ImageAnnotator
          initialImageUrl={imageUrl}
          anomalyId={anomaly.id.toString()}
          anomalyType="balloon-marsCloudShapes"
          missionNumber={2000000555}
          assetMentioned={imageUrl}
          structureItemId={3105}
          parentClassificationId={parseInt(anomaly.id)}
          parentPlanetLocation={anomaly.id.toString()}
          annotationType="CoMS"
          onClassificationComplete={handleClassificationComplete}
        />
      </div>
    </div>
  );
};