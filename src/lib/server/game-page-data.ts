import { prisma } from "@/lib/server/prisma";
import { getHubLeaderboard } from "@/src/lib/server/hub-leaderboard";

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
  id: bigint;
  anomalyId: bigint;
  date: Date;
  automaton: string | null;
  unlocked?: boolean | null;
  anomaly: {
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
};

export async function getGamePageDataForUser(userId: string) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    profile,
    myClassifications,
    allUserClassifications,
    cloudClassifications,
    otherClassifications,
    roverDeposits,
    hubLeaderboard,
  ] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        classificationPoints: true,
        referralCode: true,
      },
    }),
    prisma.classification.findMany({
      where: { author: userId },
      include: {
        anomalyRef: {
          select: { content: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.classification.findMany({
      where: { author: userId },
      select: { anomaly: true },
    }),
    prisma.classification.findMany({
      where: { author: userId, classificationtype: "cloud" },
      select: { anomaly: true },
    }),
    prisma.classification.findMany({
      where: { author: { not: userId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        classificationtype: true,
        content: true,
        author: true,
        createdAt: true,
      },
    }),
    prisma.mineralDeposit.findFirst({
      where: { owner: userId, roverName: { not: null } },
      select: { id: true },
    }),
    getHubLeaderboard(userId),
  ]);

  const classifiedAnomalyIds = new Set(
    allUserClassifications
      .map((classification) => classification.anomaly)
      .filter((value): value is bigint => value !== null)
  );

  const classifiedCloudAnomalyIds = new Set(
    cloudClassifications
      .map((classification) => classification.anomaly)
      .filter((value): value is bigint => value !== null)
  );

  const linkedRows = await getLinkedAnomaliesForUser(userId);

  const linkedAnomalies = linkedRows
    .filter((row) => {
      const isCloud = row.anomaly?.anomalytype === "cloud";
      if (!classifiedAnomalyIds.has(row.anomalyId)) return true;
      if (isCloud && classifiedCloudAnomalyIds.has(row.anomalyId)) return true;
      return false;
    })
    .map((row) => ({
      id: Number(row.id),
      anomaly_id: Number(row.anomalyId),
      date: row.date.toISOString(),
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
    ? await getActivityFeed(myClassificationIds, oneWeekAgo)
    : [];

  const transformedClassifications = myClassifications.map((classification) => ({
    id: Number(classification.id),
    classificationtype: classification.classificationtype,
    content: classification.content,
    created_at: classification.createdAt.toISOString(),
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

  const [referralCount, hasReferralRecord] = await Promise.all([
    profile?.referralCode
      ? prisma.referral.count({
          where: { referralCode: profile.referralCode },
        })
      : Promise.resolve(0),
    prisma.referral.findFirst({
      where: { referreeId: userId },
      select: { id: true },
    }),
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
      id: Number(classification.id),
      classificationtype: classification.classificationtype,
      content: classification.content,
      author: classification.author ?? "",
      created_at: classification.createdAt.toISOString(),
    })),
    incompletePlanet,
    planetTargets,
    visibleStructures,
    hasRoverMineralDeposits: Boolean(roverDeposits),
    referralCode: profile?.referralCode ?? null,
    referralCount,
    hasReferral: Boolean(hasReferralRecord),
    hubLeaderboard,
  };
}

async function getLinkedAnomaliesForUser(userId: string) {
  try {
    const rows = await prisma.linkedAnomaly.findMany({
      where: { author: userId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        anomalyId: true,
        date: true,
        automaton: true,
        unlocked: true,
        anomaly: {
          select: {
            content: true,
            anomalytype: true,
            anomalySet: true,
          },
        },
      },
    });
    return rows satisfies LinkedAnomalyEntry[];
  } catch {
    const rows = await prisma.linkedAnomaly.findMany({
      where: { author: userId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        anomalyId: true,
        date: true,
        automaton: true,
        anomaly: {
          select: {
            content: true,
            anomalytype: true,
            anomalySet: true,
          },
        },
      },
    });
    return rows.map((row) => ({
      ...row,
      unlocked: undefined,
    })) satisfies LinkedAnomalyEntry[];
  }
}

async function getActivityFeed(classificationIds: bigint[], oneWeekAgo: Date) {
  const [comments, votes] = await Promise.all([
    prisma.comment.findMany({
      where: {
        classificationId: { in: classificationIds },
        createdAt: { gte: oneWeekAgo },
      },
      select: {
        createdAt: true,
        content: true,
        classificationId: true,
        category: true,
      },
    }),
    prisma.vote.findMany({
      where: {
        classificationId: { in: classificationIds },
        createdAt: { gte: oneWeekAgo },
      },
      select: {
        createdAt: true,
        voteType: true,
        classificationId: true,
      },
    }),
  ]);

  return [
    ...comments
      .filter(
        (comment): comment is typeof comment & { classificationId: bigint } => comment.classificationId !== null
      )
      .map(
        (comment): ActivityFeedItem => ({
          type: "comment",
          created_at: comment.createdAt.toISOString(),
          content: comment.content ?? null,
          classification_id: Number(comment.classificationId),
          category: comment.category ?? null,
        })
      ),
    ...votes
      .filter((vote): vote is typeof vote & { classificationId: bigint } => vote.classificationId !== null)
      .map(
        (vote): ActivityFeedItem => ({
          type: "vote",
          created_at: vote.createdAt.toISOString(),
          vote_type: vote.voteType ?? "",
          classification_id: Number(vote.classificationId),
        })
      ),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
