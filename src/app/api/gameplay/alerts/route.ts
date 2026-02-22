import { NextResponse } from "next/server";
import { subDays } from "date-fns";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type AlertItem = {
  id: string;
  type: "anomaly" | "event" | "completion";
  message: string;
  anomalyId?: number;
  eventId?: number;
  classificationId?: number;
  anomaly?: {
    anomalytype?: string;
  };
};

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as T) ?? null;
  return value;
}

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ alerts: [] });
  }

  const weekAgo = subDays(new Date(), 7).toISOString();
  const alerts: AlertItem[] = [];

  const { data: linkedAnomalies, error: linkedError } = await supabase
    .from("linked_anomalies")
    .select(
      `
      id,
      date,
      anomaly:anomalies(
        id,
        anomalytype,
        content,
        classification_status
      )
    `
    )
    .eq("author", user.id)
    .gte("date", weekAgo)
    .order("date", { ascending: false });

  if (linkedError) {
    return NextResponse.json({ error: linkedError.message }, { status: 500 });
  }

  const linkedIds = (linkedAnomalies || [])
    .map((la: any) => normalizeRelation<{ id: number }>(la.anomaly)?.id)
    .filter(Boolean);

  let classifiedAnomalyIds = new Set<number>();
  if (linkedIds.length > 0) {
    const { data: existingClassifications } = await supabase
      .from("classifications")
      .select("anomaly")
      .eq("author", user.id)
      .in("anomaly", linkedIds);

    classifiedAnomalyIds = new Set((existingClassifications || []).map((c: any) => c.anomaly));
  }

  const unclassifiedAnomalies = (linkedAnomalies || []).filter((la: any) => {
    const anomaly = normalizeRelation<{ id: number }>(la.anomaly);
    return anomaly?.id && !classifiedAnomalyIds.has(anomaly.id);
  });

  for (const linkedAnomaly of unclassifiedAnomalies) {
    const anomaly = normalizeRelation<{ id: number; anomalytype?: string }>(linkedAnomaly.anomaly);
    if (!anomaly?.id) continue;
    const anomalyType = anomaly.anomalytype || "unknown object";
    alerts.push({
      id: `anomaly-${linkedAnomaly.id}`,
      type: "anomaly",
      message: "New anomaly discovered, classify it for bonus stardust",
      anomalyId: anomaly.id,
      anomaly: { anomalytype: anomalyType },
    });
  }

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select(
      `
      id,
      type,
      time,
      completed,
      location:anomalies(id, content),
      classification_location:classifications(id, author)
    `
    )
    .eq("completed", false)
    .gte("time", new Date().toISOString())
    .order("time", { ascending: true })
    .limit(5);

  (upcomingEvents || []).forEach((event: any) => {
    if (event.classification_location?.author !== user.id) {
      return;
    }
    alerts.push({
      id: `event-${event.id}`,
      type: "event",
      message: `Upcoming ${event.type} event on planet ${event.location?.content || "Unknown"}`,
      eventId: event.id,
      classificationId: event.classification_location?.id,
    });
  });

  if (alerts.length === 0) {
    alerts.push({
      id: "completion",
      type: "completion",
      message: "No primary objects left to classify. Great work!",
    });
  }

  return NextResponse.json({ alerts });
}
