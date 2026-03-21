import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import type {
  CommentVote,
  Classification,
  LinkedAnomaly,
  OtherClassification,
  UserProfile,
  VisibleStructures,
} from "@/types/game";

const CACHE_KEY = "pageDataCache";
const DEFAULT_STRUCTURES: VisibleStructures = { telescope: true, satellites: true, rovers: false, balloons: false };

function getCachedData() {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached);
    return data && typeof data === "object" ? data : null;
  } catch {
    try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    return null;
  }
}

function setCachedData(data: PageData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, timestamp: new Date().toISOString() }));
  } catch { /* ignore */ }
}

interface PageData {
  linkedAnomalies: LinkedAnomaly[];
  activityFeed: CommentVote[];
  profile: UserProfile | null;
  classifications: Classification[];
  otherClassifications: OtherClassification[];
  incompletePlanet: Classification | null;
  planetTargets: { id: number; name: string }[];
  visibleStructures: VisibleStructures;
  hasRoverMineralDeposits: boolean;
}

const DEFAULT_DATA: PageData = {
  linkedAnomalies: [],
  activityFeed: [],
  profile: null,
  classifications: [],
  otherClassifications: [],
  incompletePlanet: null,
  planetTargets: [],
  visibleStructures: DEFAULT_STRUCTURES,
  hasRoverMineralDeposits: false,
};

export function usePageData() {
  const session = useSession();
  const [data, setData] = useState<PageData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setData({
        linkedAnomalies: cached.linkedAnomalies ?? [],
        activityFeed: cached.activityFeed ?? [],
        profile: cached.profile ?? null,
        classifications: cached.classifications ?? [],
        otherClassifications: cached.otherClassifications ?? [],
        incompletePlanet: cached.incompletePlanet ?? null,
        planetTargets: cached.planetTargets ?? [],
        visibleStructures: cached.visibleStructures ?? DEFAULT_STRUCTURES,
        hasRoverMineralDeposits: cached.hasRoverMineralDeposits ?? false,
      });
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/gameplay/page-data", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(payload?.error || "Failed to fetch page data");
      }

      const next: PageData = {
        linkedAnomalies: payload.linkedAnomalies ?? [],
        activityFeed: payload.activityFeed ?? [],
        profile: payload.profile ?? null,
        classifications: payload.classifications ?? [],
        otherClassifications: payload.otherClassifications ?? [],
        incompletePlanet: payload.incompletePlanet ?? null,
        planetTargets: payload.planetTargets ?? [],
        visibleStructures: payload.visibleStructures ?? DEFAULT_STRUCTURES,
        hasRoverMineralDeposits: Boolean(payload.hasRoverMineralDeposits),
      };

      setData(next);
      setCachedData(next);
    } catch (e) {
      console.error("usePageData fetchData failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);

  return {
    ...data,
    loading,
    refetchData: fetchData,
  };
}
