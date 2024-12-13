import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeIcon, CheckIcon } from "lucide-react";
import PlanetTypeCommentForm from "./PlanetType";
import MissionFour from "./VoteForm";
import PHCommentForm from "./CommentForm";
import { StarterTelescopeTess } from "@/components/Projects/Telescopes/Transiting";

interface MissionStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  completedCount: number;
}

const PlanetHuntersSteps = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<MissionStep | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  useEffect(() => {
    if (!session?.user) return;

    const fetchMissionData = async () => {
      try {
        const { data: classificationsData } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", session.user.id);

        const mission1CompletedCount = classificationsData?.length || 0;

        const mission2Data = classificationsData?.filter((classification) => {
          const config = classification.classificationConfiguration;
          return config && !config["1"] && (config["2"] || config["3"] || config["4"]);
        }) || [];
        const mission2CompletedCount = mission2Data.length;

        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("author", session.user.id);

        const mission3CompletedCount = commentsData?.filter(
          (comment) => comment.configuration?.planetType
        ).length || 0;

        const { data: votesData } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", session.user.id);

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

        setSteps([
          {
            id: 1,
            title: "Classify a Planet",
            description: "Use your telescope to classify a planet.",
            icon: TelescopeIcon,
            action: () => {},
            completedCount: mission1CompletedCount,
          },
          {
            id: 2,
            title: "Propose 1 planetary candidate",
            description: "Classify a planet without selecting '1' as an option.",
            icon: CheckIcon,
            action: () => {},
            completedCount: mission2CompletedCount,
          },
          {
            id: 3,
            title: "Propose a planet type",
            description: "Make a comment proposing a planet type for a classification.",
            icon: CheckIcon,
            action: () => {},
            completedCount: mission3CompletedCount,
          },
          {
            id: 4,
            title: "Vote on Planet Classifications",
            description: "Review and vote on another user's planet classification.",
            icon: CheckIcon,
            action: () => {},
            completedCount: mission4CompletedCount,
          },
          {
            id: 5,
            title: "Comment on Planet Classifications",
            description: "Comment on a planet classification.",
            icon: CheckIcon,
            action: () => {},
            completedCount: mission5CompletedCount,
          },
        ]);

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchMissionData();
  }, [supabase, session?.user]);

  if (loading) return <p className="text-gray-400">Loading mission steps...</p>;

  if (selectedMission) {
    return (
      <div className="flex flex-col items-center bg-[#1D2833] text-white rounded-2xl shadow-lg p-8">
        <button
          className="mb-4 px-5 py-2 bg-[#5FCBC3] text-[#1D2833] rounded-full hover:bg-opacity-90"
          onClick={() => setSelectedMission(null)}
        >
          Back
        </button>
        <h2 className="text-2xl font-bold mb-4">{selectedMission.title}</h2>
        <p className="text-sm mb-6">{selectedMission.description}</p>
        <div className="p-4 bg-[#2C4F64] rounded-xl">
          {selectedMission.id === 1 && <StarterTelescopeTess />}
          {selectedMission.id === 2 && <StarterTelescopeTess />}
          {selectedMission.id === 3 && <PlanetTypeCommentForm />}
          {selectedMission.id === 4 && <MissionFour />}
          {selectedMission.id === 5 && <PHCommentForm />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#2C4F64] text-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between w-full mb-6">
        {/* <button
          className="px-5 py-2 bg-[#5FCBC3] text-[#1D2833] rounded-full hover:bg-opacity-90"
          onClick={() => setCurrentChapter((prev) => Math.max(1, prev - 1))}
          disabled={currentChapter === 1}
        >
          Previous
        </button> */}
        <h1 className="text-xl font-bold">Chapter {currentChapter}</h1>
        {/* <button
          className="px-5 py-2 bg-[#5FCBC3] text-[#1D2833] rounded-full hover:bg-opacity-90"
          onClick={() => setCurrentChapter((prev) => Math.min(2, prev + 1))}
          disabled={currentChapter === 2}
        >
          Next
        </button> */}
      </div>
      <div className="grid gap-4 w-full">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center p-6 rounded-2xl shadow-md cursor-pointer ${
              step.completedCount > 0 ? "bg-[#1D2833] opacity-70" : "bg-[#5FCBC3]"
            }`}
            onClick={() => setSelectedMission(step)}
          >
            <step.icon
              className={`h-10 w-10 ${
                step.completedCount > 0 ? "text-gray-400" : "text-[#2C4F64]"
              }`}
            />
            <div className="ml-4">
              <h2
                className={`text-lg font-bold ${
                  step.completedCount > 0 ? "line-through" : "text-[#1D2833]"
                }`}
              >
                {step.title}
              </h2>
              <p className={`text-sm ${step.completedCount > 0 ? "line-through" : ""}`}>
                {step.description}
              </p>
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