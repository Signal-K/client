import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeIcon, RadioIcon, SpeakerIcon, DiscAlbum, PersonStandingIcon, Paintbrush2, HelpCircle } from "lucide-react";
import PlanetTypeCommentForm from "./PlanetType";
import { FirstTelescopeClassification, StarterTelescopeTess } from "@/components/Projects/Telescopes/Transiting";
import VotePlanetClassifictions from "./PHVote";
import PHClassificationGenerator from "./PlanetMaker";
import PlanetTemperatureForm from "./PlanetTemperature";
import { Mission } from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudspottingOnMars";

interface MissionStep {
  id: number;
  title: string;
  description: string;
  points?: number;
  icon: React.ElementType;
  action: () => void;
  completedCount: number;
  color: string;
  chapter: number;
};

const PlanetHuntersSteps = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<MissionStep | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [experiencePoints, setExperiencePoints] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);

  const missionPoints = {
    1: 2,
    2: 1,
    3: 2,
    4: 1,
    5: 1,
  };

  useEffect(() => {
    if (!session?.user) return;

    const fetchMissionData = async () => {
      try {
        const { data: classificationsData, error: classificationsError } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", session.user.id);

        if (classificationsError) throw classificationsError;

        const mission1CompletedCount = classificationsData?.length || 0;

        const mission2Data =
          classificationsData?.filter((classification) => {
            const config = classification.classificationConfiguration;
            if (!config) return false;

            const options = config.classificationOptions?.[""] || {};
            return (
              !options["1"] &&
              (options["2"] || options["3"] || options["4"])
            );
          }) || [];
        const mission2CompletedCount = mission2Data.length;

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("author", session.user.id);

        if (commentsError) throw commentsError;

        const mission3CompletedCount = commentsData?.filter(
          (comment) => comment.configuration?.planetType
        ).length || 0;

        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", session.user.id);

        if (votesError) throw votesError;

        const planetVotes = votesData?.filter((vote) =>
          classificationsData?.some(
            (classification) =>
              classification.id === vote.classification_id &&
              classification.classificationtype === "planet"
          )
        ) || [];
        const mission4CompletedCount = planetVotes.length;

        const mission5CompletedCount = commentsData?.filter(
          (comment) =>
            comment.classification_id &&
            classificationsData?.some(
              (classification) =>
                classification.id === comment.classification_id &&
                classification.classificationtype === "planet"
            )
        ).length || 0;

        const totalPoints = (
          mission1CompletedCount * missionPoints[1] +
          mission2CompletedCount * missionPoints[2] +
          mission3CompletedCount * missionPoints[3] +
          mission4CompletedCount * missionPoints[4] +
          mission5CompletedCount * missionPoints[5]
        );

        const newLevel = Math.floor(totalPoints / 9) + 1;
        setLevel(newLevel);
        setExperiencePoints(totalPoints);

        setSteps([
          {
            id: 1,
            title: "Classify a Planet",
            description: "Use your telescope to classify a planet.",
            icon: TelescopeIcon,
            action: () => {},
            completedCount: mission1CompletedCount,
            color: "text-blue-500",
            chapter: 1,
          },
          {
            id: 2,
            title: "Propose 1 planetary candidate",
            description: "Make a classification indicating a positive candidate.",
            icon: RadioIcon,
            action: () => {},
            completedCount: mission2CompletedCount,
            color: "text-purple-500",
            chapter: 1,
          },
          {
            id: 3,
            title: "Propose a planet type",
            description: "Make a comment proposing a planet type for a classification.",
            icon: SpeakerIcon,
            action: () => {},
            completedCount: mission3CompletedCount,
            color: "text-green-500",
            chapter: 1,
          },
          {
            id: 4,
            title: "Comment & vote on Planet Classifications",
            description: "Comment & vote on a planet classification.",
            icon: DiscAlbum,
            action: () => {},
            completedCount: mission4CompletedCount,
            color: "text-red-500",
            chapter: 1,
          },
          {
            id: 5,
            title: "Calculate planetary temperatures",
            description: "Use satellite data to help determine the temperature of planets you've discovered",
            action: () => {},
            // completedCount: mission4CompletedCount
            color: 'text-yellow-700',
            chapter: 1,
            icon: "symbol",
            completedCount: 0
          },
          {
            id: 6,
            title: "Make your own planet design",
            description: "You're now able to start creating visual representations of your discoveries. These will become more advanced and accurate the more data you discover",
            icon: Paintbrush2,
            action: () => {},
            completedCount: 0,
            color: "text-yellow-500",
            chapter: 2,
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching mission data:", error);
        setLoading(false);
      }
    };

    fetchMissionData();
  }, [supabase, session?.user]);

  if (loading) return <p className="text-gray-400">Loading mission steps...</p>;

  if (selectedMission) {
    return (
      <div className="flex-1 overflow-y-auto w-full h-screen flex flex-col">
        <div className="flex flex-col items-center bg-[#1D2833] text-white rounded-2xl shadow-lg p-8 flex-1">
          <button
            className="mb-4 px-5 py-2 bg-[#1D2833] text-[#5FCBC3] rounded-full hover:bg-opacity-90"
            onClick={() => setSelectedMission(null)}
          >
            Back
          </button>
          <div className="p-4 pb-10 py-10 rounded-xl overflow-y-auto max-h-[5000px] w-full flex-1">
            <center>
              {selectedMission.id === 1 && <StarterTelescopeTess />}
              {selectedMission.id === 2 && <StarterTelescopeTess />}
              {selectedMission.id === 3 && <PlanetTypeCommentForm />}
              {selectedMission.id === 4 && <VotePlanetClassifictions />}
              {selectedMission.id === 5 && <PlanetTemperatureForm />}
              {selectedMission.id === 6 && <PHClassificationGenerator />}
              {selectedMission.id === 1000 && <FirstTelescopeClassification anomalyid={"6"} />}
            </center>
          </div>
        </div>
      </div>
    );
  };

  const tutorialMission: MissionStep = {
    id: 1000,
    chapter: 1,
    title: "Welcome to Planet Hunters",
    description: 'Learn how to discover planet candidates by following this guide',
    completedCount: 0,
    points: 0,
    icon: HelpCircle,
    action: () => {},
    color: 'text-yellow-500',
  };  

  const renderMission = (mission: MissionStep) => {
    const completedCount = mission.completedCount ?? 0;

    return (
      <div
        key={mission.id}
        className="flex items-center p-6 rounded-2xl"
        onClick={() => setSelectedMission(mission)}
      >
        <mission.icon className={`w-10 h-10 ${mission.color}`} />
        <div className="ml-4">
          <h2 className={`text-lg font-bold ${mission.color}`}>{mission.title}</h2>
          <p className={`text-sm ${mission.color}`}>{mission.description}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs">Completed: {completedCount}</p>
          <p className="text-xl font-bold">{completedCount}</p>
        </div>
      </div>
    )
  }

  const filteredSteps = steps.filter((step) => step.chapter === currentChapter);

  const maxChapter = Math.max(...steps.map(step => step.chapter));

  return (
    <div className="flex flex-col items-center width-[100%] text-white rounded-2xl p-6">
      <div className="w-full mb-6">
        <h1 className="text-xl font-bold mb-2">Chapter {currentChapter}</h1>
        <div className="h-2 bg-gray-600 rounded-full w-full mb-4">
          <div
            className="h-full bg-[#5FCBC3] rounded-full"
            style={{ width: `${(experiencePoints / (maxChapter * 9)) * 100}%` }}
          />
        </div>
        <p className="text-sm text-center">{`Level ${level} - ${experiencePoints} XP`}</p>
      </div>

      <div className="flex justify-between w-full mb-6">
        <button
          className="px-4 py-2 bg-gray-800 rounded-full"
          onClick={() => setCurrentChapter(Math.max(currentChapter - 1, 1))}
          disabled={currentChapter === 1}
        >
          Previous Chapter
        </button>
        <button
          className="px-4 py-2 bg-gray-800 rounded-full"
          onClick={() => setCurrentChapter(Math.min(currentChapter + 1, maxChapter))}
          disabled={currentChapter === maxChapter}
        >
          Next Chapter
        </button>
      </div>

      <div className="bg-gray-700 p-6 rounded-2xl w-full mb-6">
        <div className="grid grid-cols-2 gap-4 w-full">
          {filteredSteps.slice(0, 2).map((step) => (
            <div
              key={step.id}
              className={`flex items-center p-6 rounded-2xl cursor-pointer ${
                step.completedCount > 0 ? "bg-gray-700" : "bg-blue-500"
              }`}
              onClick={() => setSelectedMission(step)}
            >
              <step.icon className={`h-10 w-10 ${step.color}`} />
              <div className="ml-4">
                <h2 className={`text-lg font-bold ${step.color}`}>{step.title}</h2>
                <p className={`text-sm ${step.color}`}>{step.description}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs">Completed</p>
                <p className="text-xl font-bold">{step.completedCount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 w-full mt-6">
        {filteredSteps.slice(2).map((step) => (
          <div
            key={step.id}
            className={`flex items-center p-6 rounded-2xl shadow-md cursor-pointer ${
              step.completedCount > 0 ? "bg-gray-700" : "bg-blue-500"
            }`}
            onClick={() => setSelectedMission(step)}
          >
            <step.icon className={`h-10 w-10 ${step.color}`} />
            <div className="ml-4">
              <h2 className={`text-lg font-bold ${step.color}`}>{step.title}</h2>
              <p className={`text-sm ${step.color}`}>{step.description}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs">Completed</p>
              <p className="text-xl font-bold">{step.completedCount}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {renderMission(tutorialMission)}
      </div>
    </div>
  );
};

export default PlanetHuntersSteps;