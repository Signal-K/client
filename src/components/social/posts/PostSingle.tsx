"use client";

import React, { useEffect, useState, useRef } from "react";
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";
import { CommentCard } from "../comments/CommentSingle";
import { SurveyorComments } from "./Surveyor/SurveyorPostCard";

export interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
  username?: string;
}

export interface PostCardSingleProps {
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
}: PostCardSingleProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState(votes);
  const [newComment, setNewComment] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

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

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const handleVoteClick = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/gameplay/social/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          anomalyId,
          voteType: "up",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Error inserting vote:", result?.error || "Unknown vote error");
        return;
      }
      if (result?.alreadyVoted) {
        return;
      }

      setVoteCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error handling vote:", error);
    }

    if (onVote) onVote();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch("/api/gameplay/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          classificationId,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Failed to add comment");
      }

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);

    const safeTitle = title || "post";
    const imgs = Array.from(shareCardRef.current.querySelectorAll("img"));
    const imagePromises = imgs.map((img: HTMLImageElement) =>
      new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image failed to load"));
        }
      })
    );

    try {
      await Promise.all(imagePromises);
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${safeTitle.toLowerCase().replace(/\s+/g, "-")}-share.png`;
          link.click();
        }
      }, "image/png");
    } catch (error) {
      console.error("Error sharing post: ", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div ref={shareCardRef}>
      <Card className="w-full mx-auto my-8 bg-card text-card-foreground border-primary">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {session && <AvatarGenerator author={session.user.id} />}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="relative col-span-1">
                <img
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  className="rounded-lg w-full h-auto"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2"
                    >
                      &#8594;
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            currentIndex === index ? "bg-white" : "bg-gray-400"
                          }`}
                        ></button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between space-x-2">
          <div className="flex gap-2">
            <Button onClick={handleVoteClick} size="sm">
              <ThumbsUp className="mr-2" /> {voteCount}
            </Button>
            <Button size="sm">
              <MessageSquare className="mr-2" /> {comments.length}
            </Button>
          </div>
          <Button
            onClick={handleShare}
            size="sm"
            disabled={isSharing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="mr-2" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </CardFooter>

        {commentStatus !== false && (
          <CardContent>
            {!showStats && (
              <div className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  rows={3}
                  className="w-full"
                />
                <CardFooter className="flex flex-col gap-2">
                  <Button onClick={handleAddComment} className="w-full">
                    Submit Comment
                  </Button>
                  <Button onClick={() => setShowStats(true)} variant="outline">
                    View or propose surveyor stats
                  </Button>
                </CardFooter>
              </div>
            )}

            {showStats ? (
              <div className="mt-4 space-y-2">
                <SurveyorComments
                  classificationId={classificationId}
                  author={author}
                  anomalyId={anomalyId}
                  classificationConfig={classificationConfig}
                  commentStatus={commentStatus}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {loadingComments ? (
                  <p>Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      id={comment.id}
                      author={comment.author}
                      content={comment.content}
                      createdAt={comment.created_at}
                      replyCount={0}
                      classificationId={classificationId}
                      parentCommentId={classificationId}
                    />
                  ))
                ) : (
                  <p>No comments yet. Be the first to comment!</p>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
