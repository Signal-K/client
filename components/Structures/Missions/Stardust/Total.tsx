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
    totalPoints: number;
  }) => void;
}

const TotalPoints: React.FC<TotalPointsProps> = ({ onPointsUpdate, onExport }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [planetHuntersPoints, setPlanetHuntersPoints] = useState(0);
  const [dailyMinorPlanetPoints, setDailyMinorPlanetPoints] = useState(0);
  const [ai4mPoints, setAi4mPoints] = useState(0);
  const [planetFourPoints, setPlanetFourPoints] = useState(0);
  const [jvhPoints, setJvhPoints] = useState(0);
  const [cloudspottingPoints, setCloudspottingPoints] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

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

    const fetchAi4mPoints = async () => {
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "automaton-aiForMars")
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

        setAi4mPoints(totalPoints);
      } catch (error) {
        console.error("Error fetching AI4M points:", error);
      }
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
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "jovian-vortex-hunters")
          .eq("author", session.user.id);

        const mission1CompletedCount = classificationsData?.length ?? 0;
        const totalPoints = mission1CompletedCount * 3;

        setJvhPoints(totalPoints);
      } catch (error) {
        console.error("Error fetching Jovian Vortex Hunters points:", error);
      }
    };

    const fetchCloudspottingPoints = async () => {
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "cloudspotting")
          .eq("author", session.user.id);

        const mission1CompletedCount = classificationsData?.length ?? 0;
        const totalPoints = mission1CompletedCount * 2;

        setCloudspottingPoints(totalPoints);
      } catch (error) {
        console.error("Error fetching Cloudspotting points:", error);
      }
    };

    fetchPlanetHuntersPoints();
    fetchDailyMinorPlanetPoints();
    fetchAi4mPoints();
    fetchPlanetFourPoints();
    fetchJvhPoints();
    fetchCloudspottingPoints();
  }, [supabase, session?.user]);

  const totalPoints =
    planetHuntersPoints +
    dailyMinorPlanetPoints +
    ai4mPoints +
    planetFourPoints +
    jvhPoints +
    cloudspottingPoints;

  useEffect(() => {
    if (onPointsUpdate) {
      onPointsUpdate(totalPoints);
    }

    if (onExport) {
      onExport({
        planetHuntersPoints,
        dailyMinorPlanetPoints,
        ai4mPoints,
        planetFourPoints,
        jvhPoints,
        cloudspottingPoints,
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
  ]);

  return (
    <></>
    // <div className="bg-gray-900 p-6 rounded-lg text-white">
    //   <h1 className="text-xl font-bold mb-4">Total Points</h1>
    //   <p>Planet Hunters Points: {planetHuntersPoints}</p>
    //   <p>Daily Minor Planet Points: {dailyMinorPlanetPoints}</p>
    //   <p>AI4M Points: {ai4mPoints}</p>
    //   <p>Planet Four Points: {planetFourPoints}</p>
    //   <p>Jovian Vortex Hunters Points: {jvhPoints}</p>
    //   <p>Cloudspotting Points: {cloudspottingPoints}</p>
    //   <p className="mt-4 text-lg font-semibold">Total: {totalPoints}</p>
    // </div>
  );
};

export default TotalPoints;