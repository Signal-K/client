import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeIcon, CheckIcon, RadioIcon, SpeakerIcon, PersonStandingIcon, DiscAlbum } from "lucide-react";
import PlanetTypeCommentForm from "./PlanetType";
import MissionFour from "./VoteForm";
import { StarterTelescopeTess } from "@/components/Projects/Telescopes/Transiting";
import DiscoveriesPage from "@/content/Classifications/minimalDiscoveries";
import VotePlanetClassifictions from "./PHVote";

interface MissionStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  completedCount: number;
  color: string;
};

const PlanetHuntersSteps = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<MissionStep | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [experiencePoints, setExperiencePoints] = useState<number>(0); // Track total points
  const [level, setLevel] = useState<number>(1); // Track level

  const missionPoints = {
    1: 2, // Mission 1 = 2 points
    2: 1, // Mission 2 = 1 point
    3: 2, // Mission 3 = 2 points
    4: 1, // Mission 4 = 1 point
    5: 1, // Mission 5 = 1 point
  };

  useEffect(() => {
    if (!session?.user) return;

    const fetchMissionData = async () => {
      try {
        // Fetch classifications data
        const { data: classificationsData, error: classificationsError } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", session.user.id);

        if (classificationsError) throw classificationsError;

        // Mission 1: Count all classifications of type 'planet'
        const mission1CompletedCount = classificationsData?.length || 0;

        // Mission 2: Filter classifications based on classificationConfiguration logic
        const mission2Data =
          classificationsData?.filter((classification) => {
            const config = classification.classificationConfiguration;
            if (!config) return false;

            const options = config.classificationOptions?.[""] || {};
            return (
              !options["1"] && // Ensure '1' is NOT selected
              (options["2"] || options["3"] || options["4"]) // Ensure at least one of 2, 3, or 4 is selected
            );
          }) || [];
        const mission2CompletedCount = mission2Data.length;

        // Fetch comments data
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("author", session.user.id);

        if (commentsError) throw commentsError;

        // Mission 3: Comments with planet type proposals
        const mission3CompletedCount = commentsData?.filter(
          (comment) => comment.configuration?.planetType
        ).length || 0;

        // Fetch votes data
        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", session.user.id);

        if (votesError) throw votesError;

        // Mission 4: Votes on planet classifications
        const planetVotes = votesData?.filter((vote) =>
          classificationsData?.some(
            (classification) =>
              classification.id === vote.classification_id &&
              classification.classificationtype === "planet"
          )
        ) || [];
        const mission4CompletedCount = planetVotes.length;

        // Mission 5: Comments linked to classifications
        const mission5CompletedCount = commentsData?.filter(
          (comment) =>
            comment.classification_id &&
            classificationsData?.some(
              (classification) =>
                classification.id === comment.classification_id &&
                classification.classificationtype === "planet"
            )
        ).length || 0;

        // Calculate total points and level
        const totalPoints = (
          mission1CompletedCount * missionPoints[1] +
          mission2CompletedCount * missionPoints[2] +
          mission3CompletedCount * missionPoints[3] +
          mission4CompletedCount * missionPoints[4] +
          mission5CompletedCount * missionPoints[5]
        );

        const newLevel = Math.floor(totalPoints / 9) + 1; // Every 8 points = level up
        setLevel(newLevel);
        setExperiencePoints(totalPoints);

        // Update mission steps
        setSteps([
          {
            id: 1,
            title: "Classify a Planet",
            description: "Use your telescope to classify a planet.",
            icon: TelescopeIcon,
            action: () => {},
            completedCount: mission1CompletedCount,
            color: "text-blue-500",
          },
          {
            id: 2,
            title: "Propose 1 planetary candidate",
            description: "Classify a planet without selecting '1' as an option.",
            icon: RadioIcon,
            action: () => {},
            completedCount: mission2CompletedCount,
            color: "text-purple-500",
          },
          {
            id: 3,
            title: "Propose a planet type",
            description: "Make a comment proposing a planet type for a classification.",
            icon: SpeakerIcon,
            action: () => {},
            completedCount: mission3CompletedCount,
            color: "text-green-500",
          },
          {
            id: 5,
            title: "Comment & vote on Planet Classifications",
            description: "Comment & vote on a planet classification.",
            icon: DiscAlbum,
            action: () => {},
            completedCount: mission5CompletedCount,
            color: "text-red-500",
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
            className="mb-4 px-5 py-2 bg-[#5FCBC3] text-[#1D2833] rounded-full hover:bg-opacity-90"
            onClick={() => setSelectedMission(null)}
          >
            Back
          </button>
          <div className="p-4 pb-10 py-10 rounded-xl overflow-y-auto max-h-[5000px] w-full flex-1">
            <center>
              {selectedMission.id === 1 && <StarterTelescopeTess />}
              {selectedMission.id === 2 && <StarterTelescopeTess />}
              {selectedMission.id === 3 && <PlanetTypeCommentForm />}
              {selectedMission.id === 5 && <VotePlanetClassifictions />}
            </center>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center bg-[#1D2833]/90 width-[100%] text-white rounded-2xl p-6">
      <div className="flex justify-between w-full mb-6">
        <h1 className="text-xl font-bold">Chapter {currentChapter}</h1>
      </div>

      {/* Experience Bar */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
          <div
            className="bg-[#5FCBC3] h-4 rounded-full"
            style={{ width: `${(experiencePoints % 9) * 10.5}%` }}
          ></div>
        </div>
      </div>
      <p className="text-sm text-center mb-6">
        Level {level} ({experiencePoints} points)
      </p>

      <div className="grid gap-4 w-full">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center p-6 rounded-2xl shadow-md cursor-pointer ${
              step.completedCount > 0 ? "bg-gray-700" : "bg-blue-500"
            }`}
            onClick={() => setSelectedMission(step)}
          >
            <step.icon className={`h-10 w-10 ${step.color}`} />
            <div className="ml-4">
              <h2 className={`text-lg font-bold ${step.color}`}>
                {step.title}
              </h2>
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
  );
};

export default PlanetHuntersSteps;