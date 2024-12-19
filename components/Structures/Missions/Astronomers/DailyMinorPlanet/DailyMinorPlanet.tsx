import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { RadioIcon, SpeechIcon, TelescopeIcon, VoteIcon } from "lucide-react";
import MissionShell from "../../BasePlate";
import { DailyMinorPlanet } from "@/components/Projects/Telescopes/DailyMinorPlanet";
import VoteDMPClassifications from "./DMPVote";

const DailyMinorPlanetMissions = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState([
    {
      id: 1,
      title: "Make an asteroid classification",
      description: "Use your telescope to look for an asteroid candidate.",
      icon: TelescopeIcon,
      points: 2,
      completedCount: 0,
      internalComponent: () => <DailyMinorPlanet />,
      color: "text-blue-500",
      shadow: false,
      action: () => {},
    },
    {
      id: 2,
      title: "Propose an asteroid candidate",
      description: "Make a classification indicating a positive asteroid candidate.",
      icon: RadioIcon,
      points: 1,
      completedCount: 0,
      internalComponent: () => <DailyMinorPlanet />,
      color: "text-green-500",
      shadow: false,
      action: () => {},
    },
    {
      id: 3,
      title: "Vote & comment on classifications",
      description:
        "Work with other players to rate proposed asteroid candidates and get rewards.",
      icon: SpeechIcon,
      points: 1,
      completedCount: 0,
      internalComponent: () => <VoteDMPClassifications />,
      color: "text-cyan-600",
      shadow: true,
      action: () => {},
    },
    {
      id: 4,
      title: "Have an asteroid candidate confirmed",
      description:
        "When one of your proposals gets 5 upvotes by the community, it is considered a valid asteroid, and you can begin surveying it in Chapter 2.",
      icon: VoteIcon,
      points: 3,
      completedCount: 0,
      internalComponent: () => <div></div>,
      color: "text-red-700",
      shadow: true,
      action: () => {},
    },
  ]);

  const [experiencePoints, setExperiencePoints] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (!session?.user) return;

    const fetchMissionData = async () => {
      try {
        const { data: classificationsData, error: classificationsError } = await supabase
            .from("classifications")
            .select("id, classificationConfiguration") 
            .eq("classificationtype", "telescope-minorPlanet")
            .eq("author", session.user.id);      

        if (classificationsError) throw classificationsError;

        const mission1CompletedCount = classificationsData?.length || 0;

        const mission2CompletedCount =
          classificationsData?.filter(({ classificationConfiguration }) => {
            const options = classificationConfiguration?.classificationOptions?.[""] || {};
            const hasValidOptions = ["2", "3", "4"].some((option) => options[option]);
            const hasInvalidOption = options["1"];
            return hasValidOptions && !hasInvalidOption;
          }).length || 0;

        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", session.user.id);

        if (commentError) throw commentError;

        const { data: voteData, error: voteError } = await supabase
          .from("votes")
          .select("classification_id")
          .eq("user_id", session.user.id);

        if (voteError) throw voteError;

        const validClassificationIds = new Set(
          classificationsData.map((classification) => classification.id)
        );

        const mission3CommentCount = commentData?.filter(({ classification_id }) =>
          validClassificationIds.has(classification_id)
        ).length || 0;

        const mission3VoteCount = voteData?.filter(({ classification_id }) =>
          validClassificationIds.has(classification_id)
        ).length || 0;

        const mission3CompletedCount = mission3CommentCount + mission3VoteCount;

        // Mission 4: Check classifications with 5+ votes
        const mission4CompletedCount = classificationsData?.filter(({ id: classificationId }) => {
          const voteCount = voteData?.filter(({ classification_id }) => classification_id === classificationId)
            .length;
          return voteCount > 4.9999; // Greater than 5 votes
        }).length || 0;

        setMissions((prevMissions) =>
          prevMissions.map((mission) => {
            if (mission.id === 1) {
              return { ...mission, completedCount: mission1CompletedCount };
            }
            if (mission.id === 2) {
              return { ...mission, completedCount: mission2CompletedCount };
            }
            if (mission.id === 3) {
              return { ...mission, completedCount: mission3CompletedCount };
            }
            if (mission.id === 4) {
              return { ...mission, completedCount: mission4CompletedCount };
            }
            return mission;
          })
        );

        const totalPoints =
          mission1CompletedCount * 2 +
          mission2CompletedCount * 1 +
          mission3CompletedCount * 1 +
          mission4CompletedCount * 3;

        setExperiencePoints(totalPoints);
        setLevel(Math.floor(totalPoints / 9) + 1);
      } catch (error) {
        console.error("Error fetching mission data:", error);
      }
    };

    fetchMissionData();
  }, [supabase, session?.user]);

  return (
    <MissionShell
      missions={missions.map((mission) => ({
        ...mission,
        style: {
          backgroundColor: mission.completedCount && mission.completedCount > 0 ? "#74859A" : "#74859A",
        },
      }))}
      experiencePoints={experiencePoints}
      level={level}
      currentChapter={1}
    />
  );
};

export default DailyMinorPlanetMissions;