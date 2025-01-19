import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { PostCardSingle } from "@/content/Posts/PostSingle";
import { SimplePostSingle } from "@/content/Posts/SimplePostSingle";

interface Classification {
  author: string;
  id: number;
  content: string;
  title: string;
  votes: number;
  category: string;
  // tags: string[];
  images: string[];
  anomaly: number;
  classificationtype: string;
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
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet");

        if (error) throw new Error("Error fetching classifications: " + error.message);

        const processedData = data?.map((classification) => {
          const media = classification.media;
          let images: string[] = [];

          if (Array.isArray(media)) {
            media.forEach((item) => {
              if (typeof item === "string" && item.startsWith("http")) {
                images.push(item);
              } else if (Array.isArray(item)) {
                item.forEach((nested) => {
                  if (typeof nested === "string" && nested.startsWith("http")) {
                    images.push(nested);
                  }
                });
              } else if (typeof item === "object" && item.uploadUrl) {
                images.push(item.uploadUrl);
              }
            });
          }

          const votes = classification.classificationConfiguration?.votes || 0;

          return { ...classification, images, votes };
        });

        setClassifications(processedData || []);
      } catch (err) {
        console.error(err);
      };
    };

    const fetchComments = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
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

        if (error) throw new Error("Error fetching comments: " + error.message);

        setComments(data || []);
      } catch (err) {
        console.error(err);
      };
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchClassifications(), fetchComments()]);
      setLoading(false);
    };

    fetchData();
  }, [session, supabase]);

  const handleSelectPreferredComment = async (classificationId: number, commentId: number) => {
    const selectedComment = comments?.find((comment) => comment.id === commentId);
    if (!selectedComment) return;

    const classificationToUpdate = classifications?.find(
      (classification) => classification.id === classificationId
    );
    if (!classificationToUpdate || classificationToUpdate.author !== session?.user?.id) return;

    const planetType = selectedComment.configuration?.planetType;
    if (!planetType) return;

    const updatedClassificationConfig = {
      ...classificationToUpdate.classificationConfiguration,
      classificationOptions: {
        ...classificationToUpdate.classificationConfiguration.classificationOptions,
        planetType: [
          ...(classificationToUpdate.classificationConfiguration.classificationOptions["planetType"] || []),
          planetType,
        ],
      },
    };

    try {
      const { error } = await supabase
        .from("classifications")
        .update({ classificationConfiguration: updatedClassificationConfig })
        .eq("id", classificationId);

      if (error) throw error;

      const updatedConfig = { ...selectedComment.configuration, preferred: true };

      const { error: commentError } = await supabase
        .from("comments")
        .update({ configuration: updatedConfig })
        .eq("id", commentId);

      if (commentError) throw commentError;

      console.log("Preferred comment updated successfully.");
    } catch (err) {
      console.error("Error updating preferred comment:", err);
    }
  };

  const handleProposePlanetType = async (classificationId: number, planetType: "Terrestrial" | "Gaseous") => {
    const commentInput = commentInputs[classificationId];
    if (!commentInput) {
      console.error("Comment input is required");
      return;
    };

    try {
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

      if (error) throw error;

      setCommentInputs((prev) => ({ ...prev, [classificationId]: "" }));
      console.log("Comment inserted successfully with planet type.");
    } catch (err) {
      console.error("Error inserting comment: ", err);
    };
  };

  const handleCommentInputChange = (classificationId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [classificationId]: value }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 w-screen bg-card max-w-lg mx-auto rounded-lg shadow-sm">
      {classifications.length > 0 ? (
        <div className="space-y-8">
          {classifications.map((classification) => (
            <div key={classification.id} className="space-y-4">
              <SimplePostSingle
                id={classification.id.toString()}
                title={`Planet discovery #${classification.id}`}
                author={classification.author || "Unknown"}
                content={classification.content || ""}
                category={classification.classificationtype || "Planet"}
                images={classification.images || []}
              />
              {/* <PostCardSingle
                key={classification.id}
                classificationId={classification.id}
                title={classification.title}
                author={classification.author}
                content={classification.content}
                votes={classification.votes}
                category={classification.category}
                // tags={classification.tags}
                images={classification.images}
                anomalyId={classification.anomaly.toString()}
                classificationConfig={classification.classificationConfiguration}
                classificationType={classification.classificationtype}
                commentStatus={false}
              /> */}
              <p className="text-sm italic text-cyan-500">{classification.content}</p>
              {classification.image_url && (
                <img
                  src={classification.image_url}
                  alt={`Classification ${classification.id}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              )}
              <div className="space-y-2">
                {(comments || [])
                  .filter((comment) => comment.classification_id === classification.id)
                  .map((comment) => (
                    <div key={comment.id} className="bg-gray-100 p-4 rounded-md shadow-sm">
                      <p className="text-black">Posted by: {comment.author.id?.substring(0, 8)}...</p>
                      <p className="text-black">{comment.content}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">
                          Proposed planet type: {comment.configuration?.planetType || "Unknown"}
                        </p>
                        {classification.author === session?.user?.id && (
                          <button
                            onClick={() => handleSelectPreferredComment(classification.id, comment.id)}
                            className="text-blue-500 mt-2"
                          >
                            Mark as Preferred
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 space-y-2">
                <textarea
                  value={commentInputs[classification.id] || ""}
                  onChange={(e) => handleCommentInputChange(classification.id, e.target.value)}
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
      ) : (
        <p>No classifications found.</p>
      )}
    </div>
  );
};

export default PlanetTypeCommentForm;