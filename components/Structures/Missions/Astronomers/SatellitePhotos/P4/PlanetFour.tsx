import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../../BasePlate";
import { CloudCogIcon, FolderCog, HelpCircle, PaintBucket, Vote } from "lucide-react";
import VoteP4Classifications from "./P4Vote";
import { P4Wrapper, StarterPlanetFour } from "@/components/Projects/Satellite/PlanetFour";

interface Mission {
    id: number;
    chapter: number;
    title: string;
    description: string;
    icon: React.ElementType;
    points: number;
    completedCount: number;
    internalComponent?: React.ElementType | (() => JSX.Element);
    color: string;
};

interface MissionPoints {
    [key: number]: number;
}; 

const PlanetFour = () => {
    const supabase = useSupabaseClient();
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
                internalComponent: () => <P4Wrapper />,
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
                internalComponent: () => <VoteP4Classifications />,
                color: "text-green-500",
            },
            // {
            //     id: 3,
            //     chapter: 1,
            //     title: "Find a consolidated soil patch",
            //     description: "Identify and classify a consolidated soil patch in the data.",
            //     icon: FolderCog,
            //     points: 3,
            //     completedCount: 0,
            //     internalComponent: () => <div />,
            //     color: "text-red-500",
            // },
            // {
            //     id: 4,
            //     chapter: 1,
            //     title: "Analyze seasonal trends by comparing two images from different Martian seasons",
            //     description: "Detect and document changes across seasons in Martian terrain images.",
            //     icon: PaintBucket,
            //     points: 4,
            //     completedCount: 0,
            //     internalComponent: () => <div />,
            //     color: "text-purple-500",
            // },
            {
                id: 5,
                chapter: 2,
                // title: "Map overlapping fans to detect recurring vent activity",
                title: " - COMING SOON - ",
                description: "Analyze overlapping fan features to determine recurring vent patterns.",
                icon: CloudCogIcon,
                points: 5,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-orange-500",
            },
            {
                id: 6,
                chapter: 2,
                // title: "Annotate blotches near spider formations and hypothesize venting patterns",
                title: " - COMING SOON - ",
                description: "Identify blotches and form hypotheses about venting activity near spider formations.",
                icon: PaintBucket,
                points: 6,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-teal-500",
            },
            {
                id: 7,
                chapter: 2,
                // title: "Compare multiple images from the same location across Martian years to assess feature consistency",
                title: " - COMING SOON - ",
                description: "Document changes or consistency in features over multiple Martian years.",
                icon: FolderCog,
                points: 6,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-yellow-500",
            },
            {
                id: 8,
                chapter: 2,
                // title: "Link fan/blotch activity to local terrain features (e.g., 'spiders')",
                title: " - COMING SOON - ",
                description: "Correlate fan and blotch activity with underlying terrain features.",
                icon: CloudCogIcon,
                points: 7,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-pink-500",
            },
            {
                id: 9,
                chapter: 2,
                // title: "Predict wind speed and direction based on fan orientation and size",
                title: " - COMING SOON - ",
                description: "Use fan measurements to predict local atmospheric conditions.",
                icon: Vote,
                points: 8,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-cyan-500",
            },
            {
                id: 10,
                chapter: 2,
                // title: "Correlate fan/blotch data with seasonal sublimation rates",
                title: " - COMING SOON - ",
                description: "Analyze how seasonal changes impact fan and blotch formation.",
                icon: FolderCog,
                points: 9,
                completedCount: 0,
                // internalComponent: () => <div />,
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
        completedCount: 0,
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
            session: any,
            supabase: any,
        ): Promise<MissionPoints> => {
            const { data: classifications } = await supabase
                .from("classifications")
                .select("id, classificationtype, classificationConfiguration")
                .eq("author", session.user.id)
                .eq("classificationtype", "satellite-planetFour");

            const missionPoints = classifications?.length || 0;

            const { data: comments } = await supabase
            .from("comments")
            .select("id, classification_id")
            .eq("author", session.user.id);

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
            const points = await fetchMissionPoints(session, supabase);
    
            const updatedMissions = fetchMissions().map((mission) => {
                const completedCount = points[mission.id] || 0;
                return { ...mission, completedCount };
            });
    
            setExperiencePoints(points[1] + points[2] + points[3]);
            setMissions(updatedMissions);
        };
    
        updateMissionData();
    }, [session, supabase]);  

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