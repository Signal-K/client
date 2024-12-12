import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { CheckIcon } from "lucide-react";

interface Comment {
  id: number;
  content: string;
}

interface Classification {
  id: number;
  content: string;
  vote_count: number;
  comments: Comment[];
}

interface PlanetVoteProps {
  classification: Classification;
  onVote: (classificationId: number) => void;
}

const PlanetVoteComponent: React.FC<PlanetVoteProps> = ({ classification, onVote }) => {
  const isConfirmed = classification.vote_count >= 5;

  return (
    <div className={`p-4 border rounded-md ${isConfirmed ? "bg-green-100" : "bg-white"}`}>
      <h3 className="text-lg font-semibold">Planet Classification</h3>
      <p className="text-sm text-gray-700">{classification.content}</p>
      <div className="mt-2 space-y-2">
        <p className="text-sm font-medium">Comments:</p>
        {classification.comments?.map((comment: Comment) => (
          <p key={comment.id} className="text-sm text-gray-600">{comment.content}</p>
        ))}
      </div>
      <div className="mt-4">
        {isConfirmed ? (
          <span className="inline-block px-4 py-2 text-sm font-bold text-green-800 bg-green-300 rounded">
            Confirmed
          </span>
        ) : (
          <button
            className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => onVote(classification.id)}
          >
            Vote
          </button>
        )}
      </div>
    </div>
  );
};

const MissionFour: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);

      const { data: classificationsData, error: classificationsError } = await supabase
        .from("classifications")
        .select(`
          *,
          comments(content),
          votes!left(id)
        `)
        .eq("classificationtype", "planet")
        .neq("author", session?.user?.id);

      if (classificationsError) {
        console.error("Error fetching classifications:", classificationsError);
      } else {
        const processedData: Classification[] = classificationsData.map((classification) => ({
          ...classification,
          vote_count: classification.votes?.length || 0, // Count votes by length
        }));
        setClassifications(processedData);
      }

      setLoading(false);
    };

    fetchClassifications();
  }, [supabase, session?.user?.id]);

  const handleVote = async (classificationId: number) => {
    if (!session?.user?.id) return;
    const { error } = await supabase.from("votes").insert({
      user_id: session.user.id,
      classification_id: classificationId,
    });

    if (error) {
      console.error("Error voting:", error);
    } else {
      setClassifications((prev) =>
        prev.map((classification) =>
          classification.id === classificationId
            ? { ...classification, vote_count: classification.vote_count + 1 }
            : classification
        )
      );
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading planet classifications...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Vote on Planet Classifications</h2>
      {classifications.map((classification) => (
        <PlanetVoteComponent
          key={classification.id}
          classification={classification}
          onVote={handleVote}
        />
      ))}
    </div>
  );
};

export default MissionFour;