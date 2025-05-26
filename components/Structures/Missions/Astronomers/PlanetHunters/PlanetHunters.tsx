import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../BasePlate";
import {
  TelescopeIcon,
  RadioIcon,
  SpeakerIcon,
  DiscAlbum,
  PersonStandingIcon,
} from "lucide-react";

import { StarterTelescopeTess } from "@/components/Projects/Telescopes/Transiting";
import PlanetTypeCommentForm from "./PlanetType";
import VotePlanetClassifications from "./PHVote";
import PlanetHuntersTemperatureWrapper from "./PlanetTemperature";

const PlanetHuntersSteps = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState([
    {
      id: 1,
      title: "Classify a Planet",
      description: "Use your telescope to classify a planet.",
      icon: TelescopeIcon,
      points: 1,
      completedCount: 0,
      internalComponent: () => <StarterTelescopeTess />,
      color: "text-blue-500",
      shadow: false,
      action: () => {},
      chapter: 1,
    },
    {
      id: 2,
      title: "Propose 1 planetary candidate",
      description: "Make a classification indicating a positive candidate.",
      icon: RadioIcon,
      points: 2,
      completedCount: 0,
      internalComponent: () => <StarterTelescopeTess />,
      color: "text-purple-500",
      shadow: false,
      action: () => {},
      chapter: 1,
    },
    {
      id: 3,
      title: "Propose a planet type",
      description: "Make a comment proposing a planet type for a classification.",
      icon: SpeakerIcon,
      points: 1,
      completedCount: 0,
      internalComponent: () => <PlanetTypeCommentForm />,
      color: "text-green-500",
      shadow: false,
      action: () => {},
      chapter: 1,
    },
    {
      id: 4,
      title: "Survey planet classifications",
      description: "Comment & vote on a planet, suggesting stats and alterations to classifications.",
      icon: DiscAlbum,
      points: 1,
      completedCount: 0,
      internalComponent: () => <VotePlanetClassifications />,
      color: "text-red-500",
      shadow: true,
      action: () => {},
      chapter: 1,
    },
    {
      id: 5,
      title: "Calculate planetary temperatures",
      description: "Use satellite data to help determine the temperature of planets you've discovered.",
      icon: PersonStandingIcon,
      points: 1,
      completedCount: 0,
      internalComponent: () => <PlanetHuntersTemperatureWrapper />,
      color: "text-yellow-700",
      shadow: true,
      action: () => {},
      chapter: 2,
    },
  ]);

  const [experiencePoints, setExperiencePoints] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  const maxUnlockedChapter = Math.max(
    Math.floor(experiencePoints / 9) + 1,
    Math.max(...missions.map((m) => m.chapter))
  );

  useEffect(() => {
    if (!session?.user) return;

    const fetchMissionData = async () => {
      try {
        const { data: classificationsData, error: classificationsError } = await supabase
          .from("classifications")
          .select("id, classificationConfiguration")
          .eq("classificationtype", "planet")
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

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("classification_id")
          .eq("author", session.user.id);
        if (commentsError) throw commentsError;

        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("classification_id")
          .eq("user_id", session.user.id);
        if (votesError) throw votesError;

        const mission3CompletedCount = commentsData?.length || 0;
        const mission4CompletedCount = (commentsData?.length || 0) + (votesData?.length || 0);

        const { data: temperatureData, error: tempError } = await supabase
          .from("planet_temperatures")
          .select("id")
          .eq("user_id", session.user.id);
        if (tempError) throw tempError;

        const mission5CompletedCount = temperatureData?.length || 0;

        const updatedMissions = missions.map((mission) => {
          switch (mission.id) {
            case 1:
              return { ...mission, completedCount: mission1CompletedCount };
            case 2:
              return { ...mission, completedCount: mission2CompletedCount };
            case 3:
              return { ...mission, completedCount: mission3CompletedCount };
            case 4:
              return { ...mission, completedCount: mission4CompletedCount };
            case 5:
              return { ...mission, completedCount: mission5CompletedCount };
            default:
              return mission;
          }
        });

        const totalPoints =
          mission1CompletedCount * 1 +
          mission2CompletedCount * 2 +
          mission3CompletedCount * 1 +
          mission4CompletedCount * 1 +
          mission5CompletedCount * 1;

        setMissions(updatedMissions);
        setExperiencePoints(totalPoints);
        setLevel(Math.floor(totalPoints / 9) + 1);
      } catch (error) {
        console.error("Error fetching Planet Hunters mission data:", error);
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
    />
  );
};

export default PlanetHuntersSteps;