import React, { useEffect, useState, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../BasePlate";
import { FishIcon, HelpCircle, PartyPopper, VoicemailIcon } from "lucide-react";
import { PlanktonPortalFrame, PlanktonPortalTutorial } from "@/components/Projects/Zoodex/planktonPortal";
import VotePPClassifications from "./PPVote";
import PlanktonDiscoveryStats from "./PlanktonScore";

interface Mission {
  id: number;
  chapter: number;
  title: string;
  description: string;
  icon: React.ElementType;
  completedCount: number;
  points: number;
  internalComponent: React.ElementType | (() => JSX.Element);
  color: string;
}

interface MissionPoints {
  [key: number]: number;
}

const PlanktonPortal = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(1);

  const fetchMissions = useCallback((): Mission[] => {
    return [
      {
        id: 1,
        chapter: 1,
        title: "Make a plankton classification",
        description:
          "Observe and mark plankton in your habitats and track their behaviour",
        icon: FishIcon,
        points: 2,
        completedCount: 0,
        internalComponent: PlanktonPortalFrame,
        color: "text-blue-500",
      },
      {
        id: 2,
        chapter: 1,
        title: "Comment & vote on Plankton discoveries",
        description:
          "Work with other players to drill down on specific plankter points",
        icon: VoicemailIcon,
        points: 1,
        completedCount: 0,
        internalComponent: VotePPClassifications,
        color: "text-green-400",
      },

      // Mission for unidentifiable traits

      {
        id: 3,
        chapter: 1,
        title: "Plankton stats",
        description:
            "View the health score for Earth's oceans and how your discoveries have improved our understanding of plankton behaviour",
        icon: PartyPopper,
        points: 0,
        completedCount: 0,
        internalComponent: PlanktonDiscoveryStats,
        color: 'text-red-600',
      },
    ];
  }, []);

  const tutorialMission: Mission = {
    id: 1000,
    chapter: 1,
    title: "Welcome to Plankton Portal",
    description: 
      'This mission will get you started with tracking and taking care of different plankton species',
    icon: HelpCircle,
    points: 0,
    completedCount: 0,
    internalComponent: () => (
      <PlanktonPortalTutorial anomalyId="36896413" />
    ),
    color: 'text-yellow-500',
  };

  const fetchMissionPoints = useCallback(
    async (session: any, supabase: any): Promise<MissionPoints> => {
      const { data: classifications } = await supabase
        .from("classifications")
        .select("id, classificationtype, classificationConfiguration")
        .eq("author", session.user.id)
        .eq("classificationtype", "zoodex-planktonPortal");

      const mission1Points = classifications?.length || 0;

      const mission2Points =
        classifications?.filter((classification: any) => {
          const config = classification.classificationConfiguration || {};
          const options = config?.classificationOptions?.[""] || {};
          return Object.values(options).some((value) => value === true);
        }).length || 0;

      const { data: comments } = await supabase
        .from("comments")
        .select("id, classification_id")
        .eq("author", session.user.id);

      const classificationIds = classifications?.map((c: any) => c.id) || [];
      const mission3Points =
        comments?.filter((comment: any) =>
          classificationIds.includes(comment.classification_id)
        ).length || 0;

      return {
        1: mission1Points,
        2: mission2Points,
        3: mission3Points,
      };
    },
    []
  );

  useEffect(() => {
    if (!session) return;

    const updateMissionData = async () => {
      const points = await fetchMissionPoints(session, supabase);

      const updatedMissions = fetchMissions().map((mission) => ({
        ...mission,
        completedCount: points[mission.id] || 0,
      }));

      setExperiencePoints(points[1] + points[2] + points[3]);
      setMissions(updatedMissions);
    };

    updateMissionData();
  }, [session, supabase, fetchMissions, fetchMissionPoints]);

  const maxUnlockedChapter = Math.max(
    Math.floor(experiencePoints / 9) + 1,
    Math.max(...missions.map((mission) => mission.chapter), 1)
  );

  return (
    <MissionShell
      missions={missions.filter((mission) => mission.chapter === currentChapter)}
      experiencePoints={experiencePoints}
      level={level}
      currentChapter={currentChapter}
      maxUnlockedChapter={maxUnlockedChapter}
      onPreviousChapter={() => setCurrentChapter((prev) => Math.max(prev - 1, 1))}
      onNextChapter={() =>
        setCurrentChapter((prev) => Math.min(prev + 1, maxUnlockedChapter))
      }
      tutorialMission={tutorialMission}
    />
  );
};

export default PlanktonPortal;