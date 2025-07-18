import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "@/components/Structures/Missions/BasePlate";
import { CloudCogIcon, FolderCog, HelpCircle, PaintBucket, Sun, Vote } from "lucide-react";

import { Mission } from "@/components/Structures/Missions/Astronomers/SatellitePhotos/AI4M/AIForMars";
import { StarterSunspot } from "../Sunspots";

export interface MissionStep {
  id: number;
  title: string;
  description: string;
  points?: number;
  icon: React.ElementType;
  action: () => void;
  completedCount: number;
  color: string;
  chapter: number;
};

const SunspotSteps = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [steps, setSteps] = useState<MissionStep[]>([]);
    const [selectedMission, setSelectedMission] = useState<MissionStep | null>(null);
    const [currentChapter, setCurrentChapter] = useState<number>(1);
    const [experiencePoints, setExperiencePoints] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(false);

    const missionPoints = {
        1: 2,
        2: 1,
        3: 1,
    };

    const [missions, setMissions] = useState([
        {
            id: 1,
            chapter: 1,
            title: "Annotate a photograph of a star to find sunspots",
            description:
                "Help us understand how stars & suns develop sunspots and the effects these have on exoplanets",
            icon: Sun,
            points: 2,
            completedCount: 0,
            internalComponent: () => <StarterSunspot />,
            color: 'text-yellow-500',
        },
        // comments, voting, etc...
    ])

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        };

        const fetchMissionsData = async () => {
            try {
                setLoading(true);

                const {
                    data: classificationsData,
                    error: classificationsError,
                } = await supabase
                    .from("classifications")
                    .select("*")
                    .eq("classificationtype", 'sunspot')
                    .eq('author', session.user.id);

                if (classificationsError) {
                    throw classificationsError;
                };

                const mission1CompletedCount = classificationsData?.length || 0;

                const {
                    data: commentsData,
                    error: commentsError
                } = await supabase
                    .from("comments")
                    .select("*")
                    .eq("author", session.user.id);

                const { data: votesData } = await supabase
                    .from("votes")
                    .select("classification_id")
                    .eq("user_id", session.user.id);
          
                const validClassificationIds = new Set(
                    classificationsData?.map((classification) => classification.id) ?? []
                );

                if (commentsError) {
                    throw commentsError;
                };

                const mission2CompletedCount =
                    (commentsData?.filter(({ classification_id }) => validClassificationIds.has(classification_id)).length ?? 0) +
                    (votesData?.filter(({ classification_id }) => validClassificationIds.has(classification_id)).length ?? 0);

                const totalPoints = (
                    mission1CompletedCount * missionPoints[1] +
                    mission2CompletedCount * missionPoints[2]
                );

                const newLevel = Math.floor(totalPoints / 9) + 1;
                setLevel(newLevel);
                setExperiencePoints(totalPoints);
            } catch (error: any) {
                throw error;
                console.error(error);
                setLoading(false);
            } finally {
                setLoading(false);
            };
        };

        fetchMissionsData();
    }, [session]);

    const maxUnlockedChapter = Math.max(
        Math.floor(experiencePoints / 9) + 1,
        Math.max(...missions.map((mission) => mission.chapter))
    );

    const handlePreviousChapter = () => {
        if (currentChapter > 1) setCurrentChapter(currentChapter - 1);
    };

    const handleNextChapter = () => {
        if (currentChapter < maxUnlockedChapter) setCurrentChapter(currentChapter + 1);
    };

    return (
        <div className="py-1">
            <MissionShell
                missions={missions.filter((mission) => mission.chapter === currentChapter)}
                experiencePoints={experiencePoints}
                level={level}
                currentChapter={currentChapter}
                maxUnlockedChapter={maxUnlockedChapter}
                onPreviousChapter={handlePreviousChapter}
                onNextChapter={handleNextChapter}
                // tutorial mission
            />
        </div>
    );
};

export default SunspotSteps;