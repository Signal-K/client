import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeIcon, CheckIcon } from "lucide-react";
import PlanetTypeCommentForm from "./PlanetType";
import MissionFour from "./VoteForm";
import PHCommentForm from "./CommentForm";

interface MissionStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
  completedCount: number;
};

const PlanetHuntersSteps = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<MissionStep | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  useEffect(() => {
    if (!session?.user) {
      console.log("Session is loading...");
      return;
    }

    const fetchMissionData = async () => {
      try {
        const { data: classificationsData, error: classificationsError } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet")
          .eq("author", session.user.id);

        if (classificationsError) throw new Error(`Error fetching classifications: ${classificationsError.message}`);
        console.log("Fetched Classifications Data:", classificationsData);

        const mission1CompletedCount = classificationsData?.length || 0;

        const mission2Data = classificationsData?.filter((classification) => {
          const config = classification.classificationConfiguration;
          return (
            config &&
            !config["1"] &&
            (config["2"] || config["3"] || config["4"])
          );
        });
        const mission2CompletedCount = mission2Data?.length || 0;

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("author", session.user.id);

        if (commentsError) throw new Error(`Error fetching comments: ${commentsError.message}`);

        const mission3CompletedCount = commentsData?.filter(
          (comment) => comment.configuration?.planetType
        ).length || 0;

        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*")
          .eq("user_id", session.user.id);

        if (votesError) throw new Error(`Error fetching votes: ${votesError.message}`);

        // Filter votes related to planet classifications
        const planetVotes = [];
        for (const vote of votesData) {
          const { data: classificationData, error: classificationError } = await supabase
            .from("classifications")
            .select("*")
            .eq("id", vote.classification_id)
            .single();

          if (classificationError) {
            console.error(`Error fetching classification for vote ${vote.id}:`, classificationError);
          } else {
            // Only count votes for classifications with the type 'planet'
            if (classificationData.classificationtype === "planet") {
              planetVotes.push(vote);
            }
          }
        }

        const mission4CompletedCount = planetVotes.length;

        const mission5CompletedCount = commentsData?.filter(
          (comment) => comment.classification_id && classificationsData.some((classification) => classification.id === comment.classification_id && classification.classificationtype === 'planet')
        ).length || 0;

        // Update mission steps state
        setSteps([
          {
            id: 1,
            title: "Classify a Planet",
            description: "Use your telescope to classify a planet.",
            icon: TelescopeIcon,
            action: () => console.log("Classify action"),
            completedCount: mission1CompletedCount,
          },
          {
            id: 2,
            title: "Propose 1 planetary candidate",
            description: "Classify a planet without selecting '1' as an option.",
            icon: CheckIcon,
            action: () => console.log("Propose action"),
            completedCount: mission2CompletedCount,
          },
          {
            id: 3,
            title: "Propose a planet type",
            description: "Make a comment proposing a planet type for a classification.",
            icon: CheckIcon,
            action: () => console.log("Propose planet type"),
            completedCount: mission3CompletedCount,
          },
          {
            id: 4,
            title: "Vote on Planet Classifications",
            description: "Review and vote on another user's planet classification.",
            icon: CheckIcon,
            action: () => console.log("Vote action"),
            completedCount: mission4CompletedCount,
          },
          {
            id: 5,
            title: "Comment on Planet Classifications",
            description: "Comment on a planet classification.",
            icon: CheckIcon,
            action: () => console.log("Comment action"),
            completedCount: mission5CompletedCount,
          },
          // Adding demo missions for Chapter 2
          {
            id: 6,
            title: "Chapter 2 Demo Mission 1",
            description: "This is a demo mission for Chapter 2.",
            icon: CheckIcon,
            action: () => console.log("Demo mission 1"),
            completedCount: 0,
          },
          {
            id: 7,
            title: "Chapter 2 Demo Mission 2",
            description: "This is another demo mission for Chapter 2.",
            icon: CheckIcon,
            action: () => console.log("Demo mission 2"),
            completedCount: 0,
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

  const handleSelectMission = (step: MissionStep) => {
    setSelectedMission(step);
  };

  const switchChapter = (direction: "next" | "prev") => {
    setCurrentChapter((prevChapter) => {
      if (direction === "next" && prevChapter < 2) {
        return prevChapter + 1;
      }
      if (direction === "prev" && prevChapter > 1) {
        return prevChapter - 1;
      }
      return prevChapter;
    });
  };

  if (loading) {
    return <p className="text-gray-400">Loading mission steps...</p>;
  }

  // Filter steps based on the current chapter
  const chapter1Steps = steps.slice(0, 5);
  const chapter2Steps = steps.slice(5);

  return (
    <div className="flex">
      <div className="w-1/2 p-6 max-w-lg mx-auto bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-black mb-4">Planet Classification Guide</h1>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-black">
            {currentChapter === 1 ? "Chapter 1" : "Chapter 2"}
          </h2>
        </div>

        <div className="space-y-4">
          {(currentChapter === 1 ? chapter1Steps : chapter2Steps).map((step) => (
            <div key={step.id} className="flex items-start p-4 bg-white rounded-md shadow-sm">
              <step.icon className="h-10 w-10 text-gray-600 mr-4" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-black">{step.title}</h2>
                <p className="text-sm text-gray-600">{step.description}</p>
                <div className="flex space-x-4">
                  <button
                    className="mt-2 px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded hover:bg-gray-600"
                    onClick={step.action}
                  >
                    Perform Action
                  </button>
                  <button
                    className="mt-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleSelectMission(step)}
                  >
                    Interact
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center ml-4">
                <span className="text-xs text-gray-600">Completed</span>
                <span className="text-lg font-bold text-black">{step.completedCount}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => switchChapter("prev")}
            disabled={currentChapter === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => switchChapter("next")}
            disabled={currentChapter === 2}
          >
            Next
          </button>
        </div>
      </div>

      <div className="w-1/2 p-6 max-w-lg mx-auto bg-white rounded-lg shadow-sm">
        {selectedMission && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-black">{selectedMission.title}</h2>
            <p className="text-sm text-gray-600">{selectedMission.description}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              {selectedMission.id === 3 ? (
                <PlanetTypeCommentForm />
              ) : selectedMission.id === 4 ? (
                <MissionFour />
              ) : selectedMission.id === 5 ? (
                <PHCommentForm />
              ) : (
                <p className="text-center text-gray-500">Interact component goes here</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetHuntersSteps;