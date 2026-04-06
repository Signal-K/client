import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import MissionShell from "../../../BasePlate";
import { CloudCogIcon, FolderCog, HelpCircle, PaintBucket, Vote } from "lucide-react";
import VotePanel from "@/src/components/social/posts/VotePanel";
import { PlanetFourProject, StarterPlanetFour } from "@/src/components/projects/Satellite/PlanetFour";

interface Mission {
    id: number;
    chapter: number;
    title: string;
    description: string;
    icon: React.ElementType;
    points: number;
    completedCount?: number;
    internalComponent?: React.ElementType | (() => React.ReactElement);
    color: string;
};

interface MissionPoints {
    [key: number]: number;
}; 

const PlanetFour = () => {
    const session = useSession();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [experiencePoints, setExperiencePoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [currentChapter, setCurrentChapter] = useState(1);

    const fetchMissions = (): Mission[] => {
        return [
            {
                id: 1,
                chapter: 1,
                title: "Make one classification in the P4 project",
                description: "Classify a feature in the Planet Four project.",
                icon: CloudCogIcon,
                points: 2,
                completedCount: 0,
                internalComponent: () => <PlanetFourProject />,
                color: "text-blue-500",
            },
            {
                id: 2,
                chapter: 1,
                title: "Comment/vote on a P4 classification (including your own)",
                description: "Engage with the community by commenting or voting on a classification.",
                icon: Vote,
                points: 2,
                completedCount: 0,
                internalComponent: () => <VotePanel classificationType="satellite-planetFour" getImages={(m) => { if (Array.isArray(m)) return m.map((i: any) => i?.url).filter(Boolean); if (m?.url) return [m.url]; return []; }} />,
                color: "text-green-500",
            },
            {
                id: 5,
                chapter: 2,
                title: " - COMING SOON - ",
                description: "Analyze overlapping fan features to determine recurring vent patterns.",
                icon: CloudCogIcon,
                points: 5,
                completedCount: 0,
                color: "text-orange-500",
            },
            {
                id: 6,
                chapter: 2,
                title: " - COMING SOON - ",
                description: "Identify blotches and form hypotheses about venting activity near spider formations.",
                icon: PaintBucket,
                points: 6,
                completedCount: 0,
                color: "text-teal-500",
            },
            {
                id: 7,
                chapter: 2,
                title: " - COMING SOON - ",
                description: "Document changes or consistency in features over multiple Martian years.",
                icon: FolderCog,
                points: 6,
                completedCount: 0,
                color: "text-yellow-500",
            },
            {
                id: 8,
                chapter: 2,
                title: " - COMING SOON - ",
                description: "Correlate fan and blotch activity with underlying terrain features.",
                icon: CloudCogIcon,
                points: 7,
                completedCount: 0,
                color: "text-pink-500",
            },
            {
                id: 9,
                chapter: 2,
                title: " - COMING SOON - ",
                description: "Use fan measurements to predict local atmospheric conditions.",
                icon: Vote,
                points: 8,
                completedCount: 0,
                color: "text-cyan-500",
            },
            {
                id: 10,
                chapter: 2,
                title: " - COMING SOON - ",
                description: "Analyze how seasonal changes impact fan and blotch formation.",
                icon: FolderCog,
                points: 9,
                completedCount: 0,
                color: "text-indigo-500",
            },
        ];
    };

    const tutorialMission: Mission = {
        id: 1000,
        chapter: 1,
        title: "Welcome to Planet Four",
        description:
            "This mission will guide you through the basics of documenting & tracking anomalous behaviour on planetary surfaces",
        icon: HelpCircle,
        points: 0,
        internalComponent: () => (
            <StarterPlanetFour anomalyid={46366425} />
        ),
        color: 'text-yellow-500',
    };

    useEffect(() => {
        if (!session) {
            return;
        };

        const fetchMissionPoints = async (
            session: any
        ): Promise<MissionPoints> => {
            const classRes = await fetch(
              `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=satellite-planetFour&limit=500`
            );
            const classPayload = await classRes.json();
            const classifications = classRes.ok ? classPayload?.classifications || [] : [];

            const missionPoints = classifications?.length || 0;

            const activityRes = await fetch("/api/gameplay/social/my?limit=5000");
            const activityPayload = await activityRes.json();
            const comments = activityRes.ok ? activityPayload?.comments || [] : [];

        const classificationIds = classifications?.map((c: any) => c.id) || [];
        const mission2Points = comments?.filter((comment: any) =>
            classificationIds.includes(comment.classification_id)
        ).length || 0;

        return {
            1: missionPoints,
            2: mission2Points,
        };
        }
        const updateMissionData = async () => {
            const points = await fetchMissionPoints(session);
    
            const updatedMissions = fetchMissions().map((mission) => {
                const completedCount = points[mission.id] || 0;
                return { ...mission, completedCount };
            });
    
            setExperiencePoints(points[1] + points[2] + points[3]);
            setMissions(updatedMissions);
        };
    
        updateMissionData();
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

export default PlanetFour;
