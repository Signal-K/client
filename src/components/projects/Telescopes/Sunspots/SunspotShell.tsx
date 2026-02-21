import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import MissionShell from "@/src/components/deployment/missions/structures/BasePlate";
import { CloudCogIcon, FolderCog, HelpCircle, PaintBucket, Sun, Vote } from "lucide-react";

import { Mission } from "@/src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AIForMars";
import { StarterSunspot } from "../Sunspots";

interface MissionStep {
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

                const classRes = await fetch(
                  `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=sunspot&limit=1000`
                );
                const classPayload = await classRes.json();
                if (!classRes.ok) throw new Error(classPayload?.error || "Failed to load classifications");
                const classificationsData = classPayload?.classifications || [];

                const mission1CompletedCount = classificationsData?.length || 0;

                const activityRes = await fetch("/api/gameplay/social/my?limit=5000");
                const activityPayload = await activityRes.json();
                if (!activityRes.ok) throw new Error(activityPayload?.error || "Failed to load activity");
                const commentsData = activityPayload?.comments || [];
                const votesData = activityPayload?.votes || [];
          
                const validClassificationIds = new Set(
                    classificationsData?.map((classification: any) => classification.id) ?? []
                );

                const mission2CompletedCount =
                    (commentsData?.filter(({ classification_id }: any) => validClassificationIds.has(classification_id)).length ?? 0) +
                    (votesData?.filter(({ classification_id }: any) => validClassificationIds.has(classification_id)).length ?? 0);

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
