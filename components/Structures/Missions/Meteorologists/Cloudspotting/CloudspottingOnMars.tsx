import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MissionShell from "../../BasePlate";
import { CloudCogIcon, FolderCog, Vote } from "lucide-react";
import { StarterLidar } from "@/components/Projects/Lidar/Clouds";
import VoteCoMClassifications from "./CoMVote";

const CloudspottingOnMars = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [missions, setMissions] = useState([
        {
            id: 1,
            chapter: 1,
            title: "Make a cloud classification",
            description:
                "Use your weather balloon & LIDAR technologies to discover properties about Martian clouds",
            icon: CloudCogIcon,
            points: 2,
            completedCount: 0,
            internalComponent: () => <StarterLidar />,
            color: 'text-blue-500',
            shadow: false,
            action: () => {},
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
            color: 'text-cyan-300',
            shadow: false,
            action: () => {},
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
            color: 'text-green-700',
            shadow: false,
            action: () => []
        },
        {
            id: 4,
            chapter: 2,
            title: "Have a cloud candidate confirmed",
            description: 
                "Validate the presence of a cloud candidate by confirming it through analysis and collaboration.",
            icon: CloudCogIcon,
            points: 3,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-red-500',
            shadow: false,
            action: () => {}
        },
        {
            id: 5,
            chapter: 2,
            title: "Connect to a planet (terrestrial list)",
            description: 
                "Establish a connection to a planet within the terrestrial list and begin analyzing cloud patterns.",
            icon: FolderCog,
            points: 2,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-yellow-500',
            shadow: false,
            action: () => {}
        },
        {
            id: 6,
            chapter: 2,
            title: "Propose temperature range",
            description: 
                "Submit your proposed temperature range for cloud formation based on your data and observations.",
            icon: CloudCogIcon,
            points: 2,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-blue-300',
            shadow: false,
            action: () => {}
        },
        {
            id: 7,
            chapter: 2,
            title: "Make a CoM shapes classification",
            description: 
                "Classify cloud formations based on their Center of Mass (CoM) shapes to identify patterns.",
            icon: CloudCogIcon,
            points: 2,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-green-300',
            shadow: false,
            action: () => {}
        },
        {
            id: 8,
            chapter: 2,
            title: "Comment/vote on a shapes classification",
            description: 
                "Engage with other players by commenting on or voting for cloud shapes classifications to improve the system.",
            icon: Vote,
            points: 1,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-pink-500',
            shadow: false,
            action: () => {}
        },
        {
            id: 9,
            chapter: 2,
            title: "Propose cloud type (1 of the 6 major ones)",
            description: 
                "Propose a cloud type (from the 6 major types) and include the corresponding temperature range, outputting a shape classification.",
            icon: FolderCog,
            points: 3,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-orange-500',
            shadow: false,
            action: () => {}
        },
        {
            id: 10,
            chapter: 2,
            title: "Connect a cloud shape with type to a regular cloud",
            description: 
                "Link a cloud shape classification to a regular cloud type, verifying its characteristics.",
            icon: CloudCogIcon,
            points: 2,
            completedCount: 0,
            internalComponent: () => <div></div>,
            color: 'text-purple-500',
            shadow: false,
            action: () => {}
        }
    ]);

    const [experiencePoints, setExperiencePoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [currentChapter, setCurrentChapter] = useState(1);

    const maxUnlockedChapter = Math.max(
        Math.floor(experiencePoints / 9) + 1, 
        Math.max(...missions.map(mission => mission.chapter)) 
    );

    useEffect(() => {
        if (!session) {
            return;
        };

        const fetchMissionData = async () => {
            // Fetch and update mission data from Supabase if needed
        }
    }, [supabase, session]);

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