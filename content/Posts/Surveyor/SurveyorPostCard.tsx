"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CommentCard } from "@/content/Comments/CommentSingle";

interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
  isSurveyor?: boolean;
  configuration?: {
    planetType?: string;
  };
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
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [temperatureInput, setTemperatureInput] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const [surveyorComments, setSurveyorComments] = useState<any[]>([]);
  const [nonSurveyorComments, setNonSurveyorComments] = useState<any[]>([]);

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

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
            surveyor: "TRUE",
          },
        ]);
      if (error) throw error;
      setCommentInputs((prev) => ({ ...prev, [classificationId]: "" }));
      fetchComments();
    } catch (error) {
      console.error("Error inserting comment:", error);
    };
  };

  const handleAddTemperatureComment = async () => {
    if (!temperatureInput.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: temperatureInput,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { temperature: temperatureInput },
            surveyor: "TRUE",
          },
        ]);

      if (error) throw error;
      setTemperatureInput("");
      fetchComments();
    } catch (error) {
      console.error("Error adding temperature comment:", error);
    }
  };

  const handleSelectPreferredComment = async (commentId: number) => {
    const selectedComment = comments.find((comment) => comment.id === commentId);
    if (!selectedComment) return;

    const planetType = selectedComment.configuration?.planetType;
    if (!planetType) return;

    try {
      const { error } = await supabase
        .from("classifications")
        .update({
          classificationConfiguration: {
            ...classificationConfig,
            classificationOptions: {
              ...classificationConfig?.classificationOptions,
              planetType: [...(classificationConfig?.classificationOptions?.planetType || []), planetType],
            },
          },
        })
        .eq("id", classificationId);

      if (error) throw error;

      console.log("Preferred planet type updated:", planetType);
    } catch (error) {
      console.error("Error updating preferred comment:", error);
    };
  };

  return (
    <div ref={shareCardRef}>
      <Card className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground">
        {commentStatus !== false && (
          <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={commentInputs[classificationId] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [classificationId]: e.target.value }))
                  }
                  placeholder="Propose a planet type..."
                  rows={3}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <Button onClick={() => handleProposePlanetType("Terrestrial")}>
                    Propose Terrestrial
                  </Button>
                  <Button onClick={() => handleProposePlanetType("Gaseous")}>
                    Propose Gaseous
                  </Button>
                </div>

                <Textarea
                  value={temperatureInput}
                  onChange={(e) => setTemperatureInput(e.target.value)}
                  placeholder="Suggest a temperature..."
                  rows={3}
                  className="w-full"
                />
                <div className="flex space-x-2">
                  <Button onClick={handleAddTemperatureComment}>
                    Propose Temperature
                  </Button>
                </div>
              </div>
            <div className="mt-4 space-y-2">
              {loadingComments ? (
                <p>Loading comments...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    author={comment.author}
                    content={comment.content}
                    createdAt={comment.created_at}
                    replyCount={0}
                    parentCommentId={classificationId}
                    isSurveyor={comment.isSurveyor}
                    configuration={comment.configuration}
                  >
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600">
                          {comment.configuration?.planetType || "Unknown"}
                        </p>
                        {author === session?.user?.id && (
                          <button
                            onClick={() => handleSelectPreferredComment(comment.id)}
                            className="text-blue-500 mt-2"
                          >
                            Mark as Preferred
                          </button>
                        )}
                      </div>
                  </CommentCard>
                ))
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};