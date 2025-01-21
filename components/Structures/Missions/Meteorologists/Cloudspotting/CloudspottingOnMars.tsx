import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../BasePlate";
import { CloudCogIcon, FolderCog, PaintBucket, Vote } from "lucide-react";
import { CloudspottingWrapper, StarterLidar } from "@/components/Projects/Lidar/Clouds";
import VoteCoMClassifications from "./CoMVote";
import CloudClassificationGenerator from "./CloudMaker";

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
                title: "Make a cloud classification",
                description:
                    "Use your weather balloon & LIDAR technologies to discover properties about Martian clouds",
                icon: CloudCogIcon,
                points: 2,
                completedCount: 0,
                internalComponent: () => <CloudspottingWrapper />,
                color: "text-blue-500",
            },
            {
                id: 2,
                chapter: 1,
                title: "Propose a cloud in your classifications",
                description: "Make a classification indicating a positive cloud candidate",
                icon: FolderCog,
                points: 1,
                completedCount: 0,
                internalComponent: () => <StarterLidar />,
                color: "text-cyan-300",
            },
            {
                id: 3,
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
                id: 4,
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
                .eq("classificationtype", "cloud");
    
            const mission1Points = classifications?.length || 0;
    
            const mission2Points = classifications?.filter((classification: any) => {
                const config = classification.classificationConfiguration || {};
                const options = config?.classificationOptions?.[""] || {};
                return Object.values(options).some((value) => value === true);
            }).length || 0;
    
            const { data: comments } = await supabase
                .from("comments")
                .select("id, classification_id")
                .eq("author", session.user.id);
    
            const classificationIds = classifications?.map((c: any) => c.id) || [];
            const mission3Points = comments?.filter((comment: any) =>
                classificationIds.includes(comment.classification_id)
            ).length || 0;
    
            return {
                1: mission1Points,
                2: mission2Points,
                3: mission3Points,
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

export default CloudspottingOnMars;