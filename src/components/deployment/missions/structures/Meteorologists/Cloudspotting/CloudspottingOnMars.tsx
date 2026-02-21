import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import MissionShell from "@/src/components/deployment/missions/structures/BasePlate";
import { CloudCogIcon, FolderCog, HelpCircle, Paintbrush2Icon, PaintBucket, Vote } from "lucide-react";
import { CloudspottingOnMarsWithId } from "@/src/components/projects/Lidar/Clouds";
import VoteCoMClassifications from "./CoMVote";
import CloudClassificationGenerator from "./CloudMaker";
import { CloudspottingOnMarsTutorial } from "@/src/components/projects/Lidar/cloudspottingOnMars";
import { StarterCoMShapes } from "@/src/components/projects/Lidar/CloudspottingOnMarsShapes";
// import { CloudspottingShapesWrapper } from "@/src/components/research/projects/Lidar/CloudspottingOnMarsShapes";

interface Mission {
    id: number;
    chapter: number;
    title: string;
    description: string;
    icon: React.ElementType;
    points: number;
    completedCount: number;
    internalComponent: React.ElementType | (() => JSX.Element);
    color: string;
};

interface MissionPoints {
    [key: number]: number;
}; 

const CloudspottingOnMars = () => {
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
                title: "Make a cloud classification",
                description:
                    "Use your weather balloon & LIDAR technologies to discover properties about Martian clouds",
                icon: CloudCogIcon,
                points: 2,
                completedCount: 0,
                internalComponent: () => <CloudspottingOnMarsWithId />,
                color: "text-blue-500",
            },
            {
                id: 2,
                chapter: 1,
                title: "Comment or vote on a cloud classification",
                description:
                    "Collaborate with other players to rate proposed cloud candidates and behaviour",
                icon: Vote,
                points: 1,
                completedCount: 0,
                internalComponent: () => <VoteCoMClassifications />,
                color: "text-green-700",
            },
            {
                id: 3,
                chapter: 2,
                title: "Create a cloud representation",
                description:
                    "You can now add a visual representation of the cloud to your original classification",
                icon: PaintBucket,
                points: 1,
                completedCount: 0,
                internalComponent: () => <CloudClassificationGenerator />,
                color: 'text-green-300',
            },
            {
                id: 4,
                chapter: 2,
                title: "Identify shapes in cloud classifications",
                description: 'Use your LIDAR to identify shapes in the cloud classification',
                icon: Paintbrush2Icon,
                points: 2,
                completedCount: 0,
                internalComponent: () => <StarterCoMShapes anomalyid={104286112} />,
                color: 'text-green-200',
            }
        ];
    };

    const tutorialMission: Mission = {
        id: 1000,
        chapter: 1,
        title: "Welcome to Cloudspotting on Mars",
        description: "This mission will guide you through the basics of cloud classification. Let's get started!",
        icon: HelpCircle,
        points: 0,
        completedCount: 0,
        internalComponent: () => (
            <CloudspottingOnMarsTutorial anomalyId="8423850802" />
        ),
        color: "text-yellow-500",
    };

    useEffect(() => {
        if (!session) {
            return;
        };
    
        const fetchMissionPoints = async (
            session: any
        ): Promise<MissionPoints> => {    
            const classRes = await fetch(
              `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=cloud&limit=500`
            );
            const classPayload = await classRes.json();
            const classifications = classRes.ok ? classPayload?.classifications || [] : [];
    
            const mission1Points = classifications?.length || 0;
    
            const mission2Points = classifications?.filter((classification: any) => {
                const config = classification.classificationConfiguration || {};
                const options = config?.classificationOptions?.[""] || {};
                return Object.values(options).some((value) => value === true);
            }).length || 0;
    
            const activityRes = await fetch(`/api/gameplay/social/my?limit=5000`);
            const activityPayload = await activityRes.json();
            const comments = activityRes.ok ? activityPayload?.comments || [] : [];
    
            const classificationIds = classifications?.map((c: any) => c.id) || [];
            const mission3Points = comments?.filter((comment: any) =>
                classificationIds.includes(comment.classification_id)
            ).length || 0;

            const shapesRes = await fetch(
              `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=balloon-marsCloudShapes&limit=500`
            );
            const shapesPayload = await shapesRes.json();
            const classificationsB = shapesRes.ok ? shapesPayload?.classifications || [] : [];

            const mission4Points = classificationsB?.length || 0;
    
            return {
                1: mission1Points,
                2: mission2Points,
                3: mission3Points,
                4: mission4Points,
                5: mission4Points,
            };
        };
    
        const updateMissionData = async () => {
            const points = await fetchMissionPoints(session);
    
            const updatedMissions = fetchMissions().map((mission) => {
                const completedCount = points[mission.id] || 0;
                return { ...mission, completedCount };
            });
    
            setExperiencePoints(points[1] + points[2] + points[3] + points[4]);
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

export default CloudspottingOnMars;
