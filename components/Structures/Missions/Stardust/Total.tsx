import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

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
};

interface TotalPointsRef {
  planetHuntersPoints: number;
  dailyMinorPlanetPoints: number;
  ai4mPoints: number;
  planetFourPoints: number;
  jvhPoints: number;
  cloudspottingPoints: number;
  planktonPoints: number;
  milestonePoints: number;
  researchedPenalty: number;
  totalPoints: number;
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
};

interface WeekMilestones {
  weekStart: string;
  data: Milestone[];
};

const TotalPoints = forwardRef<TotalPointsRef, TotalPointsProps>((props, ref) => {
  const { onPointsUpdate, type } = props;
  const supabase = useSupabaseClient();
  const session = useSession();

  const [planetHuntersPoints, setPlanetHuntersPoints] = useState(0);
  const [dailyMinorPlanetPoints, setDailyMinorPlanetPoints] = useState(0);
  const [ai4mPoints, setAi4mPoints] = useState(0);
  const [planetFourPoints, setPlanetFourPoints] = useState(0);
  const [jvhPoints, setJvhPoints] = useState(0);
  const [planktonPoints, setPlanktonPoints] = useState(0);
  const [cloudspottingPoints, setCloudspottingPoints] = useState(0);
  const [milestonePoints, setMilestonePoints] = useState(0);
  const [researchedPenalty, setResearchedPenalty] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  useImperativeHandle(ref, () => ({
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
  }));

  const [bonusPoints, setBonusPoints] = useState({
    bonusBiology: 0,
    bonusAstronomy: 0,
    bonusMeteorology: 0,
  });  

  const [milestones, setMilestones] = useState<WeekMilestones[]>([]);
  const [userProgress, setUserProgress] = useState<{
      [weekKey: string]: { [milestoneName: string]: number };
    }>({});
  
    useEffect(() => {
      const fetchData = async () => {
        const res = await fetch("/api/gameplay/milestones");
        const data = await res.json();
  
        const sorted = [...data.playerMilestones].sort(
          (a: WeekMilestones, b: WeekMilestones) =>
            new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        );
  
        setMilestones(sorted);
  
        if (!session?.user?.id) return;
  
        const progressMap: {
          [weekKey: string]: { [milestoneName: string]: number };
        } = {};
  
        for (const week of sorted) {
          const startDate = new Date(week.weekStart);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
  
          const weekKey = week.weekStart;
          progressMap[weekKey] = {};
  
          for (const milestone of week.data) {
            const { table, field, value } = milestone;
  
            const { count } = await supabase
              .from(table)
              .select("*", { count: "exact" })
              .eq(field, value)
              .eq("author", session.user.id)
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());
  
            progressMap[weekKey][milestone.name] = count || 0;
          }
        }
  
        setUserProgress(progressMap);
      };
  
      fetchData();
    }, [session]);

  useEffect(() => {
    if (!userId) return;

    const fetchAllPoints = async () => {
      setLoading(true);

      const fetchResearchedPenalty = async () => {
        const { data, error } = await supabase
          .from("researched")
          .select("*")
          .eq("user_id", userId);
        if (error) return;
        setResearchedPenalty((data?.length || 0) * 2);
      };

      const fetchPlanetHuntersPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", userId);

        const missionPoints = { 1: 2, 2: 1, 3: 2, 4: 1, 5: 1 };

        const mission1 = classifications?.length || 0;
        const mission2 = classifications?.filter((c) => {
          const options = c.classificationConfiguration?.classificationOptions?.[""] || {};
          return !options["1"] && (options["2"] || options["3"] || options["4"]);
        }).length || 0;

        const { data: comments } = await supabase
          .from("comments")
          .select("*")
          .eq("author", userId);

        const mission3 = comments?.filter(c => c.configuration?.planetType).length || 0;

        const { data: votes } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", userId);

        const mission4 = votes?.filter((vote) =>
          classifications?.some((c) => c.id === vote.classification_id)
        ).length || 0;

        const mission5 = comments?.filter((comment) =>
          comment.classification_id &&
          classifications?.some((c) => c.id === comment.classification_id)
        ).length || 0;

        const total =
          mission1 * missionPoints[1] +
          mission2 * missionPoints[2] +
          mission3 * missionPoints[3] +
          mission4 * missionPoints[4] +
          mission5 * missionPoints[5];

        setPlanetHuntersPoints(total);
      };

      const fetchDailyMinorPlanetPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("classificationtype", "telescope-minorPlanet")
          .eq("author", userId);

        const mission1 = classifications?.length || 0;
        const mission2 = classifications?.filter((c) => {
          const options = c.classificationConfiguration?.classificationOptions?.[""] || {};
          return ["2", "3", "4"].some((opt) => options[opt]) && !options["1"];
        }).length || 0;

        const { data: comments } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", userId);

        const { data: votes } = await supabase
          .from("votes")
          .select("classification_id")
          .eq("user_id", userId);

        const ids = new Set(classifications?.map((c) => c.id));
        const mission3 =
          (comments?.filter((c) => ids.has(c.classification_id)).length || 0) +
          (votes?.filter((v) => ids.has(v.classification_id)).length || 0);

        const mission4 = classifications?.filter((c) => {
          const count = votes?.filter((v) => v.classification_id === c.id).length || 0;
          return count > 4;
        }).length || 0;

        const total = mission1 * 2 + mission2 * 1 + mission3 * 1 + mission4 * 3;
        setDailyMinorPlanetPoints(total);
      };

      const fetchAi4MPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id")
          .eq("author", userId)
          .eq("classificationtype", "automaton-aiForMars");

        const { data: comments } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", userId);

        const ids = classifications?.map((c) => c.id) || [];
        const mission2 = comments?.filter((c) => ids.includes(c.classification_id)).length || 0;

        setAi4mPoints((classifications?.length || 0) + mission2);
      };

      const fetchPlanetFourPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "satellite-planetFour")
          .eq("author", userId);

        const { data: comments } = await supabase
          .from("comments")
          .select("*")
          .eq("author", userId);

        const mission1 = classifications?.length || 0;
        const mission2 = comments?.filter((comment) =>
          classifications?.some((c) => c.id === comment.classification_id)
        ).length || 0;

        setPlanetFourPoints(mission1 * 2 + mission2 * 2);
      };

      const fetchJvhPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id")
          .eq("author", userId)
          .eq("classificationtype", "lidar-jovianVortexHunter");

        const { data: comments } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", userId);

        const ids = classifications?.map((c) => c.id) || [];
        const mission2 = comments?.filter((c) => ids.includes(c.classification_id)).length || 0;

        setJvhPoints((classifications?.length || 0) + mission2);
      };

      const fetchCloudspottingPoints = async () => {
        const { data: classifications } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("author", userId)
          .eq("classificationtype", "cloud");

        const mission1 = classifications?.length || 0;
        const mission2 = classifications?.filter((c) => {
          const options = c.classificationConfiguration?.classificationOptions?.[""] || {};
          return Object.values(options).some((v) => v === true);
        }).length || 0;

        const { data: comments } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", userId);

        const ids = classifications?.map((c) => c.id) || [];
        const mission3 = comments?.filter((c) => ids.includes(c.classification_id)).length || 0;

        setCloudspottingPoints(mission1 + mission2 + mission3);
      };

      await Promise.all([
        fetchResearchedPenalty(),
        fetchPlanetHuntersPoints(),
        fetchDailyMinorPlanetPoints(),
        fetchAi4MPoints(),
        fetchPlanetFourPoints(),
        fetchJvhPoints(),
        fetchCloudspottingPoints(),
      ]);

      const totalPoints =
        planetHuntersPoints +
        dailyMinorPlanetPoints +
        ai4mPoints +
        planetFourPoints +
        jvhPoints +
        cloudspottingPoints +
        planktonPoints +
        milestonePoints -
        researchedPenalty;

      setLoading(false);
      if (onPointsUpdate) onPointsUpdate(totalPoints);
    };

    fetchAllPoints();
  }, [userId, supabase]);

  if (loading) {
    return <h1 className="text-md">Loading...</h1>;
  };

  const totalPoints =
    planetHuntersPoints +
    dailyMinorPlanetPoints +
    ai4mPoints +
    planetFourPoints +
    jvhPoints +
    cloudspottingPoints +
    planktonPoints +
    milestonePoints -
    researchedPenalty;

    if (type === "ai4mPoints") {
      return <span>{ai4mPoints}</span>;
    };

  if (type === "planetHuntersPoints") {
    return <span>{planetHuntersPoints}</span>;
  };

  if (type === "dailyMinorPlanetPoints") {
    return <span>{dailyMinorPlanetPoints}</span>;
  };

  if (type === "planetFourPoints") {
    return <span>{planetFourPoints}</span>;
  };

  if (type === "jvhPoints") {
    return <span>{jvhPoints}</span>;
  };

  if (type === "cloudspottingPoints") {
    return <span>{cloudspottingPoints}</span>;
  };

  if (type === "planktonPoints") {
    return <span>{planktonPoints}</span>;
  };

  if (type === "milestonePoints") {
    return <span>{milestonePoints}</span>;
  };

  if (type === "researchedPenalty") {
    return <span>{researchedPenalty}</span>;
  };

  // if (type === "groups") {
  //   return (

  //   )
  // }

  return (
    <div>
      {totalPoints}
    </div>
  );
});

export default TotalPoints;