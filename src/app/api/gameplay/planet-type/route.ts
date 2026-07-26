import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classificationIdParam = request.nextUrl.searchParams.get("classificationId");
  const classificationId = classificationIdParam ? Number(classificationIdParam) : null;
  if (classificationIdParam && !Number.isFinite(classificationId)) {
    return NextResponse.json({ error: "Invalid classificationId" }, { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();

  const [classificationRecords, commentRecords] = await Promise.all([
    pb.collection("ss_classifications").getFullList({
      filter: classificationId
        ? pb.filter("legacyId = {:id}", { id: classificationId })
        : pb.filter("classificationtype = {:t}", { t: "planet" }),
    }),
    pb.collection("ss_comments").getFullList({
      filter: classificationId
        ? pb.filter("classificationId = {:id}", { id: classificationId })
        : "",
    }),
  ]);

  const authorIds = [...new Set(commentRecords.map((c) => c.author).filter(Boolean))];
  let profileByUserId = new Map<string, Record<string, any>>();
  if (authorIds.length > 0) {
    const profileFilter = authorIds.map((id) => pb.filter("userId = {:id}", { id })).join(" || ");
    const profiles = await pb.collection("profiles").getFullList({ filter: profileFilter });
    profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
  }

  const comments = commentRecords.map((c) => {
    const profile = profileByUserId.get(c.author);
    return {
      id: c.legacyId,
      content: c.content,
      configuration: c.configuration,
      classification_id: c.classificationId,
      author: {
        id: c.author,
        full_name: profile?.fullName ?? null,
        avatar_url: profile?.avatarUrl ?? null,
      },
    };
  });

  return NextResponse.json(
    recursiveSerialize({ classifications: classificationRecords.map(mapClassificationToRow), comments })
  );
}
