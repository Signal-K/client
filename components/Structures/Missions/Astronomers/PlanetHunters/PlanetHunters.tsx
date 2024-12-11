import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { TelescopeIcon, CheckIcon } from "lucide-react";
import PlanetTypeCommentForm from "./PlanetType";

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

  useEffect(() => {
    const fetchMissionData = async () => {
      const { data: classificationsData, error: classificationsError } = await supabase
        .from("classifications")
        .select("*")
        .eq("classificationtype", "planet")
        .eq("author", session?.user.id);

      if (classificationsError) {
        console.error("Error fetching classifications:", classificationsError);
      }

      const mission1CompletedCount = classificationsData?.length || 0;

      const mission2Data = classificationsData?.filter((classification) => {
        const config = classification.classificationOptions;
        
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
        .eq("author", session?.user.id);

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      }

      const mission3CompletedCount = commentsData?.filter(comment => comment.configuration?.planetType)?.length || 0;

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
      ]);

      setLoading(false);
    };

    fetchMissionData();
  }, [supabase]);

  const handleSelectMission = (step: MissionStep) => {
    setSelectedMission(step);
  };

  if (loading) {
    return <p className="text-gray-400">Loading mission steps...</p>;
  }

  return (
    <div className="flex">
      <div className="w-1/2 p-6 max-w-lg mx-auto bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-black mb-4">Planet Classification Guide</h1>
        <div className="space-y-4">
          {steps.map((step) => (
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
      </div>

      <div className="w-1/2 p-6 max-w-lg mx-auto bg-white rounded-lg shadow-sm">
        {selectedMission && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-black">{selectedMission.title}</h2>
            <p className="text-sm text-gray-600">{selectedMission.description}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              {selectedMission.id === 3 ? (
                <PlanetTypeCommentForm />
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