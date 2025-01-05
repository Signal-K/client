"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CommentCard } from "../Comments/CommentSingle";

interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
  configuration?: {
    planetType?: string;
  };
}

interface PostCardSingleProps {
  classificationId: number;
  title: string;
  anomalyId: string;
  author: string;
  content: string;
  votes: number;
  category: string;
  tags?: string[];
  classificationConfig?: any; 
  images: string[];
  classificationType: string;
  onVote?: () => void;
  enableNewCommentingMethod?: boolean;
  children?: React.ReactNode;
  commentStatus?: boolean;
}

export function PostCardSingle({
  classificationId,
  title,
  author,
  content,
  votes,
  category,
  tags,
  anomalyId, 
  classificationConfig,
  images,
  classificationType,
  commentStatus,
  onVote,
  enableNewCommentingMethod = false,
}: PostCardSingleProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState(votes);
  const [newComment, setNewComment] = useState<string>("");
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVoteClick = () => {
    if (onVote) onVote();
    setVoteCount((prev) => prev + 1);
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
          },
        ]);

      if (error) throw error;

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleProposePlanetType = async (planetType: "Terrestrial" | "Gaseous") => {
    const commentInput = commentInputs[classificationId];
    if (!commentInput) {
      console.error("Comment input is required");
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
          },
        ]);
      if (error) throw error;
      setCommentInputs((prev) => ({ ...prev, [classificationId]: "" }));
      fetchComments();
    } catch (error) {
      console.error("Error inserting comment:", error);
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
    <Card className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground border-primary">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">by {author}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{category}</Badge>
        <p>{content}</p>
        {images.length > 0 && (
          <div>
            <img src={images[0]} alt="Post Image" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button onClick={handleVoteClick} size="sm">
          <ThumbsUp className="mr-2" /> {voteCount}
        </Button>
        <Button size="sm">
          <MessageSquare className="mr-2" /> {comments.length}
        </Button>
      </CardFooter>
      {commentStatus !== false && (
        <CardContent>
          {enableNewCommentingMethod ? (
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
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment..."
                rows={3}
                className="w-full"
              />
              <Button onClick={handleAddComment} className="w-full">
                Submit Comment
              </Button>
            </div>
          )}
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
      >
        {enableNewCommentingMethod && (
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
        )}
      </CommentCard>
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