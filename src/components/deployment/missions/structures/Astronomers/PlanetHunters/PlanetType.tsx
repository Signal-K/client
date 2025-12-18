"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { SimplePostSingle } from "@/src/components/social/posts/SimplePostSingle";

interface Classification {
  author: string;
  id: number;
  content: string;
  title: string;
  votes: number;
  category: string;
  images: string[];
  anomaly: number;
  classificationtype: string;
  media: any;
  classificationConfiguration: {
    votes: number;
    classificationOptions: { [key: string]: any };
  };
  image_url?: string;
}

interface PlanetTypeCommentFormProps {
  classificationId?: string;
}

const PlanetTypeCommentForm = ({ classificationId }: PlanetTypeCommentFormProps) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const classificationIdNum = classificationId ? Number(classificationId) : undefined;

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        let query = supabase.from("classifications").select("*");

        if (classificationIdNum) {
          query = query.eq("id", classificationIdNum);
        } else {
          query = query.eq("classificationtype", "planet");
        }

        const { data, error } = await query;

        if (error) throw new Error("Error fetching classifications: " + error.message);

        const processedData = (data || []).map((classification) => {
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

        setClassifications(processedData);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchComments = async () => {
      try {
        let query = supabase
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
          `);

        if (classificationIdNum) {
          query = query.eq("classification_id", classificationIdNum);
        }

        const { data, error } = await query;

        if (error) throw new Error("Error fetching comments: " + error.message);

        setComments(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchClassifications(), fetchComments()]);
      setLoading(false);
    };

    fetchData();
  }, [supabase, classificationIdNum]);

  const handleSelectPreferredComment = async (classificationId: number, commentId: number) => {
    const selectedComment = comments.find((comment) => comment.id === commentId);
    if (!selectedComment) return;

    const classificationToUpdate = classifications.find(
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
    } catch (err) {
      console.error("Error updating preferred comment:", err);
    }
  };

  const handleProposePlanetType = async (
    classificationId: number,
    planetType: "Terrestrial" | "Gaseous"
  ) => {
    const commentInput = commentInputs[classificationId];
    if (!commentInput) {
      console.error("Comment input is required");
      return;
    }

    try {
      const { error } = await supabase.from("comments").insert([
        {
          content: commentInput,
          classification_id: classificationId,
          author: session?.user?.id,
          configuration: { planetType },
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setCommentInputs((prev) => ({ ...prev, [classificationId]: "" }));
      setShowSuccessPopup(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      console.error("Error inserting comment: ", err);
    }
  };

  const handleCommentInputChange = (classificationId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [classificationId]: value }));
  };

  if (loading) return <p>Loading...</p>;

  // SINGLE classification view if classificationId is passed
  if (classificationIdNum && classifications.length === 1) {
    const classification = classifications[0];
    return (
      <div className="w-full max-w-3xl mx-auto rounded-lg">
        <SimplePostSingle
          id={classification.id.toString()}
          title={`Planet discovery #${classification.id}`}
          author={classification.author || "Unknown"}
          content={classification.content || ""}
          category={classification.classificationtype || "Planet"}
          images={classification.images || []}
        />
        <p className="text-sm italic text-cyan-500">{classification.content}</p>
        {/* {classification.image_url && (
          <img
            src={classification.image_url}
            alt={`Classification ${classification.id}`}
            className="w-full h-auto rounded-md shadow-sm mt-4"
          />
        )} */}
        <div className="space-y-2 mt-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-100 p-4 rounded-md shadow-sm">
              <p className="text-black">
                Posted by: {comment.author.id?.substring(0, 8)}...
              </p>
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
    );
  }

  // Default view: all planet classifications
  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg">
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
              <p className="text-sm italic text-cyan-500">{classification.content}</p>
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
                    <div key={comment.id} className="bg-gray-100 p-4 rounded-md shadow-sm">
                      <p className="text-black">
                        Posted by: {comment.author.id?.substring(0, 8)}...
                      </p>
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
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Proposal Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Proposal entered into community database, rerouting you to the dashboard
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetTypeCommentForm;