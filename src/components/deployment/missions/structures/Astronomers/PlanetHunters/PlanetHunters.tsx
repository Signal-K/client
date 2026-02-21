import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import MissionShell from "../../BasePlate";
import {
  TelescopeIcon,
  SpeakerIcon,
  DiscAlbum,
  Paintbrush2Icon,
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

const PlanetHuntersSteps = () => {
  const session = useSession();
  const router = useRouter();

  const [planetClassifications, setPlanetClassifications] = useState<any[]>([]);
  const [selectedClassificationId, setSelectedClassificationId] = useState<number | null>(null);

  // Base missions with slug placeholders
  const baseMissions: Mission[] = [
    {
      id: 1,
      title: "Discover planets",
      description: "Use your telescope to classify planet candidates",
      icon: TelescopeIcon,
      points: 1,
      completedCount: 0,
      link: "/structures/telescope/planet-hunters/classify",
      color: "text-blue-500",
      chapter: 1,
    },
    {
      id: 2,
      title: "Identify planet types",
      description: "Make a comment proposing a planet type for a classification.",
      icon: SpeakerIcon,
      points: 1,
      completedCount: 0,
      slug: "/structures/telescope/planet-hunters/{classificationid}/comment/",
      color: "text-green-500",
      chapter: 1,
    },
    {
      id: 3,
      title: "Survey planet classifications",
      description: "Comment & vote on a planet, suggesting stats and alterations to classifications.",
      icon: DiscAlbum,
      points: 1,
      completedCount: 0,
      slug: "/structures/telescope/planet-hunters/{classificationid}/survey",
      color: "text-red-500",
      chapter: 1,
    },
    {
      id: 5,
      title: "Paint a planet",
      description: "Now comes the fun part - you can explore and customise planet candidates you've discovered",
      icon: Paintbrush2Icon,
      points: 1,
      completedCount: 0,
      slug: "/structures/telescope/planet-hunters/{classificationid}/paint/",
      color: "text-green-300",
      chapter: 2,
    },
  ];

  const [missions, setMissions] = useState<Mission[]>(baseMissions);

  const [experiencePoints, setExperiencePoints] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  const maxUnlockedChapter = Math.max(
    Math.floor(experiencePoints / 5) + 1,
    Math.max(...missions.map((m) => m.chapter))
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        const classRes = await fetch(
          `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&classificationtype=planet&limit=500`
        );
        const classPayload = await classRes.json();
        if (!classRes.ok) throw new Error(classPayload?.error || "Failed to load classifications");
        const classifications = classPayload?.classifications || [];

        setPlanetClassifications(classifications || []);
        if (classifications && classifications.length > 0 && !selectedClassificationId) {
          setSelectedClassificationId(classifications[0].id);
        }

        const activityRes = await fetch(`/api/gameplay/social/my?category=Temperature&limit=5000`);
        const activityPayload = await activityRes.json();
        if (!activityRes.ok) throw new Error(activityPayload?.error || "Failed to load activity");
        const commentsData = activityPayload?.comments || [];
        const votesData = activityPayload?.votes || [];
        const temperatureData = commentsData.filter((c: any) => c?.category === "Temperature");

        const mission1Completed = classifications?.length || 0;
        const mission3Completed = commentsData?.length || 0;
        const mission4Completed = (commentsData?.length || 0) + (votesData?.length || 0);
        const mission5Completed = temperatureData?.length || 0;

        const updatedMissions = baseMissions.map((mission) => {
          switch (mission.id) {
            case 1:
              return { ...mission, completedCount: mission1Completed };
            case 3:
              return { ...mission, completedCount: mission3Completed };
            case 4:
              return { ...mission, completedCount: mission4Completed };
            case 5:
              return { ...mission, completedCount: mission5Completed };
            default:
              return mission;
          }
        });

        const totalPoints = mission1Completed + mission3Completed + mission4Completed + mission5Completed;

        setMissions(updatedMissions);
        setExperiencePoints(totalPoints);
        setLevel(Math.floor(totalPoints / 9) + 1);
      } catch (err) {
        console.error("Failed to load planet data:", err);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  // Update missions' slugs whenever selectedClassificationId changes to replace placeholder
  useEffect(() => {
    if (selectedClassificationId === null) return;

    const updatedMissionsWithSlug = missions.map((mission) => {
      if (mission.slug) {
        return {
          ...mission,
          slug: mission.slug.replace("{classificationid}", selectedClassificationId.toString()),
        };
      }
      return mission;
    });

    setMissions(updatedMissionsWithSlug);
  }, [selectedClassificationId]);

  const handlePreviousChapter = () => {
    if (currentChapter > 1) setCurrentChapter(currentChapter - 1);
  };

  const handleNextChapter = () => {
    if (currentChapter < maxUnlockedChapter) setCurrentChapter(currentChapter + 1);
  };

  const handleMissionClick = (mission: Mission) => {
    if (mission.link) {
      router.push(mission.link);
    } else if (mission.slug) {
      // slug is already replaced by useEffect
      router.push(mission.slug);
    };
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto p-4">
        {planetClassifications.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select a planet
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedClassificationId || ""}
              onChange={(e) => setSelectedClassificationId(Number(e.target.value))}
            >
              {planetClassifications.map((classification) => (
                <option key={classification.id} value={classification.id}>
                  Planet #{classification.id}
                </option>
              ))}
            </select>
          </div>
        )}
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

export default PlanetHuntersSteps;
