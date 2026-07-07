import { NextRequest, NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type Milestone = {
  name: string;
  table: string;
  field: string;
  value: string;
};

type Body = {
  weekStart?: string;
  data?: Milestone[];
  community?: boolean;
};

const COLLECTIONS: Record<string, { dateField: string; userField: string; fields: Record<string, string> }> = {
  classifications: {
    dateField: "createdAt",
    userField: "author",
    fields: {
      id: "legacyId",
      created_at: "createdAt",
      author: "author",
      anomaly: "anomaly",
      classificationtype: "classificationtype",
    },
  },
  comments: {
    dateField: "createdAt",
    userField: "author",
    fields: {
      id: "legacyId",
      created_at: "createdAt",
      author: "author",
      classification_id: "classificationId",
      category: "category",
      confirmed: "confirmed",
      value: "value",
    },
  },
  votes: {
    dateField: "createdAt",
    userField: "userId",
    fields: {
      id: "legacyId",
      created_at: "createdAt",
      user_id: "userId",
      classification_id: "classificationId",
      anomaly_id: "anomalyId",
      vote_type: "voteType",
    },
  },
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const weekStart = body?.weekStart;
  const data = Array.isArray(body?.data) ? body.data : [];
  const community = body?.community === true;

  if (!weekStart || data.length === 0) {
    return NextResponse.json({ progress: {} });
  }

  const startDate = new Date(weekStart);
  if (Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid weekStart" }, { status: 400 });
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  const progress: Record<string, number> = {};
  const pb = await createPocketbaseAdminClient();

  for (const milestone of data) {
    const { table, field, value } = milestone;
    if (!table || !field) continue;
    const collection = COLLECTIONS[table];
    if (!collection) continue;

    const mappedField = collection.fields[field] ?? field;
    const filters = [
      pb.filter(`${mappedField} = {:value}`, { value }),
      pb.filter(`${collection.dateField} >= {:start}`, { start: startDate.toISOString() }),
      pb.filter(`${collection.dateField} <= {:end}`, { end: endDate.toISOString() }),
    ];

    if (!community) {
      filters.push(pb.filter(`${collection.userField} = {:userId}`, { userId: user.id }));
    }

    try {
      const result = await pb.collection(table).getList(1, 1, { filter: filters.join(" && ") });
      progress[milestone.name] = result.totalItems;
    } catch {
      progress[milestone.name] = 0;
    }
  }

  return NextResponse.json({ progress });
}
