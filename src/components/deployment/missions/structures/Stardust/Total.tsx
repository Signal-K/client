// /Users/scroobz/Navigation/client/src/components/deployment/missions/structures/Stardust/Total.tsx

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

/**
 * ------------------------------------------------------------
 * Types & Interfaces (kept intentionally shallow to avoid TS2589)
 * ------------------------------------------------------------
 */

interface TotalPointsProps {
  onPointsUpdate?: (totalPoints: number) => void;
  onExport?: (points: {
    planetHuntersPoints: number;
    dailyMinorPlanetPoints: number;
    ai4mPoints: number;
    planetFourPoints: number;
    jvhPoints: number;
    cloudspottingPoints: number;
    planktonPoints: number;
    milestonePoints: number;
    totalPoints: number;
  }) => void;
  type?: string;
}

interface Milestone {
  name: string;
  structure: string;
  icon: string;
  group: "Biology" | "Astronomy" | "Meteorology";
  table: "classifications" | "comments" | "uploads";
  field: "classificationtype" | "category" | "source";
  value: string;
  requiredCount: number;
}

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
}

// VERY SIMPLE row shapes to prevent deep instantiation on Supabase generics.
// We only keep the fields we actually read.
type UUID = string;

interface ClassificationRow {
  id: UUID;
  author?: UUID;
  classificationtype?: string;
  created_at?: string;
  classificationConfiguration?: {
    classificationOptions?: Record<string, Record<string, boolean> | boolean | any>;
  } | null;
}

interface CommentRow {
  id: UUID;
  author?: UUID;
  classification_id: UUID | null;
  created_at?: string;
  configuration?: {
    planetType?: string | boolean | null;
  } | null;
}

interface VoteRow {
  id: UUID;
  user_id?: UUID;
  classification_id: UUID;
}

interface ProfileRow {
  referral_code?: string | null;
}

interface ResearchedRow {
  id: UUID;
  user_id?: UUID;
}

/**
 * The exposed API when a parent holds a ref to <TotalPoints ref={...} />
 */
export interface TotalPointsHandle {
  refreshPoints: () => Promise<void>;
  planetHuntersPoints: number;
  dailyMinorPlanetPoints: number;
  ai4mPoints: number;
  planetFourPoints: number;
  jvhPoints: number;
  planktonPoints: number;
  cloudspottingPoints: number;
  milestonePoints: number;
  researchedPenalty: number;
  totalPoints: number;
}

/**
 * ------------------------------------------------------------
 * Component
 * ------------------------------------------------------------
 */

const TotalPoints = forwardRef<TotalPointsHandle, TotalPointsProps>((props, ref) => {
  const { onPointsUpdate, type } = props;

  const supabase = useSupabaseClient();
  const session = useSession();

  // Explicit primitive state types keep inference shallow
  const [planetHuntersPoints, setPlanetHuntersPoints] = useState<number>(0);
  const [dailyMinorPlanetPoints, setDailyMinorPlanetPoints] = useState<number>(0);
  const [ai4mPoints, setAi4mPoints] = useState<number>(0);
  const [planetFourPoints, setPlanetFourPoints] = useState<number>(0);
  const [jvhPoints, setJvhPoints] = useState<number>(0);
  const [planktonPoints, setPlanktonPoints] = useState<number>(0);
  const [cloudspottingPoints, setCloudspottingPoints] = useState<number>(0);
  const [milestonePoints, setMilestonePoints] = useState<number>(0);
  const [researchedPenalty, setResearchedPenalty] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [referralPoints, setReferralPoints] = useState<number>(0);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, Record<string, number>>>({});

  const userId = session?.user?.id ?? null;

  /**
   * ------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------
   */

  const safeArray = <T,>(arr: T[] | null | undefined): T[] => (Array.isArray(arr) ? arr : []);

  const asClassifications = (data: any): ClassificationRow[] =>
    safeArray<ClassificationRow>(data as ClassificationRow[]);

  const asComments = (data: any): CommentRow[] => safeArray<CommentRow>(data as CommentRow[]);

  const asVotes = (data: any): VoteRow[] => safeArray<VoteRow>(data as VoteRow[]);

  /**
   * ------------------------------------------------------------
   * Fetchers (kept simple + narrow selects)
   * ------------------------------------------------------------
   */

  const fetchResearchedPenalty = async () => {
    if (!userId) {
      setResearchedPenalty(0);
      return;
    }
    const { data } = await supabase
      .from("researched")
      .select("id, user_id")
      .eq("user_id", userId);

    const items = safeArray<ResearchedRow>(data as ResearchedRow[]);
    setResearchedPenalty(items.length * 10); // Changed from 2 to 10 stardust per upgrade
  };

  const fetchReferralPoints = async () => {
    if (!userId) {
      setReferralPoints(0);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .maybeSingle();

    const profile = (profileData ?? {}) as ProfileRow;
    const referralCode = profile.referral_code ?? null;

    if (!referralCode) {
      setReferralPoints(0);
      return;
    }

    const { count } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", referralCode);

    setReferralPoints((count ?? 0) * 5);
  };

  const fetchPlanetHuntersPoints = async () => {
    if (!userId) {
      setPlanetHuntersPoints(0);
      return;
    }

    const { data: classificationsRaw } = await supabase
      .from("classifications")
      .select("id, author, classificationtype, created_at, classificationConfiguration")
      .eq("classificationtype", "planet")
      .eq("author", userId);

    const classifications = asClassifications(classificationsRaw);

    // Mission 1: any classification
    const mission1 = classifications.length;

    // Mission 2: "not option 1 and (2|3|4) selected"
    const mission2 =
      classifications.filter((c) => {
        const options =
          (c.classificationConfiguration?.classificationOptions?.[""] as Record<
            string,
            boolean
          > | null) ?? null;
        if (!options) return false;
        const opted234 = ["2", "3", "4"].some((k) => Boolean(options[k]));
        return !options["1"] && opted234;
      }).length || 0;

    const { data: commentsRaw } = await supabase
      .from("comments")
      .select("id, author, classification_id, configuration, created_at")
      .eq("author", userId);

    const comments = asComments(commentsRaw);

    // Mission 3: comment with planetType in configuration
    const mission3 = comments.filter((c) => Boolean(c.configuration?.planetType)).length;

    const { data: votesRaw } = await supabase
      .from("votes")
      .select("id, user_id, classification_id")
      .eq("user_id", userId);

    const votes = asVotes(votesRaw);
    const classificationIds = new Set(classifications.map((c) => c.id));

    // Mission 4: voted on a classification that is one of the user's planet classifications
    const mission4 = votes.filter((v) => classificationIds.has(v.classification_id)).length;

    // Mission 5: commented on a classification that is one of the user's planet classifications
    const mission5 = comments.filter((c) => c.classification_id && classificationIds.has(c.classification_id)).length;

    // Mission point weights (explicit to avoid inferred union indexing)
    const total =
      mission1 * 2 + // mission 1 worth 2
      mission2 * 1 + // mission 2 worth 1
      mission3 * 2 + // mission 3 worth 2
      mission4 * 1 + // mission 4 worth 1
      mission5 * 1;  // mission 5 worth 1

    setPlanetHuntersPoints(total);
  };

  const fetchDailyMinorPlanetPoints = async () => {
    if (!userId) {
      setDailyMinorPlanetPoints(0);
      return;
    }

    const { data: classificationsRaw } = await supabase
      .from("classifications")
      .select("id, author, classificationtype, created_at, classificationConfiguration")
      .eq("classificationtype", "telescope-minorPlanet")
      .eq("author", userId);

    const classifications = asClassifications(classificationsRaw);

    const mission1 = classifications.length;

    const mission2 =
      classifications.filter((c) => {
        const options =
          (c.classificationConfiguration?.classificationOptions?.[""] as Record<
            string,
            boolean
          > | null) ?? null;
        if (!options) return false;
        const some234 = ["2", "3", "4"].some((k) => Boolean(options[k]));
        return some234 && !options["1"];
      }).length || 0;

    const { data: commentsRaw } = await supabase
      .from("comments")
      .select("classification_id")
      .eq("author", userId);

    const { data: votesRaw } = await supabase
      .from("votes")
      .select("classification_id")
      .eq("user_id", userId);

    const comments = asComments(commentsRaw);
    const votes = asVotes(votesRaw);

    const ids = new Set(classifications.map((c) => c.id));

    // comments + votes on those same classifications
    const mission3 =
      comments.filter((c) => c.classification_id && ids.has(c.classification_id)).length +
      votes.filter((v) => ids.has(v.classification_id)).length;

    // count of classifications with >4 votes
    const mission4 =
      classifications.filter((c) => {
        const count = votes.filter((v) => v.classification_id === c.id).length;
        return count > 4;
      }).length || 0;

    const total = mission1 * 2 + mission2 * 1 + mission3 * 1 + mission4 * 3;
    setDailyMinorPlanetPoints(total);
  };

  const fetchAi4MPoints = async () => {
    if (!userId) {
      setAi4mPoints(0);
      return;
    }

    const { data: classificationsRaw } = await supabase
      .from("classifications")
      .select("id")
      .eq("author", userId)
      .eq("classificationtype", "automaton-aiForMars");

    const aiClassifications = asClassifications(classificationsRaw);

    const { data: commentsRaw } = await supabase
      .from("comments")
      .select("classification_id")
      .eq("author", userId);

    const comments = asComments(commentsRaw);
    const ids = new Set(aiClassifications.map((c) => c.id));
    const mission2 = comments.filter((c) => c.classification_id && ids.has(c.classification_id)).length;

    setAi4mPoints(aiClassifications.length + mission2);
  };

  const fetchPlanetFourPoints = async () => {
    if (!userId) {
      setPlanetFourPoints(0);
      return;
    }

    const { data: classificationsRaw } = await supabase
      .from("classifications")
      .select("id, author")
      .eq("classificationtype", "satellite-planetFour")
      .eq("author", userId);

    const classifications = asClassifications(classificationsRaw);

    const { data: commentsRaw } = await supabase
      .from("comments")
      .select("classification_id, author")
      .eq("author", userId);

    const comments = asComments(commentsRaw);

    const mission1 = classifications.length;
    const ids = new Set(classifications.map((c) => c.id));
    const mission2 = comments.filter((c) => c.classification_id && ids.has(c.classification_id)).length;

    setPlanetFourPoints(mission1 * 2 + mission2 * 2);
  };

  const fetchJvhPoints = async () => {
    if (!userId) {
      setJvhPoints(0);
      return;
    }

    const { data: classificationsRaw } = await supabase
      .from("classifications")
      .select("id")
      .eq("author", userId)
      .eq("classificationtype", "lidar-jovianVortexHunter");

    const classifications = asClassifications(classificationsRaw);

    const { data: commentsRaw } = await supabase
      .from("comments")
      .select("classification_id")
      .eq("author", userId);

    const comments = asComments(commentsRaw);
    const ids = new Set(classifications.map((c) => c.id));
    const mission2 = comments.filter((c) => c.classification_id && ids.has(c.classification_id)).length;

    setJvhPoints(classifications.length + mission2);
  };

  const fetchCloudspottingPoints = async () => {
    if (!userId) {
      setCloudspottingPoints(0);
      return;
    }

    const { data: classificationsRaw } = await supabase
      .from("classifications")
      .select("id, classificationConfiguration")
      .eq("author", userId)
      .eq("classificationtype", "cloud");

    const classifications = asClassifications(classificationsRaw);

    const mission1 = classifications.length;

    const mission2 =
      classifications.filter((c) => {
        const options =
          (c.classificationConfiguration?.classificationOptions?.[""] as Record<
            string,
            boolean
          > | null) ?? null;
        if (!options) return false;
        // any true in options
        return Object.values(options).some((v) => v === true);
      }).length || 0;

    const { data: commentsRaw } = await supabase
      .from("comments")
      .select("classification_id")
      .eq("author", userId);

    const comments = asComments(commentsRaw);
    const ids = new Set(classifications.map((c) => c.id));
    const mission3 = comments.filter((c) => c.classification_id && ids.has(c.classification_id)).length;

    setCloudspottingPoints(mission1 + mission2 + mission3);
  };

  // Plankton points fetcher placeholder — adjust if/when rules are defined.
  const fetchPlanktonPoints = async () => {
    // If you later define plankton missions, implement here similarly (narrow selects + shallow types)
    setPlanktonPoints(0);
  };

  /**
   * Weekly Milestones / Progress
   */
  const fetchMilestonesAndProgress = async () => {
    try {
      const res = await fetch("/api/gameplay/milestones");
      const data = await res.json();

      const sorted: WeekMilestones[] = safeArray<WeekMilestones>(data?.playerMilestones).sort(
        (a: WeekMilestones, b: WeekMilestones) =>
          new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
      );

      setMilestones(sorted);

      if (!userId) {
        setUserProgress({});
        setMilestonePoints(0);
        return;
      }

      const progressMap: Record<string, Record<string, number>> = {};

      for (const week of sorted) {
        const startDate = new Date(week.weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const weekKey = week.weekStart;
        progressMap[weekKey] = {};

        for (const milestone of week.data) {
          // Only count rows; head:true avoids fetching payload & complex types.
          const { count } = await supabase
            .from(milestone.table)
            .select("id", { count: "exact", head: true })
            .eq(milestone.field, milestone.value)
            .eq("author", userId)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString());

          progressMap[weekKey][milestone.name] = count ?? 0;
        }
      }

      setUserProgress(progressMap);

      // OPTIONAL: compute milestone points (simple scheme: +5 per milestone reached)
      // If you have a different rule, change here.
      let computed = 0;
      for (const week of sorted) {
        const key = week.weekStart;
        for (const m of week.data) {
          const reached = (progressMap[key]?.[m.name] ?? 0) >= m.requiredCount;
          if (reached) computed += 5;
        }
      }
      setMilestonePoints(computed);
    } catch {
      // Defensive: leave previously computed milestone state as-is on network error
    }
  };

  /**
   * ------------------------------------------------------------
   * Aggregate Fetch
   * ------------------------------------------------------------
   */

  const fetchAllPoints = async () => {
    setLoading(true);

    await Promise.all([
      fetchResearchedPenalty(),
      fetchPlanetHuntersPoints(),
      fetchDailyMinorPlanetPoints(),
      fetchAi4MPoints(),
      fetchPlanetFourPoints(),
      fetchJvhPoints(),
      fetchCloudspottingPoints(),
      fetchPlanktonPoints(),
      fetchReferralPoints(),
      fetchMilestonesAndProgress(),
    ]);

    // Use the most recent state values to compute total.
    const total =
      planetHuntersPoints +
      dailyMinorPlanetPoints +
      ai4mPoints +
      planetFourPoints +
      jvhPoints +
      cloudspottingPoints +
      planktonPoints +
      referralPoints +
      milestonePoints -
      researchedPenalty;

    setLoading(false);
    onPointsUpdate?.(total);
  };

  /**
   * ------------------------------------------------------------
   * Effects
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!userId) return;
    // Fire and forget is fine; internal calls await properly.
    void fetchAllPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase]); // keep deps minimal to avoid loops

  /**
   * ------------------------------------------------------------
   * Imperative Handle
   * ------------------------------------------------------------
   */

  useImperativeHandle(
    ref,
    (): TotalPointsHandle => ({
      refreshPoints: fetchAllPoints,
      planetHuntersPoints,
      dailyMinorPlanetPoints,
      ai4mPoints,
      planetFourPoints,
      jvhPoints,
      planktonPoints,
      cloudspottingPoints,
      milestonePoints,
      researchedPenalty,
      totalPoints:
        planetHuntersPoints +
        dailyMinorPlanetPoints +
        ai4mPoints +
        planetFourPoints +
        jvhPoints +
        cloudspottingPoints +
        planktonPoints +
        milestonePoints -
        researchedPenalty,
    }),
    [
      fetchAllPoints,
      planetHuntersPoints,
      dailyMinorPlanetPoints,
      ai4mPoints,
      planetFourPoints,
      jvhPoints,
      planktonPoints,
      cloudspottingPoints,
      milestonePoints,
      researchedPenalty,
    ]
  );

  /**
   * ------------------------------------------------------------
   * Conditional returns for specific type props
   * ------------------------------------------------------------
   */

  if (loading) {
    return <h1 className="text-md">Loading...</h1>;
  }

  const totalPoints =
    planetHuntersPoints +
    dailyMinorPlanetPoints +
    ai4mPoints +
    planetFourPoints +
    jvhPoints +
    cloudspottingPoints +
    referralPoints +
    planktonPoints +
    milestonePoints -
    researchedPenalty;

  // Narrow "type" readouts
  if (type === "ai4mPoints") return <span>{ai4mPoints}</span>;
  if (type === "planetHuntersPoints") return <span>{planetHuntersPoints}</span>;
  if (type === "dailyMinorPlanetPoints") return <span>{dailyMinorPlanetPoints}</span>;
  if (type === "planetFourPoints") return <span>{planetFourPoints}</span>;
  if (type === "jvhPoints") return <span>{jvhPoints}</span>;
  if (type === "cloudspottingPoints") return <span>{cloudspottingPoints}</span>;
  if (type === "planktonPoints") return <span>{planktonPoints}</span>;
  if (type === "milestonePoints") return <span>{milestonePoints}</span>;
  if (type === "researchedPenalty") return <span>{researchedPenalty}</span>;

  /**
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  const breakdown = (
    <div className="text-sm mt-2 space-y-1">
      <div>🪐 Planet Hunters: {planetHuntersPoints}</div>
      <div>📷 Daily Minor Planets: {dailyMinorPlanetPoints}</div>
      <div>🤖 AI4Mars: {ai4mPoints}</div>
      <div>🛰️ Planet Four: {planetFourPoints}</div>
      <div>🌪️ Jovian Vortex Hunter: {jvhPoints}</div>
      <div>☁️ Cloudspotting: {cloudspottingPoints}</div>
      <div>🌊 Plankton: {planktonPoints}</div>
      <div>🎯 Milestones: {milestonePoints}</div>
      <div>🎁 Referrals: {referralPoints}</div>
      <div>❌ Researched Penalty: -{researchedPenalty}</div>
    </div>
  );

  return (
    <div
      className="cursor-pointer"
      onClick={() => setShowBreakdown((prev) => !prev)}
      aria-label="Toggle points breakdown"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setShowBreakdown((p) => !p);
      }}
    >
      <div className="text-lg font-bold">{totalPoints}</div>
      {showBreakdown && breakdown}
    </div>
  );
});

TotalPoints.displayName = "TotalPoints";

export default TotalPoints;