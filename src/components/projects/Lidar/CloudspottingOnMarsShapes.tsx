'use client';

import React, { useState, useEffect } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import ImageAnnotator from "../(classifications)/Annotating/AnnotatorView";

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};

interface ShapesProps {
  anomalyid: number;
}

export function StarterCoMShapes({ anomalyid }: ShapesProps) {
  const session = useSession();

  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMineralResearch, setHasMineralResearch] = useState<boolean>(false);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const linkedRes = await fetch(`/api/gameplay/linked-anomalies?anomalyId=${anomalyid}`);
        const linkedPayload = await linkedRes.json().catch(() => ({}));
        const linkedAnomaly = linkedRes.ok ? linkedPayload?.linkedAnomaly : null;

        let anomalyRecord: any = null;
        if (linkedAnomaly?.anomaly_id) {
          const anomalyRes = await fetch(`/api/gameplay/anomalies?id=${linkedAnomaly.anomaly_id}&limit=1`);
          const anomalyPayload = await anomalyRes.json().catch(() => ({}));
          anomalyRecord = anomalyRes.ok ? anomalyPayload?.anomalies?.[0] : null;
        }

        if (!anomalyRecord) {
          const fallbackRes = await fetch(
            `/api/gameplay/anomalies?anomalySet=balloon-marsCloudShapes&content=${encodeURIComponent(String(anomalyid))}&limit=1`
          );
          const fallbackPayload = await fallbackRes.json().catch(() => ({}));
          anomalyRecord = fallbackRes.ok ? fallbackPayload?.anomalies?.[0] : null;
        }

        if (!anomalyRecord?.id) {
          setAnomaly(null);
          return;
        }

        setAnomaly({
          id: String(anomalyRecord.id),
          name: anomalyRecord.content || "Unknown",
          details: anomalyRecord.anomalySet,
        });

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          setImageUrl(
            `${supabaseUrl}/storage/v1/object/public/telescope/balloon-marsCloudsShapes/${anomalyRecord.id}/${anomalyRecord.id}/1.png`
          );
        }
      } catch (error: any) {
        console.error("Error fetching cloud shape:", error.message);
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnomaly();
  }, [session, anomalyid]);

  useEffect(() => {
    async function checkMineralResearch() {
      if (!session) return;
      const inventoryRes = await fetch("/api/gameplay/inventory/mine?item=3103&limit=1");
      const inventoryPayload = await inventoryRes.json().catch(() => ({}));
      setHasMineralResearch(Boolean(inventoryRes.ok && inventoryPayload?.inventory?.length));
    }

    void checkMineralResearch();
  }, [session]);

  if (loading) return <div><p>Loading...</p></div>;
  if (!anomaly || !imageUrl) return <div><p>No clouds found today.</p></div>;

  const handleClassificationComplete = async () => {
    if (!session || !anomaly) return;

    try {
      const { attemptMineralDepositCreation, selectCloudMineral } = await import("@/src/utils/mineralDepositCreation");

      const recentRes = await fetch(
        `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&anomaly=${parseInt(anomaly.id)}&classificationtype=balloon-marsCloudShapes&orderBy=created_at&ascending=false&limit=1`
      );
      const recentPayload = await recentRes.json().catch(() => ({}));
      const recentClassification = recentRes.ok ? recentPayload?.classifications?.[0] : null;

      if (!recentClassification?.id) return;

      await attemptMineralDepositCreation({
        userId: session.user.id,
        anomalyId: parseInt(anomaly.id),
        classificationId: recentClassification.id,
        mineralConfig: selectCloudMineral(),
        location: `Cloud shape formation at anomaly ${anomaly.id}`,
      });
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
}

