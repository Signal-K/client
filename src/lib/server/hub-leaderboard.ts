import { prisma } from "@/lib/server/prisma";

export interface HubLeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface HubLeaderboardData {
  entries: HubLeaderboardEntry[];
  currentUser: HubLeaderboardEntry | null;
}

export async function getHubLeaderboard(userId: string): Promise<HubLeaderboardData> {
  const topProfiles = await prisma.profile.findMany({
    orderBy: [{ classificationPoints: "desc" }, { updatedAt: "asc" }],
    take: 5,
    select: {
      id: true,
      username: true,
      classificationPoints: true,
    },
  });

  const me = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      classificationPoints: true,
    },
  });

  const myScore = Number(me?.classificationPoints ?? 0);
  const higherCount = await prisma.profile.count({
    where: {
      classificationPoints: {
        gt: BigInt(myScore),
      },
    },
  });

  const entries = topProfiles.map((profile, index) => ({
    rank: index + 1,
    username: profile.username || `Sailor ${profile.id.slice(0, 6)}`,
    score: Number(profile.classificationPoints ?? 0),
    isCurrentUser: profile.id === userId,
  }));

  const currentUserEntry: HubLeaderboardEntry | null = me
    ? {
        rank: higherCount + 1,
        username: me.username || `Sailor ${me.id.slice(0, 6)}`,
        score: myScore,
        isCurrentUser: true,
      }
    : null;

  return {
    entries,
    currentUser:
      currentUserEntry && entries.some((entry) => entry.isCurrentUser)
        ? null
        : currentUserEntry,
  };
}
