import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../../BasePlate";
import { CloudCogIcon, FolderCog, HelpCircle, PaintBucket, Vote } from "lucide-react";
// import { CloudspottingShapesWrapper } from "@/src/components/research/projects/Lidar/CloudspottingOnMarsShapes";
import { Mission } from "../../../Astronomers/SatellitePhotos/AI4M/AIForMars";
import { StarterCoMShapes } from "@/src/components/research/projects/Lidar/CloudspottingOnMarsShapes";

interface MissionPoints {
    [key: number]: number;
};

const CloudspottingOnMarsShapes = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [experiencePoints, setExperiencePoints] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [currentChapter, setCurrentChapter] = useState<number>(1);

    const fetchMissions = (): Mission[] => {
        return [
            {
                id: 1,
                chapter: 1,
                title: "Make a cloud classification",
                description: 
                    "Use your LIDAR technology to carefully analyse the layout & colours of surface images of a planet you've interacted with",
                icon: CloudCogIcon,
                points: 2,
                completedCount: 0,
                internalComponent: () => <StarterCoMShapes />,
                color: 'text-blue-500',
            },
            {
                id: 2,
                chapter: 1,
                title: "Survey shape classifications",
                description:
                    'Work with other explorers and provide feedback and further analysis on their classifications & discoveries, as well as adding more context to your own clouds',
                icon: PaintBucket,
                points: 1,
                completedCount: 0,
                internalComponent: () => <></>,
                color: 'text-green-500'
            },
            // {
            //     id: 3, --> for later
            //     chapter: 1,
            //     title: 'Propose elements/storms'
            // }
        ];
    };

    // const tutorialMission: Mission = {
    // Fill in later
    // }

    useEffect(() => {
        if (!session) {
            return;
        };

        const fetchMissionPoints = async (
            session: any,
            supabase: any,
        ): Promise<MissionPoints> => {
            const {
                data: classifications
            } = await supabase
                .from("classifications")
                .select("id, classificationtype, classificationConfiguration")
                .eq("author", session.user.id)
                .eq("classificationtype", 'balloon-marsCloudShapes');

            const mission1Points = classifications?.length || 0;

            const {
                data: comments
            } = await supabase
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
                // 3: mission3Points,
            };
        };

        const updateMissionData = async () => {
            const points = await fetchMissionPoints(session, supabase);
            const updatedMissions = fetchMissions().map((mission) => {
                const completedCount = points[mission.id] || 0;
                return {
                    ...mission,
                    completedCount
                };
            });

            setExperiencePoints(points[1] + points[2]);
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
            // tutorialMission={tutorialMission}
        />
    );
};

export default CloudspottingOnMarsShapes;