"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import MissionShell from "../../BasePlate";
import { calculateLevel, getMaxUnlockedChapter } from "@/src/utils/gameplay/leveling";
import {
  TelescopeIcon,
  SearchIcon,
  TargetIcon,
  SparklesIcon,
} from "lucide-react";

interface Mission {
  id: number;
  title: string;
  description: string;
  icon: any;
  points: number;
  completedCount: number;
  link?: string;
  slug?: string;
  color: string;
  chapter: number;
  action?: () => void;
}

const GalaxyZooSteps = () => {
  const session = useSession();
  const router = useRouter();

  const baseMissions: Mission[] = [
    {
      id: 1,
      title: "Deep Space Survey",
      description: "Use your telescope to map galaxy morphology",
      icon: TelescopeIcon,
      points: 1,
      completedCount: 0,
      link: "/structures/telescope/galaxy-zoo/classify",
      color: "text-purple-500",
      chapter: 1,
    },
    {
      id: 2,
      title: "Identify Spiral Arms",
      description: "Find and classify galaxies with distinct spiral features.",
      icon: SearchIcon,
      points: 1,
      completedCount: 0,
      link: "/structures/telescope/galaxy-zoo/classify",
      color: "text-blue-400",
      chapter: 1,
    },
    {
      id: 3,
      title: "Smooth Galaxy Census",
      description: "Catalog elliptical and smooth galaxies in our sector.",
      icon: TargetIcon,
      points: 1,
      completedCount: 0,
      link: "/structures/telescope/galaxy-zoo/classify",
      color: "text-amber-400",
      chapter: 1,
    },
    {
      id: 4,
      title: "Merger Detection",
      description: "Identify interacting galaxies and mergers.",
      icon: SparklesIcon,
      points: 2,
      completedCount: 0,
      link: "/structures/telescope/galaxy-zoo/classify",
      color: "text-red-400",
      chapter: 2,
    },
  ];

  const [missions, setMissions] = useState<Mission[]>(baseMissions);
  const [experiencePoints, setExperiencePoints] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  const maxUnlockedChapter = Math.max(
    getMaxUnlockedChapter(experiencePoints),
    Math.max(...missions.map((m) => m.chapter))
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        const classRes = await fetch(
          `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=galaxyZoo&limit=500`
        );
        const classPayload = await classRes.json();
        if (!classRes.ok) throw new Error(classPayload?.error || "Failed to load classifications");
        const classifications = classPayload?.classifications || [];

        const count = classifications.length;
        
        const updatedMissions = baseMissions.map((mission) => {
          return { ...mission, completedCount: count };
        });

        const totalPoints = count;

        setMissions(updatedMissions);
        setExperiencePoints(totalPoints);
        setLevel(calculateLevel(totalPoints));
      } catch (err) {
        console.error("Failed to load galaxy data:", err);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  const handlePreviousChapter = () => {
    if (currentChapter > 1) setCurrentChapter(currentChapter - 1);
  };

  const handleNextChapter = () => {
    if (currentChapter < maxUnlockedChapter) setCurrentChapter(currentChapter + 1);
  };

  const handleMissionClick = (mission: Mission) => {
    if (mission.link) {
      router.push(mission.link);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto p-4">
        <MissionShell
          missions={missions
            .filter((m) => m.chapter === currentChapter)
            .map((m) => ({
              ...m,
              action: () => handleMissionClick(m),
            }))}
          experiencePoints={experiencePoints}
          level={level}
          currentChapter={currentChapter}
          maxUnlockedChapter={maxUnlockedChapter}
          onPreviousChapter={handlePreviousChapter}
          onNextChapter={handleNextChapter}
        />
      </div>
    </div>
  );
};

export default GalaxyZooSteps;
