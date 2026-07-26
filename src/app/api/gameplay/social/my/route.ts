import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapCommentToRow, mapVoteToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const idsParam = request.nextUrl.searchParams.get("classificationIds");
  const category = request.nextUrl.searchParams.get("category");
  const limit = Number(request.nextUrl.searchParams.get("limit") || 2000);
  const ids = (idsParam || "")
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isFinite(x));
  const validatedLimit = Math.max(1, Math.min(limit, 5000));

  const pb = await createPocketbaseAdminClient();

  const commentFilters = [pb.filter("author = {:author}", { author: user.id })];
  const voteFilters = [pb.filter("userId = {:author}", { author: user.id })];

  if (ids.length > 0) {
    commentFilters.push("(" + ids.map((id) => pb.filter("classificationId = {:id}", { id })).join(" || ") + ")");
    voteFilters.push("(" + ids.map((id) => pb.filter("classificationId = {:id}", { id })).join(" || ") + ")");
  }
  if (category) {
    commentFilters.push(pb.filter("category = {:c}", { c: category }));
  }

  const [comments, votes] = await Promise.all([
    pb.collection("ss_comments").getList(1, validatedLimit, { filter: commentFilters.join(" && "), sort: "-createdAt" }),
    pb.collection("votes").getList(1, validatedLimit, { filter: voteFilters.join(" && "), sort: "-legacyId" }),
  ]);

  return NextResponse.json(
    recursiveSerialize({
      comments: comments.items.map(mapCommentToRow),
      votes: votes.items.map(mapVoteToRow),
    })
  );
}
