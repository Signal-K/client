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

  if (loading) return <div><p>Loading...</p></div>;
  if (!anomaly || !imageUrl) return <div><p>No clouds found today.</p></div>;

  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh]">
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
        />
      </div>
    </div>
  );
};