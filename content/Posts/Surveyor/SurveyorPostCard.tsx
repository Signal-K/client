"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CommentCard } from "@/content/Comments/CommentSingle";
import PlanetTempCalculator from "@/components/Structures/Missions/Astronomers/PlanetHunters/TemperatureCalc";

interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
  isSurveyor?: boolean;
  configuration?: {
    planetType?: string;
  };
  category?: string;
  value?: string;
};

interface PostCardSingleProps {
  classificationId: number;
  anomalyId: string;
  author: string;
  tags?: string[];
  classificationConfig?: any; 
  enableNewCommentingMethod?: boolean;
  children?: React.ReactNode;
  commentStatus?: boolean;
};

export function SurveyorComments({
  classificationId,
  author,
  anomalyId, 
  classificationConfig,
  commentStatus,
//   onVote,
//   enableNewCommentingMethod = false,
}: PostCardSingleProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>("");

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [temperatureInputs, setTemperatureInputs] = useState<Record<string, string>>({});  
  const [densityInputs, setDensityInputs] = useState<Record<string, string>>({});  

  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const [surveyorComments, setSurveyorComments] = useState<any[]>([]);
  const [nonSurveyorComments, setNonSurveyorComments] = useState<any[]>([]);

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const handleConfirmComment = async (comment: CommentProps) => {
    if (!comment.configuration) return;
  
    try {
      const updatedConfig = {
        ...classificationConfig,
        ...comment.configuration,
      };
  
      const { error } = await supabase
        .from("classifications")
        .update({ classificationConfiguration: updatedConfig })
        .eq("id", classificationId);
  
      if (error) throw error;
  
      console.log("Confirmed comment configuration added:", comment.configuration);
    } catch (error) {
      console.error("Error confirming comment:", error);
    };
  };  

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("classification_id", classificationId)
        .eq("surveyor", "TRUE")
        .order("created_at", { ascending: false });

        if (classificationConfig?.classificationType === "telescope-minorPlanet" || classificationConfig?.classificationType === "planet") {
          const surveyor = comments.filter((comment) => comment.isSurveyor);
          const nonSurveyor = comments.filter((comment) => !comment.isSurveyor);
          setSurveyorComments(surveyor);
          setNonSurveyorComments(nonSurveyor);
        }

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: newComment,
            classification_id: classificationId,
            author: session?.user?.id,
            surveyor: "TRUE",
          },
        ]);

      if (error) throw error;

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    };
  };

  const handleProposePlanetType = async (planetType: "Terrestrial" | "Gaseous") => {
    const commentInput = commentInputs[classificationId];
  
    if (!commentInput?.trim()) {
      console.error("Comment input must be filled");
      return;
    }
  
    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: commentInput,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { planetType },
            surveyor: "TRUE",
            category: 'PlanetType'
          },
        ]);
  
      if (error) throw error;
  
      setCommentInputs((prev) => ({
        ...prev,
        [classificationId]: "",
      }));
  
      fetchComments();
    } catch (error) {
      console.error("Error inserting comment:", error);
    }
  };  

  const handleAddTemperatureComment = async () => {
    const temperatureInput1 = temperatureInputs[`${classificationId}-1`];
    const temperatureInput2 = temperatureInputs[`${classificationId}-2`];

    if (!temperatureInput1?.trim() || !temperatureInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${temperatureInput1}\n\n${temperatureInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { temperature: `${temperatureInput1}, ${temperatureInput2}` },
            surveyor: "TRUE",
            value: temperatureInput2,
            category: 'Temperature'
          },
        ]);

      if (error) throw error;
      setTemperatureInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
      }));
      fetchComments();
    } catch (error) {
      console.error("Error adding temperature comment:", error);
    };
  };

  const handleAddDensityComment = async () => {
    const densityInput1 = densityInputs[`${classificationId}-1`];
    const densityInput2 = densityInputs[`${classificationId}-2`];
  
    if (!densityInput1?.trim() || !densityInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }
  
    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${densityInput1}\n\n${densityInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { density: `${densityInput1}, ${densityInput2}` },
            surveyor: "TRUE",
            value: densityInput2,
            category: "Density",
          },
        ]);
  
      if (error) throw error;
  
      setDensityInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
      }));
  
      fetchComments();
    } catch (error) {
      console.error("Error adding density comment:", error);
    }
  };  

  // const handleSelectPreferredComment = async (commentId: number) => {
  //   const selectedComment = comments.find((comment) => comment.id === commentId);
  //   if (!selectedComment) return;

  //   const planetType = selectedComment.configuration?.planetType;
  //   if (!planetType) return;

  //   try {
  //     const { error } = await supabase
  //       .from("classifications")
  //       .update({
  //         classificationConfiguration: {
  //           ...classificationConfig,
  //           classificationOptions: {
  //             ...classificationConfig?.classificationOptions,
  //             planetType: [...(classificationConfig?.classificationOptions?.planetType || []), planetType],
  //           },
  //         },
  //       })
  //       .eq("id", classificationId);

  //     if (error) throw error;

  //     console.log("Preferred planet type updated:", planetType);
  //   } catch (error) {
  //     console.error("Error updating preferred comment:", error);
  //   };
  // };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground">
    {commentStatus !== false && (
      <CardContent>
        {/* <PlanetTempCalculator /> */}
        <div className="py-4 space-y-6">
          {/* Planet Type Proposal */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Textarea
                value={commentInputs[`${classificationId}-1`] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [`${classificationId}-1`]: e.target.value,
                  }))
                }
                placeholder="Discuss planet type"
                rows={3}
              />
              {/* <Textarea
                value={commentInputs[`${classificationId}-2`] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [`${classificationId}-2`]: e.target.value,
                  }))
                }
                placeholder="Propose a planet type (part 2)..."
                rows={3}
                className="w-1/2"
              /> */}
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleProposePlanetType("Terrestrial")}>
                Propose Terrestrial
              </Button>
              <Button onClick={() => handleProposePlanetType("Gaseous")}>
                Propose Gaseous
              </Button>
            </div>
          </div>

          {/* Temperature Proposal */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Textarea
                value={temperatureInputs[`${classificationId}-1`] || ""}
                onChange={(e) =>
                  setTemperatureInputs((prev) => ({
                    ...prev,
                    [`${classificationId}-1`]: e.target.value,
                  }))
                }
                placeholder="Discuss temperature"
                rows={3}
                className="w-1/2"
              />
              <Textarea
                value={temperatureInputs[`${classificationId}-2`] || ""}
                onChange={(e) =>
                  setTemperatureInputs((prev) => ({
                    ...prev,
                    [`${classificationId}-2`]: e.target.value,
                  }))
                }
                placeholder="Temperature value"
                rows={3}
                className="w-1/2"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddTemperatureComment}>
                Propose Temperature
              </Button>
            </div>
          </div>

          {/* Density */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Textarea
                value={densityInputs[`${classificationId}-1`] || ""}
                onChange={(e) =>
                  setDensityInputs((prev) => ({
                    ...prev,
                    [`${classificationId}-1`]: e.target.value,
                  }))
                }
                placeholder="Discuss density"
                rows={3}
                className="w-1/2"
              />
              <Textarea
                value={densityInputs[`${classificationId}-2`] || ""}
                onChange={(e) =>
                  setDensityInputs((prev) => ({
                    ...prev,
                    [`${classificationId}-2`]: e.target.value,
                  }))
                }
                placeholder="Density value"
                rows={3}
                className="w-1/2"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddDensityComment}>
                Propose Density
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6 space-y-2">
          {loadingComments ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                id={comment.id}
                author={comment.author}
                category={comment.category}
                content={comment.content}
                value={comment.value}
                createdAt={comment.created_at}
                replyCount={0}
                isSurveyor={comment.isSurveyor}
                configuration={comment.configuration}
                classificationId={classificationId}
                classificationConfig={classificationConfig}
              />
            ))
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </div>
      </CardContent>
    )}
  </Card>
  );
};

                      // <div className="flex justify-between items-center">
                      //   <p className="text-xs text-gray-600">
                      //     {comment.configuration?.planetType || "Unknown"}
                      //   </p>
                      //   {/* {author === session?.user?.id && (
                      //     <button
                      //       onClick={() => handleSelectPreferredComment(comment.id)}
                      //       className="text-blue-500 mt-2"
                      //     >
                      //       Mark as Preferred
                      //     </button>
                      //   )} */}
                      //   {author === session?.user?.id && comment.configuration && (
                      //     <button
                      //       onClick={() => handleConfirmComment(comment)}
                      //       className="text-green-500 mt-2"
                      //     >
                      //       Confirm
                      //     </button>
                      //   )}
                      // </div>