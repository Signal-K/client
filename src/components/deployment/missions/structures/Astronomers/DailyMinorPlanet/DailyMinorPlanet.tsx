import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { BarChartBigIcon, GlassWater, Guitar, HelpCircle, PenBoxIcon, RadioIcon, SpeechIcon, TelescopeIcon, VoteIcon } from "lucide-react";
import MissionShell from "../../BasePlate";
import { DailyMinorPlanetWithId, StarterDailyMinorPlanet } from "@/src/components/research/projects/Telescopes/DailyMinorPlanet";
import VoteDMPClassifications from "./DMPVote";
import DMPGenerator from "./AsteroidMaker";
import { ActiveAsteroidWithId } from "@/src/components/research/projects/Telescopes/ActiveAsteroids";

interface Mission {
  id: number;
  chapter: number;
  title: string;
  description: string;
  icon: React.ElementType;
  points?: number;
  completedCount?: number;
  internalComponent: React.ElementType | (() => JSX.Element);
  color: string; 
};

const DailyMinorPlanetMissions = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState([
    {
      id: 1,
      chapter: 1,
      title: "Make an asteroid classification",
      description: "Use your telescope to look for an asteroid candidate.",
      icon: TelescopeIcon,
      points: 2, 
      completedCount: 0,
      internalComponent: () => <DailyMinorPlanetWithId />,
      color: "text-blue-500",
      shadow: false,
      action: () => {},
    },
    {
      id: 2,
      chapter: 1,
      title: "Propose an asteroid candidate",
      description: "Make a classification indicating a positive asteroid candidate.",
      icon: RadioIcon,
      points: 1,
      completedCount: 0,
      internalComponent: () => <DailyMinorPlanetWithId />,
      color: "text-green-500",
      shadow: false,
      action: () => {},
    },
    {
      id: 3,
      chapter: 1,
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
      chapter: 2,
      title: "Have an asteroid candidate confirmed",
      description:
        "When one of your proposals gets 5 upvotes by the community, it is considered a valid asteroid, and you can begin surveying it in Chapter 2.",
      icon: VoteIcon,
      points: 3,
      completedCount: 0,
      // internalComponent: () => <div></div>,
      color: "text-red-700",
      shadow: true,
      action: () => {},
    },
    {
      id: 5,
      chapter: 2,
      title: "Make an active asteroid classification",
      description:
        "The next step in your asteroid research involves finding asteroids with tails, helping us find clues about water on smaller objects",
      icon: Guitar,
      points: 2,
      completedCount: 0,
      // internalComponent: () => <div><DMPGenerator /></div>,
      internalComponent: () => <div><ActiveAsteroidWithId /></div>,
      color: 'text-green-300',
      shadow: true,
      action: () => {},
    },
    // {
    //   id: 6,
    //   chapter: 2,
    //   title: "Compare AA & DMP Classification",
    //   description:
    //     "Pick out classifications you've made from both datasets and compare the differences and potential validity",
    //   icon: BarChartBigIcon,
    //   points: 2,
    //   color: 'text-green-700',
    //   shadow: true,
    //   action: () => {},
    // },
    // {
    //   id: 7,
    //   chapter: 2,
    //   title: "Comment & Vote on AA candidates",
    //   description: "Work with other players to confirm classifications and provide feedback & consensus",
    //   icon: PenBoxIcon,
    //   points: 1,
    //   color: 'text-blue-300',
    //   shadow: true,
    //   action: () => [],
    // },
    // {
    //   id: 8,
    //   chapter: 2,
    //   title: "Propose tail, dust cloud, or null value",
    //   description:
    //     "Go through verified AA & DMP anomalies and propose what's going on specifically",
    //   icon: GlassWater,
    //   points: 1,
    //   color: 'text-blue-700',
    //   shadow: true,
    //   action: () => {},
    // },
  ]);

  const tutorialMission: Mission = {
    id: 1000,
    chapter: 1,
    title: "Welcome to Daily Minor Planet",
    description: 
      "This mission will guide you through the basics of hunting and discovering asteroids",
    icon: HelpCircle,

    color: 'text-yellow-500',
    internalComponent: () => {
      return <StarterDailyMinorPlanet anomalyid={90670192} />;
    },
  };

  const [experiencePoints, setExperiencePoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(1);

  const maxUnlockedChapter = Math.max(
    Math.floor(experiencePoints / 9) + 1, 
    Math.max(...missions.map(mission => mission.chapter)) 
  );

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

        const mission4CompletedCount = classificationsData?.filter(({ id: classificationId }) => {
          const voteCount = voteData?.filter(({ classification_id }) => classification_id === classificationId)
            .length;
          return voteCount > 4.9999;
        }).length || 0;

        setMissions((prevMissions) =>
          prevMissions.map((mission) => {
            if (mission.id === 1) {
              return { ...mission, completedCount: mission1CompletedCount, points: mission.points || 0 };
            }
            if (mission.id === 2) {
              return { ...mission, completedCount: mission2CompletedCount, points: mission.points || 0 };
            }
            if (mission.id === 3) {
              return { ...mission, completedCount: mission3CompletedCount, points: mission.points || 0 };
            }
            if (mission.id === 4) {
              return { ...mission, completedCount: mission4CompletedCount, points: mission.points || 0 };
            }
            if (mission.id === 5) {
              return { ...mission, completedCount: mission4CompletedCount, points: mission.points || 0 };
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

  const handlePreviousChapter = () => {
    if (currentChapter > 1) setCurrentChapter(currentChapter - 1);
  };

  const handleNextChapter = () => {
    if (currentChapter < maxUnlockedChapter) setCurrentChapter(currentChapter + 1);
  };

  return (
    <MissionShell
      missions={missions.filter((mission) => mission.chapter === currentChapter)}
      experiencePoints={experiencePoints}
      level={level}
      currentChapter={currentChapter}
      maxUnlockedChapter={maxUnlockedChapter}
      onPreviousChapter={handlePreviousChapter}
      onNextChapter={handleNextChapter}
      tutorialMission={tutorialMission}
    />
  );
};

export default DailyMinorPlanetMissions;