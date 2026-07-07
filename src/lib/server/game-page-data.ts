import { unstable_cache } from "next/cache";
import { getHubLeaderboard } from "@/src/lib/server/hub-leaderboard";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

function parseConfig(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

type ActivityFeedItem =
  | {
      type: "comment";
      created_at: string;
      content: string | null;
      classification_id: number;
      category: string | null;
    }
  | {
      type: "vote";
      created_at: string;
      vote_type: string;
      classification_id: number;
    };

type LinkedAnomalyEntry = {
  id: number;
  anomalyId: number;
  date: string;
  automaton: string | null;
  unlocked?: boolean | null;
  anomaly: {
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
};

type RecentClassificationRow = {
  id: number;
  classificationtype: string | null;
  content: string | null;
  createdAt: string;
  classificationConfiguration?: unknown;
  anomalyRef: {
    content: string | null;
  } | null;
};

type OtherClassificationRow = {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string | null;
  createdAt: string;
};

async function safeQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[game-page-data] ${label} unavailable: ${message}`);
    return fallback;
  }
}

async function getProfileForUser(userId: string) {
  const pb = await createPocketbaseAdminClient();
  const profile = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: userId }))
    .catch(() => null);

  if (!profile) return null;

  return {
    id: userId,
    username: (profile.username as string) ?? null,
    fullName: (profile.fullName as string) ?? null,
    classificationPoints: (profile.classificationPoints as number) ?? 0,
    referralCode: (profile.referralCode as string) ?? null,
  };
}

async function getRecentClassificationsForUser(userId: string): Promise<RecentClassificationRow[]> {
  return unstable_cache(
    async () => {
      const pb = await createPocketbaseAdminClient();
      const rows = await pb.collection("classifications").getList(1, 10, {
        filter: pb.filter("author = {:author}", { author: userId }),
        sort: "-createdAt",
      });

      const anomalyIds = [...new Set(rows.items.map((r) => r.anomaly).filter((a): a is number => a != null))];
      let contentByAnomalyId = new Map<number, string | null>();
      if (anomalyIds.length > 0) {
        const filter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
        const anomalies = await pb.collection("anomalies").getFullList({ filter, fields: "legacyId,content" });
        contentByAnomalyId = new Map(anomalies.map((a) => [a.legacyId, a.content ?? null]));
      }

      return rows.items.map((row) => ({
        id: row.legacyId,
        classificationtype: row.classificationtype ?? null,
        content: row.content ?? null,
        createdAt: row.createdAt,
        classificationConfiguration: row.classificationConfiguration ?? null,
        anomalyRef: row.anomaly != null ? { content: contentByAnomalyId.get(row.anomaly) ?? null } : null,
      }));
    },
    [`user-classifications-${userId}`],
    { revalidate: 300, tags: [`user-classifications-${userId}`] }
  )();
}

export async function getGamePageDataForUser(userId: string) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    profile,
    myClassifications,
    otherClassifications,
    roverDeposits,
    hubLeaderboard,
    linkedRows,
  ]: [
    Awaited<ReturnType<typeof getProfileForUser>> | null,
    RecentClassificationRow[],
    OtherClassificationRow[],
    boolean,
    Awaited<ReturnType<typeof getHubLeaderboard>>,
    LinkedAnomalyEntry[],
  ] = await Promise.all([
    safeQuery("profile", () => getProfileForUser(userId), null),
    safeQuery("myClassifications", () => getRecentClassificationsForUser(userId), []),
    safeQuery(
      "otherClassifications",
      async () => {
        const pb = await createPocketbaseAdminClient();
        const result = await pb.collection("classifications").getList(1, 20, {
          filter: pb.filter("author != {:author}", { author: userId }),
          sort: "-createdAt",
        });
        return result.items.map((row) => ({
          id: row.legacyId as number,
          classificationtype: (row.classificationtype as string) ?? null,
          content: (row.content as string) ?? null,
          author: (row.author as string) ?? null,
          createdAt: row.createdAt as string,
        }));
      },
      []
    ),
    safeQuery(
      "roverDeposits",
      async () => {
        const pb = await createPocketbaseAdminClient();
        const match = await pb
          .collection("mineral_deposits")
          .getFirstListItem(
            pb.filter("owner = {:owner} && roverName != ''", { owner: userId })
          )
          .catch(() => null);
        return match !== null;
      },
      false
    ),
    safeQuery(
      "hubLeaderboard",
      () => getHubLeaderboard(userId),
      { entries: [], currentUser: null }
    ),
    safeQuery("linkedAnomalies", () => getLinkedAnomaliesForUser(userId), []),
  ]);

  const linkedAnomalyIds = linkedRows.map((row) => row.anomalyId);

  const anomalyIdFilter =
    linkedAnomalyIds.length > 0
      ? "(" + linkedAnomalyIds.map((id) => `anomaly = ${id}`).join(" || ") + ")"
      : "";

  const [allUserClassifications, cloudClassifications] = await Promise.all([
    linkedAnomalyIds.length > 0
      ? safeQuery(
          "allUserClassifications",
          async () => {
            const pb = await createPocketbaseAdminClient();
            const rows = await pb.collection("classifications").getFullList({
              filter: pb.filter("author = {:author}", { author: userId }) + " && " + anomalyIdFilter,
              fields: "anomaly",
            });
            return rows.map((r) => r.anomaly as number | null);
          },
          []
        )
      : Promise.resolve([]),
    linkedAnomalyIds.length > 0
      ? safeQuery(
          "cloudClassifications",
          async () => {
            const pb = await createPocketbaseAdminClient();
            const rows = await pb.collection("classifications").getFullList({
              filter:
                pb.filter("author = {:author} && classificationtype = {:t}", { author: userId, t: "cloud" }) +
                " && " +
                anomalyIdFilter,
              fields: "anomaly",
            });
            return rows.map((r) => r.anomaly as number | null);
          },
          []
        )
      : Promise.resolve([]),
  ]);

  const classifiedAnomalyIds = new Set(
    allUserClassifications.filter((value): value is number => value !== null)
  );

  const classifiedCloudAnomalyIds = new Set(
    cloudClassifications.filter((value): value is number => value !== null)
  );

  const linkedAnomalies = linkedRows
    .filter((row) => {
      const isCloud = row.anomaly?.anomalytype === "cloud";
      if (!classifiedAnomalyIds.has(row.anomalyId)) return true;
      if (isCloud && classifiedCloudAnomalyIds.has(row.anomalyId)) return true;
      return false;
    })
    .map((row) => ({
      id: row.id,
      anomaly_id: row.anomalyId,
      date: row.date,
      automaton: row.automaton ?? undefined,
      unlocked: row.unlocked ?? undefined,
      anomaly: {
        id: Number(row.anomalyId),
        content: row.anomaly?.content ?? null,
        anomalytype: row.anomaly?.anomalytype ?? null,
        anomalySet: row.anomaly?.anomalySet ?? null,
      },
    }));

  const myClassificationIds = myClassifications.map((classification) => classification.id);
  const activityFeed = myClassificationIds.length
    ? await safeQuery("activityFeed", () => getActivityFeed(myClassificationIds, oneWeekAgo), [])
    : [];

  const transformedClassifications = myClassifications.map((classification) => ({
    id: classification.id,
    classificationtype: classification.classificationtype,
    content: classification.content,
    created_at: classification.createdAt,
    anomaly: {
      content: classification.anomalyRef?.content ?? null,
    },
    classificationConfiguration: parseConfig(classification.classificationConfiguration),
  }));

  const planetClassifications = transformedClassifications.filter(
    (classification) => classification.classificationtype === "planet"
  );
  const classificationIdsWithRadius = new Set(
    activityFeed
      .filter(
        (entry): entry is Extract<ActivityFeedItem, { type: "comment" }> =>
          entry.type === "comment" && entry.category === "Radius"
      )
      .map((entry) => entry.classification_id)
  );
  const incompletePlanet =
    planetClassifications.find((classification) => !classificationIdsWithRadius.has(classification.id)) ?? null;

  const planetTargets = planetClassifications
    .filter((classification) => classificationIdsWithRadius.has(classification.id))
    .map((classification) => ({
      id: classification.id,
      name: classification.anomaly?.content ?? `Planet #${classification.id}`,
    }));

  const visibleStructures = {
    telescope: true,
    satellites: transformedClassifications.length > 0,
    rovers: planetClassifications.length >= 5,
    balloons: transformedClassifications.length >= 10,
  };
  const referralCode =
    typeof profile?.referralCode === "string" && profile.referralCode.length > 0
      ? profile.referralCode
      : null;

  const [referralCount, hasReferralRecord] = await Promise.all([
    referralCode
      ? safeQuery(
          "referralCount",
          async () => {
            const pb = await createPocketbaseAdminClient();
            const result = await pb.collection("referrals").getList(1, 1, {
              filter: pb.filter("referralCode = {:c}", { c: referralCode }),
            });
            return result.totalItems;
          },
          0
        )
      : Promise.resolve(0),
    safeQuery(
      "hasReferralRecord",
      async () => {
        const pb = await createPocketbaseAdminClient();
        return pb
          .collection("referrals")
          .getFirstListItem(pb.filter("referreeId = {:id}", { id: userId }))
          .catch(() => null);
      },
      null
    ),
  ]);

  return {
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          full_name: profile.fullName,
          classificationPoints: Number(profile.classificationPoints ?? 0),
        }
      : null,
    classifications: transformedClassifications,
    linkedAnomalies,
    activityFeed,
    otherClassifications: otherClassifications.map((classification) => ({
      id: classification.id,
      classificationtype: classification.classificationtype,
      content: classification.content,
      author: classification.author ?? "",
      created_at: classification.createdAt,
    })),
    incompletePlanet,
    planetTargets,
    visibleStructures,
    hasRoverMineralDeposits: Boolean(roverDeposits),
    referralCode,
    referralCount,
    hasReferral: Boolean(hasReferralRecord),
    hubLeaderboard,
  };
}

async function getLinkedAnomaliesForUser(userId: string): Promise<LinkedAnomalyEntry[]> {
  const pb = await createPocketbaseAdminClient();
  const rows = await pb.collection("linked_anomalies").getFullList({
    filter: pb.filter("author = {:author}", { author: userId }),
    sort: "-date",
  });

  const anomalyIds = [...new Set(rows.map((r) => r.anomalyId).filter((a): a is number => a != null))];
  let anomalyById = new Map<number, { content: string | null; anomalytype: string | null; anomalySet: string | null }>();
  if (anomalyIds.length > 0) {
    const filter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
    const anomalies = await pb.collection("anomalies").getFullList({
      filter,
      fields: "legacyId,content,anomalytype,anomalySet",
    });
    anomalyById = new Map(
      anomalies.map((a) => [
        a.legacyId,
        { content: a.content ?? null, anomalytype: a.anomalytype ?? null, anomalySet: a.anomalySet ?? null },
      ])
    );
  }

  return rows.map((row) => ({
    id: row.legacyId,
    anomalyId: row.anomalyId,
    date: row.date,
    automaton: row.automaton ?? null,
    unlocked: row.unlocked ?? null,
    anomaly: anomalyById.get(row.anomalyId) ?? null,
  }));
}

async function getActivityFeed(classificationIds: number[], oneWeekAgo: Date): Promise<ActivityFeedItem[]> {
  const pb = await createPocketbaseAdminClient();
  const idFilter = "(" + classificationIds.map((id) => pb.filter("classificationId = {:id}", { id })).join(" || ") + ")";
  const dateFilter = pb.filter("createdAt >= {:d}", { d: oneWeekAgo.toISOString() });

  const [comments, votes] = await Promise.all([
    pb.collection("comments").getFullList({
      filter: `${idFilter} && ${dateFilter}`,
      fields: "createdAt,content,classificationId,category",
    }),
    pb.collection("votes").getFullList({
      filter: `${idFilter} && ${dateFilter}`,
      fields: "createdAt,voteType,classificationId",
    }),
  ]);

  return [
    ...comments
      .filter((comment): comment is typeof comment & { classificationId: number } => comment.classificationId != null)
      .map(
        (comment): ActivityFeedItem => ({
          type: "comment",
          created_at: comment.createdAt,
          content: comment.content ?? null,
          classification_id: comment.classificationId,
          category: comment.category ?? null,
        })
      ),
    ...votes
      .filter((vote): vote is typeof vote & { classificationId: number } => vote.classificationId != null)
      .map(
        (vote): ActivityFeedItem => ({
          type: "vote",
          created_at: vote.createdAt,
          vote_type: vote.voteType ?? "",
          classification_id: vote.classificationId,
        })
      ),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
