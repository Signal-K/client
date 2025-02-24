import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeIcon, RadioIcon, SpeakerIcon, DiscAlbum, PersonStandingIcon, Paintbrush2, HelpCircle } from "lucide-react";
import PlanetTypeCommentForm from "./PlanetType";
import { FirstTelescopeClassification, StarterTelescopeTess } from "@/components/Projects/Telescopes/Transiting";
import VotePlanetClassifictions from "./PHVote";
import PHClassificationGenerator from "./PlanetMaker";
import PlanetTemperatureForm from "./PlanetTemperature";
import PlanetHuntersTemperatureWrapper from "./PlanetTemperature";

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
            comment.configuration?.temperature
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
          // {
          //   id: 3,
          //   title: "Propose a planet type",
          //   description: "Make a comment proposing a planet type for a classification.",
          //   icon: SpeakerIcon,
          //   action: () => {},
          //   completedCount: mission3CompletedCount,
          //   color: "text-green-500",
          //   chapter: 1,
          // },
          {
            id: 4,
            title: "Survey planet classifications",
            description: "Comment & vote on a planet, suggesting stats and alterations to classifications",
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
            color: 'text-yellow-700',
            chapter: 2,
            icon: "symbol",
            completedCount: mission5CompletedCount,
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
      };
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
              {selectedMission.id === 5 && <PlanetHuntersTemperatureWrapper />}
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
    );
  };

  const filteredSteps = steps.filter((step) => step.chapter === currentChapter);

  const maxChapter = Math.max(...steps.map(step => step.chapter));

  return (
    <div className="flex flex-col items-center w-full text-white rounded-2xl p-6 max-w-3xl mx-auto">
      <div className="w-full mb-4">
        <h1 className="text-xl font-bold mb-2 text-center">Chapter {currentChapter}</h1>
        <div className="h-2 bg-gray-600 rounded-full w-full">
          <div
            className="h-full bg-[#5FCBC3] rounded-full"
            style={{ width: `${(experiencePoints / (steps.length * 9)) * 100}%` }}
          />
        </div>
        <p className="text-sm text-center mt-2">{`Level ${level} - ${experiencePoints} XP`}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between w-full mb-4">
        <button
          className="px-4 py-2 bg-gray-800 rounded-full w-full sm:w-auto mb-2 sm:mb-0"
          onClick={() => setCurrentChapter(Math.max(currentChapter - 1, 1))}
          disabled={currentChapter === 1}
        >
          Previous Chapter
        </button>
        <button
          className="px-4 py-2 bg-gray-800 rounded-full w-full sm:w-auto"
          onClick={() => setCurrentChapter(Math.min(currentChapter + 1, 2))}
          disabled={currentChapter === 2}
        >
          Next Chapter
        </button>
      </div>

      <div className="bg-gray-700 p-6 rounded-2xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps
            .filter((step) => step.chapter === currentChapter)
            .map((step) => (
              <div
                key={step.id}
                className="flex items-center p-4 rounded-2xl bg-gray-800 hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedMission(step)}
              >
                <step.icon className={`w-8 h-8 ${step.color}`} />
                <div className="ml-4 flex-1">
                  <h2 className={`text-lg font-bold ${step.color}`}>{step.title}</h2>
                  <p className="text-sm">{step.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="mt-6">
        {renderMission(tutorialMission)}
      </div>
    </div>
  );
};

export default PlanetHuntersSteps;