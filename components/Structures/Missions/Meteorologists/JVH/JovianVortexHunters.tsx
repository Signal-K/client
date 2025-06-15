import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../BasePlate";
import { JVHWrapper } from "@/components/Projects/Lidar/JovianVortexHunter";
import { CloudCogIcon, CloudHail, HelpCircle, ShovelIcon } from "lucide-react";
import { LidarJVHSatellite, StarterJovianVortexHunter } from "@/components/Projects/Lidar/JovianVortexHunter";
import VoteJVH from "./JVHVote";
import CloudClassifier from "@/components/Data/Generator/Meteorologists/JVH/cloud-classifier";
import JVHCloudClassificationGenerator from "./GaseousPlanetCloudMaker";
import ClassificationOptionsCounter from "@/content/Posts/ClassificationOptionsCounter";
// import { PreferredGaseousClassifications } from "../../PickPlanet";

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

const JovianVortexHunters = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [experiencePoints, setExperiencePoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [currentChapter, setCurrentChapter] = useState(1);

    const fetchMissions = (): Mission[] => [
        {
            id: 1,
            chapter: 1,
            title: "Make one classification in the JVH project",
            description: "Classify a cloud formation in the Jovian Vortex Hunters project.",
            icon: CloudCogIcon,
            points: 2,
            completedCount: 0,
            // internalComponent: () => <LidarJVHSatellite anomalyid={4} />, // <JVHWrapper />
            internalComponent: () => <JVHWrapper />,
            color: "text-blue-500",
        },
        {
            id: 2,
            chapter: 1,
            title: "Vote & Comment on a JVH classification (including your own)",
            description: "Engage with the community by commenting on a classification.",
            icon: CloudCogIcon,
            points: 2,
            completedCount: 0,
            internalComponent: () => <VoteJVH />,
            color: "text-green-500",
        },
        {
            id: 3,
            chapter: 1,
            title: "Create your cloud generation",
            description:
                "Use sliders and graphs to create a cloud pattern that matches your original classification. This is then used to create a composition chart",
            icon: CloudHail,
            points: 1,
            completedCount: 0,
            internalComponent: () => <JVHCloudClassificationGenerator />,
            color: 'text-green-700',
        },
        {
            id: 4,
            chapter: 1,
            title: "Find all cloud types",
            description: 
                "Identify and classify all cloud types in the data.",
            icon: ShovelIcon,
            points: 2,
            completedCount: 0,
            internalComponent: () => <ClassificationOptionsCounter />,
            color: 'text-red-500',
        },
        // {
        //     id: 3,
        //     chapter: 1,
        //     title: "Find a turbulent system",
        //     description: "Identify and classify a turbulent atmospheric system.",
        //     icon: CloudCogIcon,
        //     points: 3,
        //     completedCount: 0,
        //     internalComponent: () => <LidarJVHSatellite />,
        //     color: "text-red-500",
        // },
        // {
        //     id: 4,
        //     chapter: 1,
        //     title: "Find a vortex",
        //     description: "Locate and mark a vortex in the atmosphere of a gaseous planet.",
        //     icon: CloudCogIcon,
        //     points: 3,
        //     completedCount: 0,
        //     internalComponent: () => <LidarJVHSatellite />,
        //     color: "text-purple-500",
        // },
        // {
        //     id: 5,
        //     chapter: 1,
        //     title: "Find a cloud band",
        //     description: "Detect and analyze a cloud band in the data set.",
        //     icon: CloudCogIcon,
        //     points: 4,
        //     completedCount: 0,
        //     internalComponent: () => <LidarJVHSatellite />,
        //     color: "text-orange-500",
        // },
        {
            id: 7,
            chapter: 2,
            title: " - COMING SOON - ",
            // title: "Map a cloud to a region on a gaseous planet candidate - COMING SOON",
            description: "Assign a detected cloud to a specific region on a gaseous planet.",
            icon: CloudCogIcon,
            points: 5,
            completedCount: 0,
            // internalComponent: () => <LidarJVHSatellite />,
            color: "text-teal-500",
        },
        {
            id: 8,
            chapter: 2,
            title: " - COMING SOON - ",
            // description: "Analyze and classify cloud regions based on temperature data.",
            description:
                "Classify cloud regions (original data points) to specific atmospheric regions, indicating temperature",
            icon: CloudCogIcon,
            points: 6,
            completedCount: 0,
            // internalComponent: () => <LidarJVHSatellite />,
            color: "text-pink-500",
        },
    ];

    useEffect(() => {
        if (!session) return;

        const fetchMissionPoints = async (): Promise<MissionPoints> => {
            const { data: classifications } = await supabase
                .from("classifications")
                .select("id")
                .eq("author", session.user.id)
                .eq("classificationtype", "lidar-jovianVortexHunter");

            const mission1Points = classifications?.length || 0;

            const { data: comments } = await supabase
                .from("comments")
                .select("id, classification_id")
                .eq("author", session.user.id);

            const classificationIds = classifications?.map((c) => c.id) || [];
            const mission2Points = comments?.filter((comment) =>
                classificationIds.includes(comment.classification_id)
            ).length || 0;

            return {
                1: mission1Points,
                2: mission2Points,
            };
        };

        const updateMissionData = async () => {
            const points = await fetchMissionPoints();
            const updatedMissions = fetchMissions().map((mission) => ({
                ...mission,
                completedCount: points[mission.id] || 0,
            }));

            setMissions(updatedMissions);
            setExperiencePoints(Object.values(points).reduce((acc, cur) => acc + cur, 0));
        };

        updateMissionData();
    }, [session, supabase]);

    const tutorialMission: Mission = {
        id: 1000,
        chapter: 1,
        title: "Welcome to Jovian Vortex Hunters",
        description: 
            'This mission gets you started with classifying and tracking storms on gaseous planets',
        icon: HelpCircle,
        points: 0,
        completedCount: 0,
        internalComponent: () => (
            <StarterJovianVortexHunter anomalyid={77288648} />
        ),
        color: 'text-yellow-500',
    };

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

export default JovianVortexHunters;