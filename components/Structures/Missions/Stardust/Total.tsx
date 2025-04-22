import { useEffect, useState } from "react";
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
};

const TotalPoints: React.FC<TotalPointsProps> = ({ onPointsUpdate, onExport }) => {
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

  useEffect(() => {
    if (!session?.user) return;

    const fetchMilestonePoints = async () => {
      try {
        const res = await fetch("/api/gameplay/milestones");
        const data = await res.json();
        const { playerMilestones } = data;
        const userId = session.user.id;

        const currentWeek = playerMilestones[playerMilestones.length - 1];
        const startDate = new Date(currentWeek.weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        let total = 0;
        for (const milestone of currentWeek.data) {
          const { table, field, value, name } = milestone;
          const { count } = await supabase
            .from(table)
            .select("*", { count: "exact" })
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .eq(field, value)
            .eq("author", userId);
          total += count || 0;
        }
 
        setMilestonePoints(total);
      } catch (error) {
        console.error("Error fetching milestone points:", error);
      }
    };

    const fetchPlanetHuntersPoints = async () => {
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", session.user.id);

        const missionPoints = {
          1: 2,
          2: 1,
          3: 2,
          4: 1,
          5: 1,
        };

        const mission1CompletedCount = classificationsData?.length ?? 0;
        const mission2CompletedCount = classificationsData?.filter((classification) => {
          const config = classification.classificationConfiguration;
          if (!config) return false;
          const options = config.classificationOptions?.[""] || {};
          return (
            !options["1"] &&
            (options["2"] || options["3"] || options["4"])
          );
        }).length ?? 0;

        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("author", session.user.id);

        const mission3CompletedCount = commentsData?.filter(
          (comment) => comment.configuration?.planetType
        ).length ?? 0;

        const { data: votesData } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", session.user.id);

        const mission4CompletedCount = votesData?.filter((vote) =>
          classificationsData?.some(
            (classification) =>
              classification.id === vote.classification_id &&
              classification.classificationtype === "planet"
          )
        ).length ?? 0;

        const mission5CompletedCount = commentsData?.filter(
          (comment) =>
            comment.classification_id &&
            classificationsData?.some(
              (classification) =>
                classification.id === comment.classification_id &&
                classification.classificationtype === "planet"
            )
        ).length ?? 0;

        const totalPoints =
          mission1CompletedCount * missionPoints[1] +
          mission2CompletedCount * missionPoints[2] +
          mission3CompletedCount * missionPoints[3] +
          mission4CompletedCount * missionPoints[4] +
          mission5CompletedCount * missionPoints[5];

        setPlanetHuntersPoints(totalPoints);
      } catch (error) {
        console.error("Error fetching Planet Hunters points:", error);
      }
    };

    const fetchDailyMinorPlanetPoints = async () => {
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("classificationtype", "telescope-minorPlanet")
          .eq("author", session.user.id);

        const mission1CompletedCount = classificationsData?.length ?? 0;

        const mission2CompletedCount = classificationsData?.filter(({ classificationConfiguration }) => {
          const options = classificationConfiguration?.classificationOptions?.[""] || {};
          const hasValidOptions = ["2", "3", "4"].some((option) => options[option]);
          const hasInvalidOption = options["1"];
          return hasValidOptions && !hasInvalidOption;
        }).length ?? 0;

        const { data: commentsData } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", session.user.id);

        const { data: votesData } = await supabase
          .from("votes")
          .select("classification_id")
          .eq("user_id", session.user.id);

        const validClassificationIds = new Set(
          classificationsData?.map((classification) => classification.id) ?? []
        );

        const mission3CompletedCount =
          (commentsData?.filter(({ classification_id }) => validClassificationIds.has(classification_id)).length ?? 0) +
          (votesData?.filter(({ classification_id }) => validClassificationIds.has(classification_id)).length ?? 0);

        const mission4CompletedCount = classificationsData?.filter(({ id: classificationId }) => {
          const voteCount = votesData?.filter(({ classification_id }) => classification_id === classificationId)
            .length ?? 0;
          return voteCount > 4.9999;
        }).length ?? 0;

        const totalPoints =
          mission1CompletedCount * 2 +
          mission2CompletedCount * 1 +
          mission3CompletedCount * 1 +
          mission4CompletedCount * 3;

        setDailyMinorPlanetPoints(totalPoints);
      } catch (error) {
        console.error("Error fetching Daily Minor Planet points:", error);
      }
    };

    const fetchAi4MPoints = async () => {
      const { data: classifications } = await supabase
        .from("classifications")
        .select("id, classificationtype, classificationConfiguration")
        .eq("author", session.user.id)
        .eq("classificationtype", "automaton-aiForMars");

      const mission1Points = classifications?.length || 0;

      const { data: comments } = await supabase
        .from("comments")
        .select("id, classification_id")
        .eq("author", session.user.id);

      const classificationIds = classifications?.map((c: any) => c.id) || [];
      const mission2Points = comments?.filter((comment: any) =>
        classificationIds.includes(comment.classification_id)
      ).length || 0;

      setAi4mPoints(mission1Points + mission2Points);
    };

    const fetchPlanetFourPoints = async () => {
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "satellite-planetFour")
          .eq("author", session.user.id);

        const mission1CompletedCount = classificationsData?.length ?? 0;

        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("author", session.user.id);

        const mission2CompletedCount = commentsData?.filter(
          (comment) => comment.classification_id && classificationsData?.some(
            (classification) => classification.id === comment.classification_id
          )
        ).length ?? 0;

        const totalPoints = mission1CompletedCount * 2 + mission2CompletedCount * 2;

        setPlanetFourPoints(totalPoints);
      } catch (error) {
        console.error("Error fetching Planet Four points:", error);
      }
    };

    const fetchJvhPoints = async () => {
      const { data: classifications } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .eq("classificationtype", "lidar-jovianVortexHunter");

      const mission1Points = classifications?.length || 0;

      const { data: comments } = await supabase
        .from("comments")
        .select("id, classification_id")
        .eq("author", session.user.id);

      const classificationIds = classifications?.map((c) => c.id) || [];
      const mission2Points = comments?.filter((comment) =>
        classificationIds.includes(comment.classification_id)
      ).length || 0;

      setJvhPoints(mission1Points + mission2Points);
    };

    const fetchCloudspottingPoints = async () => {
      const { data: classifications } = await supabase
        .from("classifications")
        .select("id, classificationtype, classificationConfiguration")
        .eq("author", session.user.id)
        .eq("classificationtype", "cloud");

      const mission1Points = classifications?.length || 0;

      const mission2Points = classifications?.filter((classification: any) => {
        const config = classification.classificationConfiguration || {};
        const options = config?.classificationOptions?.[""] || {};
        return Object.values(options).some((value) => value === true);
      }).length || 0;

      const { data: comments } = await supabase
        .from("comments")
        .select("id, classification_id")
        .eq("author", session.user.id);

      const classificationIds = classifications?.map((c: any) => c.id) || [];
      const mission3Points = comments?.filter((comment: any) =>
        classificationIds.includes(comment.classification_id)
      ).length || 0;

      setCloudspottingPoints(mission1Points + mission2Points + mission3Points);
    };

    fetchPlanetHuntersPoints();
    fetchDailyMinorPlanetPoints();
    fetchAi4MPoints();
    fetchPlanetFourPoints();
    fetchJvhPoints();
    fetchCloudspottingPoints();
    fetchMilestonePoints();
  }, [supabase, session?.user]);

  const totalPoints =
    planetHuntersPoints +
    dailyMinorPlanetPoints +
    ai4mPoints +
    planetFourPoints +
    jvhPoints +
    cloudspottingPoints +
    planktonPoints +
    milestonePoints;

  useEffect(() => {
    if (onPointsUpdate) onPointsUpdate(totalPoints);

    if (onExport) {
      onExport({
        planetHuntersPoints,
        dailyMinorPlanetPoints,
        ai4mPoints,
        planetFourPoints,
        jvhPoints,
        cloudspottingPoints,
        planktonPoints,
        milestonePoints,
        totalPoints,
      });
    }
  }, [
    totalPoints,
    onPointsUpdate,
    onExport,
    planetHuntersPoints,
    dailyMinorPlanetPoints,
    ai4mPoints,
    planetFourPoints,
    jvhPoints,
    cloudspottingPoints,
    planktonPoints,
    milestonePoints,
  ]);

  return (
    // <div className="bg-gray-900 p-6 rounded-lg text-white space-y-6">
      <h1 className="text-md">{totalPoints}</h1>
    );

      {/* <div>
        <h2 className="text-lg font-semibold text-indigo-400 mb-2">Astronomy</h2>
        <ul className="space-y-1 pl-4">
          <li>🔭 Planet Hunters: {planetHuntersPoints}</li>
          <li>🌌 Daily Minor Planets: {dailyMinorPlanetPoints}</li>
          <li>🧠 AI4M (AI for Mars): {ai4mPoints}</li>
          <li>🪐 Planet Four: {planetFourPoints}</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-blue-400 mb-2">Meteorology</h2>
        <ul className="space-y-1 pl-4">
          <li>☁️ Cloudspotting: {cloudspottingPoints}</li>
          <li>🌀 Jovian Vortex Hunter: {jvhPoints}</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-green-400 mb-2">Biology</h2>
        <ul className="space-y-1 pl-4">
          <li>🧫 Plankton Detectives: {planktonPoints}</li>
        </ul>
      </div>
    </div> */}
};

export default TotalPoints;