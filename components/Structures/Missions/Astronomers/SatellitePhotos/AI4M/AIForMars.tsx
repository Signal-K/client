import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../../BasePlate";
import { CloudCogIcon, FolderCog, PaintBucket, Vote } from "lucide-react";
import { AiForMarsProject } from "@/components/Projects/Auto/AI4Mars";
import VoteAI4MClassifications from "./AI4MVote";

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
                title: "Make one classification in the AI4M project",
                description: "Classify a feature in the AI for Mars project.",
                icon: CloudCogIcon,
                points: 2,
                completedCount: 0,
                internalComponent: () => <AiForMarsProject />,
                color: "text-blue-500",
            },
            {
                id: 2,
                chapter: 1,
                title: "Comment/vote on a AI4M classification (including your own)",
                description: "Engage with the community by commenting or voting on a classification.",
                icon: Vote,
                points: 2,
                completedCount: 0,
                internalComponent: () => <VoteAI4MClassifications />,
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
            //     title: "Mark regions with large rocks",
            //     description: "Locate and annotate regions with significant rocky features.",
            //     icon: PaintBucket,
            //     points: 4,
            //     completedCount: 0,
            //     internalComponent: () => <div />,
            //     color: "text-purple-500",
            // },
            {
                id: 5,
                chapter: 2,
                // title: "Assess terrain safety",
                title: " - COMING SOON - ",
                description: "Evaluate terrain features for safety considerations.",
                icon: CloudCogIcon,
                points: 5,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-orange-500",
            },
            {
                id: 6,
                chapter: 2,
                // title: "Locate mixed-terrain regions",
                title: " - COMING SOON - ",
                description: "Identify and classify regions with mixed terrain types.",
                icon: PaintBucket,
                points: 6,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-teal-500",
            },
            {
                id: 7,
                chapter: 2,
                // title: "Highlight bedrock as a key feature",
                title: " - COMING SOON - ",
                description: "Mark and highlight areas where bedrock is prominent.",
                icon: FolderCog,
                points: 6,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-yellow-500",
            },
            {
                id: 8,
                chapter: 2,
                // title: "Connect terrain classifications to resource utility",
                title: " - COMING SOON - ",
                description: "Analyze and connect terrain features to potential resource uses.",
                icon: CloudCogIcon,
                points: 7,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-pink-500",
            },
            {
                id: 9,
                chapter: 2,
                // title: "Hypothesize environmental conditions based on terrain",
                title: " - COMING SOON - ",
                description: "Form hypotheses about environmental conditions from terrain data.",
                icon: Vote,
                points: 8,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-cyan-500",
            },
            {
                id: 10,
                chapter: 2,
                // title: "Classify terrain for mining suitability",
                title: " - COMING SOON - ",
                description: "Evaluate terrain features for their potential mining suitability.",
                icon: FolderCog,
                points: 9,
                completedCount: 0,
                // internalComponent: () => <div />,
                color: "text-indigo-500",
            },
        ];
    };

    useEffect(() => {
        if (!session) {
            return;
        };
    
        const fetchMissionPoints = async (
            session: any,
            supabase: any
        ): Promise<MissionPoints> => {    
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
    
            return {
                1: mission1Points,
                2: mission2Points,
            };
        };
    
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
        />
    );
};

export default PlanetFour;