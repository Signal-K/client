import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useGroupedClassifications } from "@/hooks/useGroupedClassifications";

export { useGroupedClassifications };

const CACHE_KEY = 'pageDataCache';

const getCachedData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        // Basic validation
        const data = JSON.parse(cached);
        if (data && typeof data === 'object') {
          return data;
        }
      } catch (e) {
        console.error("Failed to parse cached data", e);
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (e) {
    console.error("Failed to read cached data", e);
  }
  return null;
};

const setCachedData = (data: any) => {
  if (typeof window === 'undefined') return;
  try {
    const dataToCache = {
      linkedAnomalies: data.linkedAnomalies,
      activityFeed: data.activityFeed,
      profile: data.profile,
      classifications: data.classifications,
      otherClassifications: data.otherClassifications,
      incompletePlanet: data.incompletePlanet,
      planetTargets: data.planetTargets,
      visibleStructures: data.visibleStructures,
      hasRoverMineralDeposits: data.hasRoverMineralDeposits,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
  } catch (e) {
    console.error("Failed to set cached data", e);
  }
};

interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

interface Classification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly: {
    content: string | null;
  } | null;
  classificationConfiguration?: {
    annotationOptions?: string[];
    [key: string]: any;
  };
}

interface LinkedAnomaly {
  id: number;
  anomaly_id: number;
  date: string;
  automaton?: string; // Added automaton field
  unlocked?: boolean; // Added unlocked field
  anomaly: {
    id: number | null; // Added id field
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
}

interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  classificationPoints: number | null;
}

export function usePageData() {
  const session = useSession();

  const [linkedAnomalies, setLinkedAnomalies] = useState<LinkedAnomaly[]>([]);
  const [activityFeed, setActivityFeed] = useState<CommentVote[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [otherClassifications, setOtherClassifications] = useState<OtherClassification[]>([]);
  const [incompletePlanet, setIncompletePlanet] = useState<Classification | null>(null);
  const [planetTargets, setPlanetTargets] = useState<{ id: number; name: string }[]>([]);
  const [visibleStructures, setVisibleStructures] = useState({
    telescope: true,
    satellites: true,
    rovers: false,
    balloons: false
  });
  const [loading, setLoading] = useState(true);
  const [hasRoverMineralDeposits, setHasRoverMineralDeposits] = useState(false);

  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setLinkedAnomalies(cachedData.linkedAnomalies || []);
      setActivityFeed(cachedData.activityFeed || []);
      setProfile(cachedData.profile || null);
      setClassifications(cachedData.classifications || []);
      setOtherClassifications(cachedData.otherClassifications || []);
      setIncompletePlanet(cachedData.incompletePlanet || null);
      setPlanetTargets(cachedData.planetTargets || []);
      setVisibleStructures(cachedData.visibleStructures || { telescope: true, satellites: true, rovers: false, balloons: false });
      setHasRoverMineralDeposits(cachedData.hasRoverMineralDeposits || false);
      setLoading(false); // We have data, so not loading anymore
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

      setProfile(payload.profile ?? null);
      setClassifications(payload.classifications ?? []);
      setLinkedAnomalies(payload.linkedAnomalies ?? []);
      setActivityFeed(payload.activityFeed ?? []);
      setOtherClassifications(payload.otherClassifications ?? []);
      setIncompletePlanet(payload.incompletePlanet ?? null);
      setPlanetTargets(payload.planetTargets ?? []);
      setVisibleStructures(
        payload.visibleStructures ?? { telescope: true, satellites: true, rovers: false, balloons: false }
      );
      setHasRoverMineralDeposits(Boolean(payload.hasRoverMineralDeposits));

      setCachedData({
        linkedAnomalies: payload.linkedAnomalies ?? [],
        activityFeed: payload.activityFeed ?? [],
        profile: payload.profile ?? null,
        classifications: payload.classifications ?? [],
        otherClassifications: payload.otherClassifications ?? [],
        incompletePlanet: payload.incompletePlanet ?? null,
        planetTargets: payload.planetTargets ?? [],
        visibleStructures:
          payload.visibleStructures ?? { telescope: true, satellites: true, rovers: false, balloons: false },
        hasRoverMineralDeposits: Boolean(payload.hasRoverMineralDeposits),
      });
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
    // Data
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    loading,
    hasRoverMineralDeposits,
    
    // Functions
    refetchData: fetchData,
    refetchPlanets: fetchData,
  };
}
