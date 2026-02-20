"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import ImageAnnotator from "../(classifications)/Annotating/AnnotatorView";

type Anomaly = {
  id: string;
  name: string;
  details?: string;
};

function cloudImageUrl(anomalyId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/clouds/${anomalyId}.png`;
}

export function StarterLidar({ anomalyid }: { anomalyid: string }) {
  const session = useSession();
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        let row: any = null;
        if (anomalyid) {
          const res = await fetch(`/api/gameplay/anomalies?id=${encodeURIComponent(anomalyid)}&limit=1`);
          const payload = await res.json().catch(() => ({}));
          row = res.ok ? payload?.anomalies?.[0] : null;
        } else {
          const res = await fetch("/api/gameplay/anomalies?anomalySet=cloudspottingOnMars&limit=1");
          const payload = await res.json().catch(() => ({}));
          row = res.ok ? payload?.anomalies?.[0] : null;
        }

        if (!row?.id) {
          setAnomaly(null);
          return;
        }

        setAnomaly({ id: String(row.id), name: row.content || "Unknown", details: row.anomalySet });
        setImageUrl(cloudImageUrl(String(row.id)));
      } catch {
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnomaly();
  }, [session?.user?.id, anomalyid]);

  if (loading) return <div><p>Loading...</p></div>;
  if (!anomaly || !imageUrl) return <div><p>No clouds found.</p></div>;

  return (
    <div className="w-full h-screen flex flex-col gap-2 px-4">
      <div className="p-4 rounded-md relative w-full h-full md:h-[90vh] lg:h-[90vh] overflow-hidden">
        <ImageAnnotator
          initialImageUrl={imageUrl}
          anomalyId={anomaly.id.toString()}
          anomalyType="cloud"
          missionNumber={100000034}
          assetMentioned={imageUrl}
          structureItemId={3105}
          parentPlanetLocation={anomalyid?.toString() || ""}
          annotationType="CoM"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

export function CloudspottingOnMarsWithId() {
  const session = useSession();
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [classificationId, setClassificationId] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const linkedRes = await fetch("/api/gameplay/linked-anomalies?automaton=WeatherSatellite");
        const linkedPayload = await linkedRes.json().catch(() => ({}));
        const linked = linkedRes.ok ? linkedPayload?.linkedAnomalies || [] : [];
        const selected = linked[0];

        if (!selected?.anomaly_id) {
          setAnomaly(null);
          return;
        }

        const anomalyRes = await fetch(`/api/gameplay/anomalies?id=${selected.anomaly_id}&limit=1`);
        const anomalyPayload = await anomalyRes.json().catch(() => ({}));
        const row = anomalyRes.ok ? anomalyPayload?.anomalies?.[0] : null;
        if (!row?.id) {
          setAnomaly(null);
          return;
        }

        setAnomaly({ id: String(row.id), name: row.content || "Unknown", details: row.anomalySet });
        setClassificationId(selected.classification_id ?? null);
        setImageUrl(cloudImageUrl(String(row.id)));
      } catch {
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnomaly();
  }, [session?.user?.id]);

  if (loading) return <div><p>Loading...</p></div>;
  if (!anomaly) return <div><p>No anomaly found.</p></div>;

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
}

