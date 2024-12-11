import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface Classification {
  author: string | undefined;
  id: number;
  content: string;
  media: any;
  classificationConfiguration: {
    votes: number;
    classificationOptions: { [key: string]: any };
  };
  image_url?: string;
};

const PlanetTypeCommentForm = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: classificationData, error: classificationError } = await supabase
          .from("classifications")
          .select("*")
          .eq("author", session.user.id)
          .eq("classificationtype", "planet");

        if (classificationError) {
          console.error("Error fetching classifications:", classificationError);
          return;
        }

        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            configuration,
            classification_id,
            author (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq("author", session.user.id)
          .not("configuration", "is", null);

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          return;
        }

        setClassifications(classificationData);
        setComments(commentsData);

        const proposedPlanetComments = commentsData.filter(
          (comment) => comment.configuration?.planetType
        );

        const proposedCandidates = classificationData.filter((classification) => {
          const config = classification.classificationConfiguration;
          if (!config || !config.classificationOptions) return false;
          const options = config.classificationOptions[""] || {};
          return !options["1"];
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [session, supabase]);

  const handleSelectPreferredComment = async (classificationId: number, commentId: number) => {
    const selectedComment = comments.find((comment) => comment.id === commentId);

    if (!selectedComment) return;

    const classificationToUpdate = classifications.find((classification) => classification.id === classificationId);
    if (!classificationToUpdate) return;

    if (classificationToUpdate.author !== session?.user?.id) return;

    const planetType = selectedComment.configuration?.planetType;
    if (!planetType) return;

    const updatedClassificationConfig = {
      ...classificationToUpdate.classificationConfiguration,
      classificationOptions: {
        ...classificationToUpdate.classificationConfiguration.classificationOptions,
        "planetType": [...(classificationToUpdate.classificationConfiguration.classificationOptions["planetType"] || []), planetType],
      }
    };

    const { error } = await supabase
      .from("classifications")
      .update({
        classificationConfiguration: updatedClassificationConfig,
      })
      .eq("id", classificationId);

    if (error) {
      console.error("Error updating classification configuration:", error);
    }

    const updatedConfig = {
      ...selectedComment.configuration,
      preferred: true,
    };

    const { error: commentError } = await supabase
      .from("comments")
      .update({
        configuration: updatedConfig,
      })
      .eq("id", commentId);

    if (commentError) {
      console.error("Error updating comment configuration:", commentError);
    }
  };

  const handleProposePlanetType = async (classificationId: number, planetType: "Terrestrial" | "Gaseous") => {
    if (!commentInput) {
      console.error("Comment input is required");
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert([
        {
          content: commentInput,
          classification_id: classificationId,
          author: session?.user?.id,
          configuration: { planetType },
        },
      ]);

    if (error) {
      console.error("Error inserting comment:", error);
    } else {
      setCommentInput("");
      console.log("Comment inserted successfully with planet type");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-sm">
      {classifications.length > 0 && (
        <div className="mt-8 space-y-4">
          {classifications.map((classification) => (
            <div key={classification.id} className="space-y-2">
              <h2 className="text-xl font-semibold text-black">Classification {classification.id}</h2>
              <p className="text-s font-italic text-cyan-300">{classification.content}</p>

              {classification.image_url && (
                <img
                  src={classification.image_url}
                  alt={`Classification ${classification.id}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              )}

              <div className="space-y-2">
                {comments
                  .filter((comment) => comment.classification_id === classification.id)
                  .map((comment) => (
                    <div key={comment.id} className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-black">{comment.content}</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleSelectPreferredComment(classification.id, comment.id)}
                          className="mt-2 text-gray-600"
                        >
                          Mark as Preferred
                        </button>
                        <p className="text-xs text-gray-600">{comment.configuration?.planetType}</p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-4 space-y-2">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Make a comment and propose a planet type"
                  className="w-full p-2 border text-gray-500 border-gray-300 rounded"
                />
                <div className="flex space-x-4">
                  <button
                    className="bg-gray-500 text-white p-2 rounded"
                    onClick={() => handleProposePlanetType(classification.id, "Terrestrial")}
                  >
                    Propose Terrestrial
                  </button>
                  <button
                    className="bg-gray-500 text-white p-2 rounded"
                    onClick={() => handleProposePlanetType(classification.id, "Gaseous")}
                  >
                    Propose Gaseous
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanetTypeCommentForm;